<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

session_start();

// Guardar algo en la sesión
$_SESSION['test'] = 'test_value';

// Devolver información sobre la sesión
echo json_encode([
    'session_id' => session_id(),
    'test_value' => $_SESSION['test'],
    'all_session' => $_SESSION
]);