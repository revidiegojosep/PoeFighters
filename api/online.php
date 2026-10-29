<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$roomsDir = __DIR__ . '/../data/rooms';
if (!is_dir($roomsDir)) {
    mkdir($roomsDir, 0777, true);
}

// Limpieza automática de salas inactivas (más de 45 minutos)
if (rand(1, 20) === 1) {
    $now = time();
    $files = glob($roomsDir . '/*.json');
    if ($files) {
        foreach ($files as $f) {
            if ($now - filemtime($f) > 2700) {
                @unlink($f);
            }
        }
    }
}

$action = $_GET['action'] ?? '';
$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput, true) ?: [];

function sanitizeRoom($room, $token = null) {
    $copy = $room;
    $isHost = ($token && isset($copy['host_token']) && $copy['host_token'] === $token);
    $isGuest = ($token && isset($copy['guest_token']) && $copy['guest_token'] === $token);

    unset($copy['host_token']);
    unset($copy['guest_token']);

    // Blind pick (Pick Ciego): Ocultar el Pokémon que está eligiendo el rival durante char_select
    if (isset($copy['status']) && $copy['status'] === 'char_select') {
        if ($isHost) {
            if (isset($copy['p2']['dex'])) $copy['p2']['dex'] = null;
            if (isset($copy['char_select']['p2_dex'])) $copy['char_select']['p2_dex'] = null;
        } elseif ($isGuest) {
            if (isset($copy['p1']['dex'])) $copy['p1']['dex'] = null;
            if (isset($copy['char_select']['p1_dex'])) $copy['char_select']['p1_dex'] = null;
        } else {
            if (empty($copy['char_select']['p1_confirmed']) && isset($copy['p1']['dex'])) $copy['p1']['dex'] = null;
            if (empty($copy['char_select']['p2_confirmed']) && isset($copy['p2']['dex'])) $copy['p2']['dex'] = null;
        }
    }

    return $copy;
}

function getRoomFile($roomsDir, $code) {
    $cleanCode = preg_replace('/[^0-9]/', '', (string)$code);
    if (strlen($cleanCode) > 0 && strlen($cleanCode) < 4) {
        $cleanCode = sprintf("%04d", (int)$cleanCode);
    }
    if (strlen($cleanCode) !== 4) return null;
    return $roomsDir . '/' . $cleanCode . '.json';
}

function loadRoom($file) {
    if (!$file || !file_exists($file)) return null;

    // Reintentar lectura en caso de bloqueo concurrente (Windows errno 13)
    $attempts = 0;
    while ($attempts < 5) {
        $fp = @fopen($file, 'rb');
        if ($fp) {
            @flock($fp, LOCK_SH);
            $content = '';
            while (!feof($fp)) {
                $content .= fread($fp, 8192);
            }
            @flock($fp, LOCK_UN);
            @fclose($fp);
            if ($content !== '') {
                $data = json_decode($content, true);
                if (is_array($data)) return $data;
            }
        }
        $attempts++;
        usleep(15000); // 15ms
    }

    $content = @file_get_contents($file);
    return $content ? json_decode($content, true) : null;
}

function saveRoom($file, $room) {
    if (!$file) return;
    $room['updated_at'] = microtime(true);
    $data = json_encode($room, JSON_PRETTY_PRINT);
    
    // Escritura segura atómica para Windows
    $tmp = $file . '.' . uniqid('w_', true);
    if (@file_put_contents($tmp, $data, LOCK_EX) !== false) {
        if (!@rename($tmp, $file)) {
            @copy($tmp, $file);
            @unlink($tmp);
        }
    } else {
        @file_put_contents($file, $data, LOCK_EX);
    }
}

