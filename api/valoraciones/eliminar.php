<?php
/**
 * API para eliminar una valoración
 * 
 * Este endpoint permite a un usuario eliminar su propia valoración
 * o a un administrador eliminar cualquier valoración.
 */

// Cabeceras necesarias
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Permitir métodos DELETE y GET (para compatibilidad)
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

// Incluir archivos de configuración y conexión
require_once '../config/database.php';
require_once '../utils/auth.php';

// Verificar si el usuario está autenticado
$usuario = verificarAutenticacion();
if (!$usuario) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario no autenticado']);
    exit();
}

$usuario_id = $usuario['id'];
$es_admin = $usuario['rol'] === 'admin';

// Verificar si se proporcionó un ID de valoración
if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Se requiere un ID de valoración']);
    exit();
}

$valoracion_id = $_GET['id'];

// Crear conexión a la base de datos
$conexion = obtenerConexion();

// Verificar conexión
if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $conexion->connect_error]);
    exit();
}

// Escapar datos para prevenir SQL injection
$valoracion_id = $conexion->real_escape_string($valoracion_id);

// Verificar que la valoración existe
$sql_verificar = "SELECT id, usuario_id FROM valoraciones WHERE id = ?";
$stmt_verificar = $conexion->prepare($sql_verificar);
$stmt_verificar->bind_param('i', $valoracion_id);
$stmt_verificar->execute();
$resultado_verificar = $stmt_verificar->get_result();

if ($resultado_verificar->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Valoración no encontrada']);
    exit();
}

$valoracion = $resultado_verificar->fetch_assoc();

// Verificar permisos: solo el propietario o un administrador pueden eliminar
if ($valoracion['usuario_id'] != $usuario_id && !$es_admin) {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permiso para eliminar esta valoración']);
    exit();
}

// Eliminar la valoración
$sql_eliminar = "DELETE FROM valoraciones WHERE id = ?";
$stmt_eliminar = $conexion->prepare($sql_eliminar);
$stmt_eliminar->bind_param('i', $valoracion_id);

if ($stmt_eliminar->execute()) {
    echo json_encode([
        'mensaje' => 'Valoración eliminada con éxito',
        'id' => $valoracion_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al eliminar la valoración: ' . $conexion->error]);
}

// Cerrar conexiones
$stmt_verificar->close();
$stmt_eliminar->close();
$conexion->close();