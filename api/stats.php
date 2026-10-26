<?php
header('Content-Type: application/json');

$dataFile = __DIR__ . '/../data/records.json';
$dataDir = dirname($dataFile);

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0777, true);
}

if (!file_exists($dataFile)) {
    $initialData = [
        'maxCombo' => 0,
        'totalKOs' => 0,
        'totalDamage' => 0,
        'favoriteFighter' => 'Pikachu',
        'history' => []
    ];
    file_put_contents($dataFile, json_encode($initialData, JSON_PRETTY_PRINT));
}

$action = $_GET['action'] ?? 'get';

if ($action === 'save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if ($payload) {
        $current = json_decode(file_get_contents($dataFile), true) ?: [];
        if (isset($payload['maxCombo']) && $payload['maxCombo'] > ($current['maxCombo'] ?? 0)) {
            $current['maxCombo'] = (int)$payload['maxCombo'];
        }
        if (isset($payload['totalDamage'])) {
            $current['totalDamage'] = ($current['totalDamage'] ?? 0) + (int)$payload['totalDamage'];
        }
        if (isset($payload['kos'])) {
            $current['totalKOs'] = ($current['totalKOs'] ?? 0) + (int)$payload['kos'];
        }
        file_put_contents($dataFile, json_encode($current, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'records' => $current]);
        exit;
    }
}

$current = json_decode(file_get_contents($dataFile), true) ?: [];
echo json_encode(['success' => true, 'records' => $current]);