// -----------------------------------------------------------------------------
// 1. CREAR SALA (Host)
// -----------------------------------------------------------------------------
if ($action === 'create_room' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $dex = (int)($payload['dex'] ?? 25);
    $validDex = [25, 6, 1, 312, 94, 39, 700, 398, 773];
    if (!in_array($dex, $validDex)) $dex = 25;

    // Generar código único aleatorio de 4 dígitos
    $attempts = 0;
    do {
        $code = sprintf("%04d", rand(1000, 9999));
        $file = $roomsDir . '/' . $code . '.json';
        $attempts++;
    } while (file_exists($file) && $attempts < 50);

    $hostToken = bin2hex(random_bytes(16));

    // Limpiar posibles residuos de estados anteriores del mismo código
    @unlink($roomsDir . '/' . $code . '_p1.json');
    @unlink($roomsDir . '/' . $code . '_p2.json');

    $room = [
        'code' => $code,
        'match_id' => 1,
        'status' => 'waiting', // waiting | lobby | char_select | item_draft | playing | ended
        'created_at' => time(),
        'updated_at' => microtime(true),
        'host_token' => $hostToken,
        'guest_token' => null,
        'stage' => (function() use ($payload) {
            $validStages = ['BATTLEFIELD', 'CINNABAR_ISLAND', 'POWER_PLANT', 'LUMIOSE_CITY', 'FINAL_DESTINATION', 'LAVENDER_TOWER'];
            $req = $payload['stage'] ?? 'RANDOM';
            if ($req === 'RANDOM' || !in_array($req, $validStages)) {
                return $validStages[array_rand($validStages)];
            }
            return $req;
        })(),
        'rules' => [
            'itemsEnabled' => isset($payload['itemsEnabled']) ? (bool)$payload['itemsEnabled'] : true,
            'timeLimit' => 300, // 5 Minutos (Regla Oficial)
            'stocks' => 3       // 3 Vidas (Regla Oficial)
        ],
        'p1' => [
            'id' => 'p1',
            'name' => 'Jugador 1 (Host)',
            'dex' => $dex,
            'item' => null,
            'ready' => false,
            'last_seen' => microtime(true)
        ],
        'p2' => null,
        'signaling' => [
            'offer' => null,
            'answer' => null,
            'candidates_p1' => [],
            'candidates_p2' => []
        ],
        'char_select' => [
            'started_at' => 0,
            'duration' => 30, // 30 Segundos
            'p1_dex' => $dex,
            'p2_dex' => 1,
            'p1_confirmed' => false,
            'p2_confirmed' => false
        ],
        'item_draft' => [
            'started_at' => 0,
            'duration' => 20, // 20 Segundos
            'p1_choice' => null,
            'p2_choice' => null
        ],
        'battle_state' => [
            'started_at' => 0,
            'p1_state' => null,
            'p2_state' => null
        ],
        'anticheat' => [
            'p1_flags' => 0,
            'p2_flags' => 0,
            'desync_count' => 0
        ]
    ];

    saveRoom($file, $room);

    echo json_encode([
        'success' => true,
        'code' => $code,
        'host_token' => $hostToken,
        'player' => 'p1',
        'room' => sanitizeRoom($room)
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// 2. UNIRSE A SALA (Guest)
// -----------------------------------------------------------------------------
if ($action === 'join_room' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $code = $payload['code'] ?? '';
    $file = getRoomFile($roomsDir, $code);
    $room = loadRoom($file);

    if (!$room) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Sala no encontrada. Comprueba el código de 4 dígitos.']);
        exit;
    }

    if ($room['status'] !== 'waiting') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'La sala ya está completa o la partida ya ha comenzado.']);
        exit;
    }

    $dex = (int)($payload['dex'] ?? 1);
    $validDex = [25, 6, 1, 312, 94, 39, 700, 398, 773];
    if (!in_array($dex, $validDex)) $dex = 1;

    $guestToken = bin2hex(random_bytes(16));
    $room['guest_token'] = $guestToken;
    $room['status'] = 'lobby'; // Ambos conectados
    $room['p2'] = [
        'id' => 'p2',
        'name' => 'Jugador 2 (Rival)',
        'dex' => $dex,
        'item' => null,
        'ready' => false,
        'last_seen' => microtime(true)
    ];
    if (isset($room['char_select'])) {
        $room['char_select']['p2_dex'] = $dex;
    }

    saveRoom($file, $room);

    echo json_encode([
        'success' => true,
        'code' => $code,
        'guest_token' => $guestToken,
        'player' => 'p2',
        'room' => sanitizeRoom($room)
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// 3. OBTENER ESTADO DE LA SALA (Polling & Heartbeat)
// -----------------------------------------------------------------------------
if ($action === 'get_room') {
    $code = $_GET['code'] ?? $payload['code'] ?? '';
    $token = $_GET['token'] ?? $payload['token'] ?? '';
    $cleanCode = preg_replace('/[^0-9]/', '', (string)$code);
    if (strlen($cleanCode) > 0 && strlen($cleanCode) < 4) {
        $cleanCode = sprintf("%04d", (int)$cleanCode);
    }
    $file = getRoomFile($roomsDir, $cleanCode);
    $room = loadRoom($file);

    if (!$room) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Sala no encontrada']);
        exit;
    }

    // Actualizar heartbeat si el token coincide
    $isHost = ($token && isset($room['host_token']) && $token === $room['host_token']);
    $isGuest = ($token && isset($room['guest_token']) && $token === $room['guest_token']);
    $now = microtime(true);

    if ($isHost && isset($room['p1'])) {
        $room['p1']['last_seen'] = $now;
    } elseif ($isGuest && isset($room['p2'])) {
        $room['p2']['last_seen'] = $now;
    }

    // 🚪 DETECCIÓN DE ABANDONO: Si un jugador se desconecta prolongadamente
    if (in_array($room['status'], ['lobby', 'char_select', 'item_draft', 'playing'])) {
        $p1Seen = $room['p1']['last_seen'] ?? 0;
        $p2Seen = $room['p2']['last_seen'] ?? 0;
        $timeout = 35.0; // 35 segundos de tolerancia para acomodar cambios de pestaña y WebRTC

        if ($room['status'] === 'playing' || $room['status'] === 'item_draft' || $room['status'] === 'char_select') {
            if ($p1Seen > 0 && ($now - $p1Seen > $timeout)) {
                $room['status'] = 'abandoned';
                $room['abandoned_by'] = 'p1';
            } elseif ($p2Seen > 0 && ($now - $p2Seen > $timeout)) {
                $room['status'] = 'abandoned';
                $room['abandoned_by'] = 'p2';
            }
        }
    }

    // ⏱️ Verificar si la cuenta atrás de 30s de Selección de Personajes ha expirado o ambos confirmaron
    if ($room['status'] === 'char_select') {
        $elapsed = $now - ($room['char_select']['started_at'] ?: $now);
        $bothConfirmed = !empty($room['char_select']['p1_confirmed']) && !empty($room['char_select']['p2_confirmed']);
        if ($elapsed >= ($room['char_select']['duration'] ?? 30) || $bothConfirmed) {
            if (isset($room['p1'])) $room['p1']['dex'] = $room['char_select']['p1_dex'] ?? ($room['p1']['dex'] ?? 25);
            if (isset($room['p2'])) $room['p2']['dex'] = $room['char_select']['p2_dex'] ?? ($room['p2']['dex'] ?? 1);

            if (!empty($room['rules']['itemsEnabled'])) {
                $room['status'] = 'item_draft';
                $room['item_draft']['started_at'] = $now;
                $room['item_draft']['duration'] = 20;
                $room['item_draft']['p1_choice'] = null;
                $room['item_draft']['p2_choice'] = null;
            } else {
                $room['status'] = 'playing';
                $room['battle_state']['started_at'] = $now;
                if (isset($room['p1'])) $room['p1']['item'] = null;
                if (isset($room['p2'])) $room['p2']['item'] = null;
            }
        }
    }

    // Verificar si el tiempo de draft de 20s ha expirado
    if ($room['status'] === 'item_draft') {
        $elapsed = $now - ($room['item_draft']['started_at'] ?: $now);
        if ($elapsed >= $room['item_draft']['duration'] || ($room['item_draft']['p1_choice'] !== null && $room['item_draft']['p2_choice'] !== null)) {
            $room['status'] = 'playing';
            $room['battle_state']['started_at'] = $now;
            // Si no eligieron, asignar ítems por defecto o null
            if (isset($room['p1'])) $room['p1']['item'] = $room['item_draft']['p1_choice'] ?: 'restos';
            if (isset($room['p2'])) $room['p2']['item'] = $room['item_draft']['p2_choice'] ?: 'banda_focus';
        }
    }

    saveRoom($file, $room);

    echo json_encode([
        'success' => true,
        'room' => sanitizeRoom($room, $token),
        'is_host' => $isHost,
        'is_guest' => $isGuest,
        'abandoned' => ($room['status'] === 'abandoned'),
        'abandoned_by' => $room['abandoned_by'] ?? null
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// 4. ACTUALIZAR AJUSTES DE SALA (Solo Anfitrión)
// -----------------------------------------------------------------------------
if ($action === 'update_settings' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $code = $payload['code'] ?? '';
    $token = $payload['token'] ?? '';
    $file = getRoomFile($roomsDir, $code);
    $room = loadRoom($file);

    if (!$room || $room['host_token'] !== $token) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Acceso denegado: solo el anfitrión puede modificar los ajustes.']);
        exit;
    }

    if (isset($payload['itemsEnabled'])) {
        $room['rules']['itemsEnabled'] = (bool)$payload['itemsEnabled'];
    }
    if (isset($payload['stage'])) {
        $st = (string)$payload['stage'];
        $validStages = ['BATTLEFIELD', 'CINNABAR_ISLAND', 'POWER_PLANT', 'LUMIOSE_CITY', 'FINAL_DESTINATION', 'LAVENDER_TOWER'];
        if ($st === 'RANDOM' || !in_array($st, $validStages)) {
            $room['stage'] = $validStages[array_rand($validStages)];
        } else {
            $room['stage'] = $st;
        }
    }

    saveRoom($file, $room);

    echo json_encode(['success' => true, 'room' => sanitizeRoom($room)]);
    exit;
}

// -----------------------------------------------------------------------------
// 4.5. DARLE A LISTO / READY (Ambos jugadores deben confirmar para iniciar 30s de selección)
// -----------------------------------------------------------------------------
if ($action === 'set_ready' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $code = $payload['code'] ?? '';
    $token = $payload['token'] ?? '';
    $ready = !empty($payload['ready']);

    $file = getRoomFile($roomsDir, $code);
    $room = loadRoom($file);

    if (!$room) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Sala no encontrada']);
        exit;
    }

    $isHost = ($room['host_token'] === $token);
    $isGuest = ($room['guest_token'] === $token);
    if (!$isHost && !$isGuest) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Token inválido']);
        exit;
    }

    if ($isHost && isset($room['p1'])) {
        $room['p1']['ready'] = $ready;
    } elseif ($isGuest && isset($room['p2'])) {
        $room['p2']['ready'] = $ready;
    }

    // Si ambos están conectados y ambos le han dado a listo: Inicia la cuenta atrás de 30 segundos
    if (!empty($room['p1']) && !empty($room['p2']) && !empty($room['p1']['ready']) && !empty($room['p2']['ready'])) {
        $room['status'] = 'char_select';
        $now = microtime(true);
        @unlink($roomsDir . '/' . $code . '_p1.json');
        @unlink($roomsDir . '/' . $code . '_p2.json');
        $room['char_select'] = [
            'started_at' => $now,
            'duration' => 30, // 30 Segundos oficiales
            'p1_dex' => $room['p1']['dex'] ?? 25,
            'p2_dex' => $room['p2']['dex'] ?? 1,
            'p1_confirmed' => false,
            'p2_confirmed' => false
        ];
    }

    saveRoom($file, $room);

    echo json_encode(['success' => true, 'room' => sanitizeRoom($room)]);
    exit;
}

// -----------------------------------------------------------------------------
// 4.55. SOLICITAR REVANCHA (Ambos jugadores pueden cambiar de personaje)
// -----------------------------------------------------------------------------
if ($action === 'rematch' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $code = $payload['code'] ?? '';
    $token = $payload['token'] ?? '';
    $file = getRoomFile($roomsDir, $code);
    $room = loadRoom($file);

    if (!$room) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Sala no encontrada.']);
        exit;
    }

    $isHost = ($room['host_token'] === $token);
    $isGuest = ($room['guest_token'] === $token);

    if (!$isHost && !$isGuest) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Acceso denegado: token no válido.']);
        exit;
    }

    if (!isset($room['rematch']) || !is_array($room['rematch'])) {
        $room['rematch'] = ['p1' => false, 'p2' => false];
    }

    if ($isHost) {
        $room['rematch']['p1'] = true;
    } elseif ($isGuest) {
        $room['rematch']['p2'] = true;
    }

    $cleanCode = preg_replace('/[^0-9]/', '', (string)$code);
    if (strlen($cleanCode) > 0 && strlen($cleanCode) < 4) {
        $cleanCode = sprintf("%04d", (int)$cleanCode);
    }

    // Si ambos han solicitado revancha, reiniciar a selección de personajes desde 0
    if (!empty($room['rematch']['p1']) && !empty($room['rematch']['p2'])) {
        $now = microtime(true);
        $room['status'] = 'char_select';

        // Al hacer revancha se cambia el mapa aleatoriamente a uno distinto
        $validStages = ['BATTLEFIELD', 'CINNABAR_ISLAND', 'POWER_PLANT', 'LUMIOSE_CITY', 'FINAL_DESTINATION', 'LAVENDER_TOWER'];
        $currentStage = $room['stage'] ?? 'BATTLEFIELD';
        $otherStages = array_values(array_diff($validStages, [$currentStage]));
        $room['match_id'] = ($room['match_id'] ?? 1) + 1;
        $room['stage'] = !empty($otherStages) ? $otherStages[array_rand($otherStages)] : $validStages[array_rand($validStages)];
        $room['rematch'] = ['p1' => false, 'p2' => false];
        $room['char_select'] = [
            'started_at' => $now,
            'duration' => 30,
            'p1_dex' => $room['p1']['dex'] ?? 25,
            'p2_dex' => $room['p2']['dex'] ?? 1,
            'p1_confirmed' => false,
            'p2_confirmed' => false
        ];
        if (isset($room['p1'])) {
            $room['p1']['ready'] = true;
            $room['p1']['item'] = null;
        }
        if (isset($room['p2'])) {
            $room['p2']['ready'] = true;
            $room['p2']['item'] = null;
        }
        $room['battle_state'] = [
            'started_at' => 0,
            'ended_at' => 0,
            'p1' => ['percent' => 0, 'stocks' => 3],
            'p2' => ['percent' => 0, 'stocks' => 3]
        ];
        @unlink($roomsDir . '/' . $cleanCode . '_p1.json');
        @unlink($roomsDir . '/' . $cleanCode . '_p2.json');
    }

    saveRoom($file, $room);

    echo json_encode([
        'success' => true,
        'room' => sanitizeRoom($room, $token),
        'rematch_ready' => ($room['status'] === 'char_select')
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// 4.6. SELECCIONAR / CONFIRMAR LUCHADOR EN LA CUENTA ATRÁS DE 30s (Host o Guest)
// -----------------------------------------------------------------------------
if ($action === 'select_fighter' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $code = $payload['code'] ?? '';
    $token = $payload['token'] ?? '';
    $dex = (int)($payload['dex'] ?? 25);
    $confirmed = !empty($payload['confirmed']);
    $validDex = [25, 6, 1, 312, 94, 39, 700, 398, 773];
    if (!in_array($dex, $validDex)) $dex = 25;

    $file = getRoomFile($roomsDir, $code);
    $room = loadRoom($file);

    if (!$room) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Sala no encontrada']);
        exit;
    }

    $isHost = ($room['host_token'] === $token);
    $isGuest = ($room['guest_token'] === $token);
    if (!$isHost && !$isGuest) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Token inválido']);
        exit;
    }

    if (!isset($room['char_select']) || !is_array($room['char_select'])) {
        $room['char_select'] = [
            'started_at' => microtime(true),
            'duration' => 30,
            'p1_dex' => 25,
            'p2_dex' => 1,
            'p1_confirmed' => false,
            'p2_confirmed' => false
        ];
    }

    if ($isHost && isset($room['p1'])) {
        $room['p1']['dex'] = $dex;
        $room['char_select']['p1_dex'] = $dex;
        if ($confirmed) $room['char_select']['p1_confirmed'] = true;
    } elseif ($isGuest && isset($room['p2'])) {
        $room['p2']['dex'] = $dex;
        $room['char_select']['p2_dex'] = $dex;
        if ($confirmed) $room['char_select']['p2_confirmed'] = true;
    }

    // Si ambos ya confirmaron su personaje durante char_select, avanzar inmediatamente
    if ($room['status'] === 'char_select' && !empty($room['char_select']['p1_confirmed']) && !empty($room['char_select']['p2_confirmed'])) {
        $now = microtime(true);
        if (!empty($room['rules']['itemsEnabled'])) {
            $room['status'] = 'item_draft';
            $room['item_draft']['started_at'] = $now;
            $room['item_draft']['duration'] = 20;
            $room['item_draft']['p1_choice'] = null;
            $room['item_draft']['p2_choice'] = null;
        } else {
            $room['status'] = 'playing';
            $room['battle_state']['started_at'] = $now;
            if (isset($room['p1'])) $room['p1']['item'] = null;
            if (isset($room['p2'])) $room['p2']['item'] = null;
        }
    }

    saveRoom($file, $room);

    echo json_encode(['success' => true, 'room' => sanitizeRoom($room)]);
    exit;
}

