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

function sanitizeRoom($room) {
    $copy = $room;
    unset($copy['host_token']);
    unset($copy['guest_token']);
    return $copy;
}

function getRoomFile($roomsDir, $code) {
    $cleanCode = preg_replace('/[^0-9]/', '', (string)$code);
    if (strlen($cleanCode) !== 4) return null;
    return $roomsDir . '/' . $cleanCode . '.json';
}

function loadRoom($file) {
    if (!$file || !file_exists($file)) return null;
    $content = file_get_contents($file);
    return json_decode($content, true);
}

function saveRoom($file, $room) {
    $room['updated_at'] = microtime(true);
    file_put_contents($file, json_encode($room, JSON_PRETTY_PRINT), LOCK_EX);
}

// -----------------------------------------------------------------------------
// 1. CREAR SALA (Host)
// -----------------------------------------------------------------------------
if ($action === 'create_room' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $dex = (int)($payload['dex'] ?? 25);
    $validDex = [25, 1, 312, 94, 39];
    if (!in_array($dex, $validDex)) $dex = 25;

    // Generar código único aleatorio de 4 dígitos
    $attempts = 0;
    do {
        $code = sprintf("%04d", rand(1000, 9999));
        $file = $roomsDir . '/' . $code . '.json';
        $attempts++;
    } while (file_exists($file) && $attempts < 50);

    $hostToken = bin2hex(random_bytes(16));

    $room = [
        'code' => $code,
        'status' => 'waiting', // waiting | lobby | item_draft | playing | ended
        'created_at' => time(),
        'updated_at' => microtime(true),
        'host_token' => $hostToken,
        'guest_token' => null,
        'stage' => $payload['stage'] ?? 'BATTLEFIELD',
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
            'ready' => true,
            'last_seen' => microtime(true)
        ],
        'p2' => null,
        'signaling' => [
            'offer' => null,
            'answer' => null,
            'candidates_p1' => [],
            'candidates_p2' => []
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
    $validDex = [25, 1, 312, 94, 39];
    if (!in_array($dex, $validDex)) $dex = 1;

    $guestToken = bin2hex(random_bytes(16));
    $room['guest_token'] = $guestToken;
    $room['status'] = 'lobby'; // Ambos conectados
    $room['p2'] = [
        'id' => 'p2',
        'name' => 'Jugador 2 (Rival)',
        'dex' => $dex,
        'item' => null,
        'ready' => true,
        'last_seen' => microtime(true)
    ];

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
    $file = getRoomFile($roomsDir, $code);
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

    // 🚪 DETECCIÓN DE ABANDONO: Si un jugador se desconecta durante draft o partida
    if (in_array($room['status'], ['lobby', 'item_draft', 'playing'])) {
        $p1Seen = $room['p1']['last_seen'] ?? 0;
        $p2Seen = $room['p2']['last_seen'] ?? 0;
        $timeout = 4.5; // 4.5 segundos sin señales

        if ($room['status'] === 'playing' || $room['status'] === 'item_draft') {
            if ($p1Seen > 0 && ($now - $p1Seen > $timeout)) {
                $room['status'] = 'abandoned';
                $room['abandoned_by'] = 'p1';
            } elseif ($p2Seen > 0 && ($now - $p2Seen > $timeout)) {
                $room['status'] = 'abandoned';
                $room['abandoned_by'] = 'p2';
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
        'room' => sanitizeRoom($room),
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
        $room['stage'] = (string)$payload['stage'];
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
if ($action === 'pick_item' && $_SERVER['REQUEST_METHOD'] === 'POST') {
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
// 8. FALLBACK SYNC & ANTI-CHEAT VALIDATION
// -----------------------------------------------------------------------------
if ($action === 'sync' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $code = $payload['code'] ?? '';
    $token = $payload['token'] ?? '';
    $state = $payload['state'] ?? [];

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
    if ($isHost) {
        $room['battle_state']['p1_state'] = $state;
        if (isset($room['p1'])) $room['p1']['last_seen'] = $now;
    } else {
        $room['battle_state']['p2_state'] = $state;
        if (isset($room['p2'])) $room['p2']['last_seen'] = $now;
    }

    // Verificar si la sala ya fue abandonada
    if ($room['status'] === 'abandoned') {
        saveRoom($file, $room);
        echo json_encode([
            'success' => false,
            'status' => 'abandoned',
            'abandoned' => true,
            'abandoned_by' => $room['abandoned_by'] ?? null
        ]);
        exit;
    }

    // Verificar si el rival se desconectó (> 4.5 segundos)
    $rivalSeen = $isHost ? ($room['p2']['last_seen'] ?? 0) : ($room['p1']['last_seen'] ?? 0);
    if ($rivalSeen > 0 && ($now - $rivalSeen > 4.5)) {
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

    saveRoom($file, $room);

    echo json_encode([
        'success' => true,
        'rival_state' => $isHost ? $room['battle_state']['p2_state'] : $room['battle_state']['p1_state'],
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

    echo json_encode(['success' => true, 'status' => 'abandoned']);
    exit;
}

// Acción desconocida
http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Acción no válida']);
