<?php
// router.php - Router script for PHP Built-in Server with ngrok support
$reqUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($reqUri, PHP_URL_PATH);
$path = urldecode($path);

// Normalize /PokeFighters prefix if present
if (strpos($path, '/PokeFighters') === 0) {
    $path = substr($path, strlen('/PokeFighters'));
    if ($path === '' || $path === '/') {
        $path = '/index.php';
    }
}

if ($path === '' || $path === '/') {
    $path = '/index.php';
}

$target = __DIR__ . $path;

if (file_exists($target) && !is_dir($target)) {
    $ext = strtolower(pathinfo($target, PATHINFO_EXTENSION));
    
    if ($ext === 'php') {
        include $target;
        return;
    }

    $contentTypes = [
        'css'   => 'text/css',
        'js'    => 'application/javascript',
        'json'  => 'application/json',
        'png'   => 'image/png',
        'jpg'   => 'image/jpeg',
        'jpeg'  => 'image/jpeg',
        'gif'   => 'image/gif',
        'svg'   => 'image/svg+xml',
        'webp'  => 'image/webp',
        'mp3'   => 'audio/mpeg',
        'wav'   => 'audio/wav',
        'ogg'   => 'audio/ogg',
        'ico'   => 'image/x-icon',
        'woff'  => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf'   => 'font/ttf',
        'html'  => 'text/html'
    ];

    if (isset($contentTypes[$ext])) {
        header('Content-Type: ' . $contentTypes[$ext]);
    }
    header('Cache-Control: public, max-age=3600');
    readfile($target);
    return;
}

// Fallback to index.php
include __DIR__ . '/index.php';