// -----------------------------------------------------------------------------
// 5. INICIAR COMBATE (Solo Anfitrión)
// -----------------------------------------------------------------------------
if ($action === 'start_game' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $code = $payload['code'] ?? '';
    $token = $payload['token'] ?? '';
    $file = getRoomFile($roomsDir, $code);
    $room = loadRoom($file);

    if (!$room || $room['host_token'] !== $token) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Acceso denegado: solo el anfitrión puede iniciar la partida.']);
        exit;
    }

    if (!$room['p2']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No puedes iniciar sin un oponente conectado.']);
        exit;
    }

    // Actualizar dex del anfitrión si se envió en el payload al iniciar
    if (isset($payload['dex'])) {
        $dex = (int)$payload['dex'];
        $validDex = [25, 6, 1, 312, 94, 39, 700, 398, 773];
        if (in_array($dex, $validDex) && isset($room['p1'])) {
            $room['p1']['dex'] = $dex;
        }
    }

    $now = microtime(true);
    // Si es con objetos, activar ventana de draft de 20 segundos
    if (!empty($room['rules']['itemsEnabled'])) {
        $room['status'] = 'item_draft';
        $room['item_draft']['started_at'] = $now;
        $room['item_draft']['duration'] = 20;
        $room['item_draft']['p1_choice'] = null;
        $room['item_draft']['p2_choice'] = null;
    } else {
        // Sin objetos: comenzar inmediatamente
        $room['status'] = 'playing';
        $room['battle_state']['started_at'] = $now;
        if (isset($room['p1'])) $room['p1']['item'] = null;
        if (isset($room['p2'])) $room['p2']['item'] = null;
    }

    saveRoom($file, $room);

    echo json_encode(['success' => true, 'room' => sanitizeRoom($room)]);
    exit;
}

