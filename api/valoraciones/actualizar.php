<?php
/**
 * API para actualizar una valoración existente
 * 
 * Este endpoint permite a un usuario actualizar su valoración previa
 * de un producto, verificando que sea el propietario de la valoración.
 */

// Cabeceras necesarias
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

// Obtener datos del cuerpo de la petición
$datos = json_decode(file_get_contents("php://input"), true);

// Verificar datos requeridos
if (!isset($datos['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Se requiere el ID de la valoración']);
    exit();
}

// Validar puntuación si se proporciona
if (isset($datos['puntuacion']) && ($datos['puntuacion'] < 1 || $datos['puntuacion'] > 5)) {
    http_response_code(400);
    echo json_encode(['error' => 'La puntuación debe estar entre 1 y 5']);
    exit();
}

// Crear conexión a la base de datos
$conexion = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Verificar conexión
if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $conexion->connect_error]);
    exit();
}

// Escapar datos para prevenir SQL injection
$valoracion_id = $conexion->real_escape_string($datos['id']);

// Verificar que la valoración existe y pertenece al usuario
$sql_verificar = "SELECT id, producto_id FROM valoraciones WHERE id = ? AND usuario_id = ?";
$stmt_verificar = $conexion->prepare($sql_verificar);
$stmt_verificar->bind_param('ii', $valoracion_id, $usuario_id);
$stmt_verificar->execute();
$resultado_verificar = $stmt_verificar->get_result();

if ($resultado_verificar->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Valoración no encontrada o no tienes permiso para modificarla']);
    exit();
}

$valoracion_actual = $resultado_verificar->fetch_assoc();
$producto_id = $valoracion_actual['producto_id'];

// Construir la consulta de actualización
$campos_actualizar = [];
$tipos = '';
$valores = [];

if (isset($datos['puntuacion'])) {
    $campos_actualizar[] = 'puntuacion = ?';
    $tipos .= 'i';
    $valores[] = $datos['puntuacion'];
}

if (isset($datos['comentario'])) {
    $campos_actualizar[] = 'comentario = ?';
    $tipos .= 's';
    $valores[] = $datos['comentario'];
}

// Si no hay campos para actualizar
if (empty($campos_actualizar)) {
    http_response_code(400);
    echo json_encode(['error' => 'No se proporcionaron campos para actualizar']);
    exit();
}

// Añadir ID de valoración a los parámetros
$tipos .= 'i';
$valores[] = $valoracion_id;

// Construir y ejecutar la consulta de actualización
$sql_actualizar = "UPDATE valoraciones SET " . implode(', ', $campos_actualizar) . " WHERE id = ?";
$stmt_actualizar = $conexion->prepare($sql_actualizar);

// Vincular parámetros dinámicamente
$ref_valores = [];
foreach ($valores as $k => $v) {
    $ref_valores[$k] = &$valores[$k];
}

call_user_func_array([$stmt_actualizar, 'bind_param'], array_merge([$tipos], $ref_valores));

if ($stmt_actualizar->execute()) {
    // Obtener la valoración actualizada con datos del usuario
    $sql_obtener = "SELECT v.id, v.producto_id, v.usuario_id, v.puntuacion, v.comentario, v.fecha, 
                    u.nombre as usuario_nombre 
                    FROM valoraciones v 
                    JOIN usuarios u ON v.usuario_id = u.id 
                    WHERE v.id = ?";
    $stmt_obtener = $conexion->prepare($sql_obtener);
    $stmt_obtener->bind_param('i', $valoracion_id);
    $stmt_obtener->execute();
    $resultado_obtener = $stmt_obtener->get_result();
    $valoracion = $resultado_obtener->fetch_assoc();
    
    // Formatear la fecha
    $valoracion['fecha_formateada'] = date('d/m/Y H:i', strtotime($valoracion['fecha']));
    
    echo json_encode([
        'mensaje' => 'Valoración actualizada con éxito',
        'valoracion' => $valoracion
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al actualizar la valoración: ' . $conexion->error]);
}

// Cerrar conexiones
$stmt_verificar->close();
$stmt_actualizar->close();
if (isset($stmt_obtener)) $stmt_obtener->close();
$conexion->close();