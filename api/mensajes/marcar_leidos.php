<?php
/**
 * API para marcar los mensajes de una conversación como leídos
 */

// Incluir configuración de la base de datos y utilidades
require_once '../config/database.php';
require_once '../utils/auth.php';

// Configurar cabeceras
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Verificar si es una solicitud OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar método de solicitud
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
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

// Obtener datos de la solicitud
$datos = json_decode(file_get_contents('php://input'), true);

// Verificar datos requeridos
if (!isset($datos['conversacion_id']) || empty($datos['conversacion_id'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Se requiere el ID de la conversación']);
    exit;
}

$conversacion_id = intval($datos['conversacion_id']);

try {
    // Conectar a la base de datos
    $conn = obtenerConexion();
    
    // Verificar que el usuario sea parte de la conversación
    $query_verificar = "SELECT id FROM conversaciones 
                        WHERE id = ? AND (usuario1_id = ? OR usuario2_id = ?)";
    $stmt_verificar = $conn->prepare($query_verificar);
    $stmt_verificar->bind_param('iii', $conversacion_id, $usuario_id, $usuario_id);
    $stmt_verificar->execute();
    $resultado_verificar = $stmt_verificar->get_result();
    
    if ($resultado_verificar->num_rows === 0) {
        http_response_code(403); // Forbidden
        echo json_encode(['error' => 'No tienes permiso para acceder a esta conversación']);
        exit;
    }
    
    // Marcar mensajes como leídos
    $query = "UPDATE mensajes SET leido = 1 
              WHERE conversacion_id = ? AND receptor_id = ? AND leido = 0";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('ii', $conversacion_id, $usuario_id);
    $stmt->execute();
    
    $mensajes_actualizados = $stmt->affected_rows;
    
    // Devolver respuesta
    echo json_encode([
        'status' => 'success',
        'mensajes_actualizados' => $mensajes_actualizados
    ]);
    
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Error al marcar mensajes como leídos: ' . $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}