// -----------------------------------------------------------------------------
// 6. ELEGIR OBJETO EN EL DRAFT DE 20s
// -----------------------------------------------------------------------------
if (($action === 'pick_item' || $action === 'pick_draft_item') && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $code = $payload['code'] ?? '';
    $token = $payload['token'] ?? '';
    $itemId = $payload['item_id'] ?? '';
    $file = getRoomFile($roomsDir, $code);
    $room = loadRoom($file);

    if (!$room || $room['status'] !== 'item_draft') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'El draft de objetos no está activo.']);
        exit;
    }

    // Lista canónica de ítems válidos (Anti-tampering)
    $validItems = ['restos', 'banda_focus', 'cinta_elegida', 'gafas_especiales', 'baya_zidra', 'perla_grande'];
    if (!in_array($itemId, $validItems)) {
        $itemId = 'restos';
    }

    if ($room['host_token'] === $token) {
        $room['item_draft']['p1_choice'] = $itemId;
        $room['p1']['item'] = $itemId;
    } elseif ($room['guest_token'] === $token) {
        $room['item_draft']['p2_choice'] = $itemId;
        $room['p2']['item'] = $itemId;
    } else {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Token de jugador no válido.']);
        exit;
    }

    // Si ambos ya escogieron, pasar a playing inmediatamente
    if ($room['item_draft']['p1_choice'] !== null && $room['item_draft']['p2_choice'] !== null) {
        $room['status'] = 'playing';
        $room['battle_state']['started_at'] = microtime(true);
    }

    saveRoom($file, $room);

    echo json_encode(['success' => true, 'room' => sanitizeRoom($room)]);
    exit;
}

