<?php
/**
 * API para obtener el número de mensajes no leídos del usuario
 */

// Incluir configuración de la base de datos y utilidades
require_once '../config/database.php';
require_once '../utils/auth.php';

// Configurar cabeceras
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Verificar si es una solicitud OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar método de solicitud
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Verificar autenticación
$usuario = verificarAutenticacion();
if (!$usuario) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Usuario no autenticado']);
    exit;
}

// Obtener ID del usuario actual
$usuario_id = $usuario['id'];

try {
    // Conectar a la base de datos
    $conn = obtenerConexion();
    
    // Consulta para obtener el número de mensajes no leídos
    $query = "SELECT COUNT(*) AS no_leidos FROM mensajes 
              WHERE receptor_id = ? AND leido = 0";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $usuario_id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $fila = $resultado->fetch_assoc();
    
    // Devolver respuesta
    echo json_encode([
        'status' => 'success',
        'no_leidos' => intval($fila['no_leidos'])
    ]);
    
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Error al obtener mensajes no leídos: ' . $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}