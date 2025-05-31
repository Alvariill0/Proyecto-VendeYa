<?php
/**
 * API para crear una nueva valoración de producto
 * 
 * Este endpoint permite a un usuario autenticado crear una valoración
 * para un producto específico, verificando que el usuario haya comprado
 * el producto y que no lo haya valorado anteriormente.
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
if (!isset($datos['producto_id']) || !isset($datos['puntuacion'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Se requieren producto_id y puntuacion']);
    exit();
}

// Validar puntuación (entre 1 y 5)
if ($datos['puntuacion'] < 1 || $datos['puntuacion'] > 5) {
    http_response_code(400);
    echo json_encode(['error' => 'La puntuación debe estar entre 1 y 5']);
    exit();
}

// Crear conexión a la base de datos
$conexion = obtenerConexion();

// Verificar conexión
if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $conexion->connect_error]);
    exit();
}

// Escapar datos para prevenir SQL injection
$producto_id = $conexion->real_escape_string($datos['producto_id']);
$puntuacion = $conexion->real_escape_string($datos['puntuacion']);
$comentario = isset($datos['comentario']) ? $conexion->real_escape_string($datos['comentario']) : '';

// Verificar que el producto existe
$sql_verificar_producto = "SELECT id FROM productos WHERE id = ?";
$stmt_verificar_producto = $conexion->prepare($sql_verificar_producto);
$stmt_verificar_producto->bind_param('i', $producto_id);
$stmt_verificar_producto->execute();
$resultado_verificar_producto = $stmt_verificar_producto->get_result();

if ($resultado_verificar_producto->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Producto no encontrado']);
    exit();
}

// Verificar que el usuario ha comprado el producto
$sql_verificar_compra = "SELECT COUNT(*) as ha_comprado FROM pedidos p 
                         JOIN pedido_items pi ON p.id = pi.pedido_id 
                         WHERE p.usuario_id = ? AND pi.producto_id = ? AND p.estado != 'cancelado'";
$stmt_verificar_compra = $conexion->prepare($sql_verificar_compra);
$stmt_verificar_compra->bind_param('ii', $usuario_id, $producto_id);
$stmt_verificar_compra->execute();
$resultado_verificar_compra = $stmt_verificar_compra->get_result();
$fila_verificar_compra = $resultado_verificar_compra->fetch_assoc();

if ($fila_verificar_compra['ha_comprado'] == 0) {
    http_response_code(403);
    echo json_encode(['error' => 'Solo puedes valorar productos que hayas comprado']);
    exit();
}

// Verificar que el usuario no haya valorado ya este producto
$sql_verificar_valoracion = "SELECT id FROM valoraciones WHERE usuario_id = ? AND producto_id = ?";
$stmt_verificar_valoracion = $conexion->prepare($sql_verificar_valoracion);
$stmt_verificar_valoracion->bind_param('ii', $usuario_id, $producto_id);
$stmt_verificar_valoracion->execute();
$resultado_verificar_valoracion = $stmt_verificar_valoracion->get_result();

if ($resultado_verificar_valoracion->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Ya has valorado este producto']);
    exit();
}

// Insertar la valoración
$sql_insertar = "INSERT INTO valoraciones (producto_id, usuario_id, puntuacion, comentario) VALUES (?, ?, ?, ?)";
$stmt_insertar = $conexion->prepare($sql_insertar);
$stmt_insertar->bind_param('iiis', $producto_id, $usuario_id, $puntuacion, $comentario);

if ($stmt_insertar->execute()) {
    $valoracion_id = $conexion->insert_id;
    
    // Obtener la valoración recién creada con datos del usuario
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
        'mensaje' => 'Valoración creada con éxito',
        'valoracion' => $valoracion
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al crear la valoración: ' . $conexion->error]);
}

// Cerrar conexiones
$stmt_verificar_producto->close();
$stmt_verificar_compra->close();
$stmt_verificar_valoracion->close();
$stmt_insertar->close();
if (isset($stmt_obtener)) $stmt_obtener->close();
$conexion->close();