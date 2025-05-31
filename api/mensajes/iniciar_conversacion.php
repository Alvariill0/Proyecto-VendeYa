<?php
/**
 * API para iniciar una nueva conversación con otro usuario
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
if (!isset($datos['receptor_id']) || empty($datos['receptor_id']) || 
    !isset($datos['mensaje']) || empty($datos['mensaje'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Se requiere el ID del receptor y el mensaje']);
    exit;
}

$receptor_id = intval($datos['receptor_id']);
$mensaje = trim($datos['mensaje']);

// Verificar que el receptor exista y no sea el mismo usuario
if ($receptor_id === $usuario_id) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'No puedes iniciar una conversación contigo mismo']);
    exit;
}

try {
    // Conectar a la base de datos
    $conn = obtenerConexion();
    
    // Verificar que el receptor exista
    $query_verificar = "SELECT id, nombre, email FROM usuarios WHERE id = ?";
    $stmt_verificar = $conn->prepare($query_verificar);
    $stmt_verificar->bind_param('i', $receptor_id);
    $stmt_verificar->execute();
    $resultado_verificar = $stmt_verificar->get_result();
    
    if ($resultado_verificar->num_rows === 0) {
        http_response_code(404); // Not Found
        echo json_encode(['error' => 'El usuario receptor no existe']);
        exit;
    }
    
    $receptor = $resultado_verificar->fetch_assoc();
    
    // Verificar si ya existe una conversación entre estos usuarios
    $query_conversacion = "SELECT id FROM conversaciones 
            WHERE (usuario1_id = ? AND usuario2_id = ?) 
            OR (usuario1_id = ? AND usuario2_id = ?)";
    $stmt_conversacion = $conn->prepare($query_conversacion);
    $stmt_conversacion->bind_param('iiii', $usuario_id, $receptor_id, $receptor_id, $usuario_id);
    $stmt_conversacion->execute();
    $resultado_conversacion = $stmt_conversacion->get_result();
    
    // Iniciar transacción
    $conn->begin_transaction();
    
    if ($resultado_conversacion->num_rows > 0) {
        // Si ya existe una conversación, usarla
        $conversacion = $resultado_conversacion->fetch_assoc();
        $conversacion_id = $conversacion['id'];
        
        // Actualizar fecha de la conversación
        $query_actualizar = "UPDATE conversaciones SET fecha_actualizacion = NOW() WHERE id = ?";
        $stmt_actualizar = $conn->prepare($query_actualizar);
        $stmt_actualizar->bind_param('i', $conversacion_id);
        $stmt_actualizar->execute();
    } else {
        // Crear nueva conversación
        $query_crear = "INSERT INTO conversaciones (usuario1_id, usuario2_id, fecha_creacion, fecha_actualizacion) 
                        VALUES (?, ?, NOW(), NOW())";
        $stmt_crear = $conn->prepare($query_crear);
        $stmt_crear->bind_param('ii', $usuario_id, $receptor_id);
        $stmt_crear->execute();
        $conversacion_id = $conn->insert_id;
    }
    
    // Insertar el mensaje
    $query_mensaje = "INSERT INTO mensajes (conversacion_id, remitente_id, receptor_id, contenido, fecha_creacion, leido) 
                      VALUES (?, ?, ?, ?, NOW(), 0)";
    $stmt_mensaje = $conn->prepare($query_mensaje);
    $stmt_mensaje->bind_param('iiis', $conversacion_id, $usuario_id, $receptor_id, $mensaje);
    $stmt_mensaje->execute();
    $mensaje_id = $conn->insert_id;
    
    // Confirmar transacción
    $conn->commit();
    
    // Obtener datos de la conversación para la respuesta
    $query_datos = "SELECT c.id, c.fecha_creacion, c.fecha_actualizacion, 
                    ? AS otro_usuario_id, ? AS otro_usuario_nombre, 
                    ? AS ultimo_mensaje, 0 AS mensajes_no_leidos
                    FROM conversaciones c WHERE c.id = ?";
    $stmt_datos = $conn->prepare($query_datos);
    $stmt_datos->bind_param('issi', $receptor_id, $receptor['nombre'], $mensaje, $conversacion_id);
    $stmt_datos->execute();
    $resultado_datos = $stmt_datos->get_result();
    $conversacion_datos = $resultado_datos->fetch_assoc();
    
    // Devolver respuesta
    echo json_encode([
        'status' => 'success',
        'conversacion' => $conversacion_datos,
        'usuario' => [
            'id' => $receptor['id'],
            'nombre' => $receptor['nombre'],
            'email' => $receptor['email']
        ],
        'mensaje' => [
            'id' => $mensaje_id,
            'conversacion_id' => $conversacion_id,
            'remitente_id' => $usuario_id,
            'receptor_id' => $receptor_id,
            'contenido' => $mensaje,
            'fecha_creacion' => date('Y-m-d H:i:s'),
            'leido' => 0
        ]
    ]);
    
} catch (Exception $e) {
    // Revertir transacción en caso de error
    if (isset($conn) && $conn->ping()) {
        $conn->rollback();
    }
    
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Error al iniciar conversación: ' . $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}