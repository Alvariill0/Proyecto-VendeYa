<?php
/**
 * API para listar las conversaciones del usuario actual
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
    
    // Consulta para obtener las conversaciones del usuario
    $query = "SELECT c.id, c.fecha_creacion, c.fecha_actualizacion, 
              CASE 
                WHEN c.usuario1_id = ? THEN c.usuario2_id 
                ELSE c.usuario1_id 
              END AS otro_usuario_id,
              CASE 
                WHEN c.usuario1_id = ? THEN u2.nombre 
                ELSE u1.nombre 
              END AS otro_usuario_nombre,
              m.contenido AS ultimo_mensaje,
              (SELECT COUNT(*) FROM mensajes 
               WHERE conversacion_id = c.id 
               AND receptor_id = ? 
               AND leido = 0) AS mensajes_no_leidos
              FROM conversaciones c
              JOIN usuarios u1 ON c.usuario1_id = u1.id
              JOIN usuarios u2 ON c.usuario2_id = u2.id
              LEFT JOIN mensajes m ON m.id = (
                SELECT MAX(id) FROM mensajes 
                WHERE conversacion_id = c.id
              )
              WHERE c.usuario1_id = ? OR c.usuario2_id = ?
              ORDER BY c.fecha_actualizacion DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('iiiii', $usuario_id, $usuario_id, $usuario_id, $usuario_id, $usuario_id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    $conversaciones = [];
    while ($fila = $resultado->fetch_assoc()) {
        $conversaciones[] = $fila;
    }
    
    // Devolver respuesta
    echo json_encode([
        'status' => 'success',
        'conversaciones' => $conversaciones
    ]);
    
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Error al obtener conversaciones: ' . $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}