<?php
/**
 * API para obtener los mensajes de una conversación específica
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

// Verificar si se proporcionó el ID de la conversación
if (!isset($_GET['conversacion_id']) || empty($_GET['conversacion_id'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Se requiere el ID de la conversación']);
    exit;
}

$conversacion_id = intval($_GET['conversacion_id']);

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
    
    // Consulta para obtener los mensajes de la conversación
    $query = "SELECT m.id, m.conversacion_id, m.remitente_id, m.receptor_id, 
              m.contenido, m.fecha_creacion, m.leido
              FROM mensajes m
              WHERE m.conversacion_id = ?
              ORDER BY m.fecha_creacion ASC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $conversacion_id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    $mensajes = [];
    while ($fila = $resultado->fetch_assoc()) {
        $mensajes[] = $fila;
    }
    
    // Devolver respuesta
    echo json_encode([
        'status' => 'success',
        'mensajes' => $mensajes
    ]);
    
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Error al obtener mensajes: ' . $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}