// -----------------------------------------------------------------------------
// 7. WEBRTC SIGNALING (SDP Offer, Answer & ICE Candidates)
// -----------------------------------------------------------------------------
if ($action === 'signal' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $code = $payload['code'] ?? '';
    $token = $payload['token'] ?? '';
    $type = $payload['type'] ?? '';
    $data = $payload['data'] ?? null;

    $file = getRoomFile($roomsDir, $code);
    $room = loadRoom($file);
    if (!$room) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Sala no encontrada']);
        exit;
    }

    $isHost = ($room['host_token'] === $token);
    $isGuest = ($room['guest_token'] === $token);
    if (!$isHost && !$isGuest) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Token inválido']);
        exit;
    }

    if ($type === 'offer' && $isHost) {
        $room['signaling']['offer'] = $data;
    } elseif ($type === 'answer' && $isGuest) {
        $room['signaling']['answer'] = $data;
    } elseif ($type === 'candidate') {
        if ($isHost) {
            $room['signaling']['candidates_p1'][] = $data;
        } else {
            $room['signaling']['candidates_p2'][] = $data;
        }
    }

    saveRoom($file, $room);

    echo json_encode(['success' => true, 'signaling' => $room['signaling']]);
    exit;
}

// -----------------------------------------------------------------------------
// 8. FALLBACK SYNC & ANTI-CHEAT VALIDATION (Atomic Dedicated State Files)
// -----------------------------------------------------------------------------
if ($action === 'sync' || $action === 'sync_state') {
    $code = $payload['code'] ?? $_GET['code'] ?? $_POST['code'] ?? '';
    $token = $payload['token'] ?? $_GET['token'] ?? $_POST['token'] ?? '';
    $state = $payload['state'] ?? [];

    $cleanCode = preg_replace('/[^0-9]/', '', (string)$code);
    if (strlen($cleanCode) > 0 && strlen($cleanCode) < 4) {
        $cleanCode = sprintf("%04d", (int)$cleanCode);
    }
    if (strlen($cleanCode) !== 4) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Código de sala no válido']);
        exit;
    }

    $file = getRoomFile($roomsDir, $cleanCode);
    $room = loadRoom($file);
    if (!$room) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Sala no encontrada']);
        exit;
    }

    $isHost = ($room['host_token'] === $token);
    $isGuest = ($room['guest_token'] === $token);
    if (!$isHost && !$isGuest) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Token inválido']);
        exit;
    }

    // 🛡️ ANTI-CHEAT SERVER-SIDE VALIDATION
    if (!empty($state)) {
        // Validar stocks: nunca pueden superar 3
        if (isset($state['stocks'])) {
            $state['stocks'] = min(3, max(0, (int)$state['stocks']));
        }
        // Validar percent: rango 0% a 999%
        if (isset($state['percent'])) {
            $state['percent'] = min(999, max(0, (float)$state['percent']));
        }
    }

    $now = microtime(true);
    $myFile = $roomsDir . '/' . $cleanCode . ($isHost ? '_p1.json' : '_p2.json');
    $rivalFile = $roomsDir . '/' . $cleanCode . ($isHost ? '_p2.json' : '_p1.json');

    // 1. Guardar de forma atómica y aislada el estado del jugador en su archivo dedicado
    if (!empty($state)) {
        file_put_contents($myFile, json_encode([
            't' => $now,
            'state' => $state
        ]), LOCK_EX);
    }

    // 2. Leer atómicamente el estado del rival sin colisiones de escritura
    $rivalState = null;
    $rivalSeen = 0;
    if (file_exists($rivalFile)) {
        $rivalContent = @file_get_contents($rivalFile);
        if ($rivalContent) {
            $rivalData = json_decode($rivalContent, true);
            if ($rivalData && isset($rivalData['state'])) {
                // Validación de rol cruzado: garantizar que el paquete leído es auténticamente del rival
                $expectedRivalRole = $isHost ? 'guest' : 'host';
                if (!isset($rivalData['state']['role']) || $rivalData['state']['role'] === $expectedRivalRole) {
                    $rivalState = $rivalData['state'];
                    $rivalSeen = (float)($rivalData['t'] ?? 0);
                }
            }
        }
    }

    // Verificar si la sala fue abandonada
    if ($room['status'] === 'abandoned') {
        echo json_encode([
            'success' => false,
            'status' => 'abandoned',
            'abandoned' => true,
            'abandoned_by' => $room['abandoned_by'] ?? null
        ]);
        exit;
    }

    // Verificar desconexión prolongada del rival (> 35 segundos para acomodar sesiones P2P de WebRTC)
    if ($rivalSeen > 0 && ($now - $rivalSeen > 35.0)) {
        $room['status'] = 'abandoned';
        $room['abandoned_by'] = $isHost ? 'p2' : 'p1';
        saveRoom($file, $room);
        echo json_encode([
            'success' => false,
            'status' => 'abandoned',
            'abandoned' => true,
            'abandoned_by' => $room['abandoned_by']
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'rival_state' => $rivalState,
        'rivalState' => $rivalState,
        'status' => $room['status']
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// 9. ABANDONAR O SALIR DE LA SALA (Cierre Inmediato)
// -----------------------------------------------------------------------------
if ($action === 'leave_room') {
    $code = $payload['code'] ?? $_GET['code'] ?? '';
    $token = $payload['token'] ?? $_GET['token'] ?? '';
    $cleanCode = preg_replace('/[^0-9]/', '', (string)$code);

    $file = getRoomFile($roomsDir, $code);
    $room = loadRoom($file);

    if ($room) {
        $isHost = ($room['host_token'] === $token);
        $isGuest = ($room['guest_token'] === $token);

        if ($isHost || $isGuest) {
            $room['status'] = 'abandoned';
            $room['abandoned_by'] = $isHost ? 'p1' : 'p2';
            saveRoom($file, $room);
        }
    }

    if (strlen($cleanCode) === 4) {
        @unlink($roomsDir . '/' . $cleanCode . '_p1.json');
        @unlink($roomsDir . '/' . $cleanCode . '_p2.json');
    }

    echo json_encode(['success' => true, 'status' => 'abandoned']);
    exit;
}

// Acción desconocida
http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Acción no válida']);
