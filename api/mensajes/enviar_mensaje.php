<?php
/**
 * API para enviar un mensaje en una conversación existente
 */

// Incluir configuración de la base de datos y utilidades
require_once '../config/database.php';
require_once '../utils/auth.php';

// Configurar cabeceras
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Verificar si es una solicitud OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar método de solicitud
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
if (!isset($datos['conversacion_id']) || empty($datos['conversacion_id']) || 
    !isset($datos['receptor_id']) || empty($datos['receptor_id']) || 
    !isset($datos['mensaje']) || empty($datos['mensaje'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Se requiere el ID de la conversación, el ID del receptor y el mensaje']);
    exit;
}

$conversacion_id = intval($datos['conversacion_id']);
$receptor_id = intval($datos['receptor_id']);
$mensaje = trim($datos['mensaje']);

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
        echo json_encode(['error' => 'No tienes permiso para enviar mensajes en esta conversación']);
        exit;
    }
    
    // Verificar que el receptor sea parte de la conversación
    $query_receptor = "SELECT id FROM conversaciones 
                    WHERE id = ? AND (usuario1_id = ? OR usuario2_id = ?)";
    $stmt_receptor = $conn->prepare($query_receptor);
    $stmt_receptor->bind_param('iii', $conversacion_id, $receptor_id, $receptor_id);
    $stmt_receptor->execute();
    $resultado_receptor = $stmt_receptor->get_result();
    
    if ($resultado_receptor->num_rows === 0) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'El receptor no es parte de esta conversación']);
        exit;
    }
    
    // Iniciar transacción
    $conn->begin_transaction();
    
    // Insertar el mensaje
    $query_mensaje = "INSERT INTO mensajes (conversacion_id, remitente_id, receptor_id, contenido, fecha_creacion, leido) 
                    VALUES (?, ?, ?, ?, NOW(), 0)";
    $stmt_mensaje = $conn->prepare($query_mensaje);
    $stmt_mensaje->bind_param('iiis', $conversacion_id, $usuario_id, $receptor_id, $mensaje);
    $stmt_mensaje->execute();
    $mensaje_id = $conn->insert_id;
    
    // Actualizar fecha de la conversación
    $query_actualizar = "UPDATE conversaciones SET fecha_actualizacion = NOW() WHERE id = ?";
    $stmt_actualizar = $conn->prepare($query_actualizar);
    $stmt_actualizar->bind_param('i', $conversacion_id);
    $stmt_actualizar->execute();
    
    // Confirmar transacción
    $conn->commit();
    
    // Obtener datos del mensaje para la respuesta
    $query_datos = "SELECT id, conversacion_id, remitente_id, receptor_id, contenido, fecha_creacion, leido 
                    FROM mensajes WHERE id = ?";
    $stmt_datos = $conn->prepare($query_datos);
    $stmt_datos->bind_param('i', $mensaje_id);
    $stmt_datos->execute();
    $resultado_datos = $stmt_datos->get_result();
    $mensaje_datos = $resultado_datos->fetch_assoc();
    
    // Devolver respuesta
    echo json_encode([
        'status' => 'success',
        'mensaje' => $mensaje_datos
    ]);
    
} catch (Exception $e) {
    // Revertir transacción en caso de error
    if (isset($conn) && $conn->ping()) {
        $conn->rollback();
    }
    
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Error al enviar mensaje: ' . $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}