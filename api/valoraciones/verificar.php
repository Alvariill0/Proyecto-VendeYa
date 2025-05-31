<?php
/**
 * API para verificar si un usuario ha valorado un producto
 * 
 * Este endpoint verifica si el usuario autenticado ya ha valorado
 * un producto específico y devuelve la valoración si existe.
 */

// Cabeceras necesarias
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Solo permitir método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

// Verificar si se proporcionó un ID de producto
if (!isset($_GET['producto_id']) || empty($_GET['producto_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Se requiere un ID de producto']);
    exit();
}

$producto_id = $_GET['producto_id'];

// Crear conexión a la base de datos
$conexion = obtenerConexion();

// Verificar conexión
if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $conexion->connect_error]);
    exit();
}

// Escapar datos para prevenir SQL injection
$producto_id = $conexion->real_escape_string($producto_id);

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

// Verificar si el usuario ha comprado el producto (requisito para valorar)
$sql_verificar_compra = "SELECT COUNT(*) as ha_comprado FROM pedidos p 
                         JOIN pedido_items pi ON p.id = pi.pedido_id 
                         WHERE p.usuario_id = ? AND pi.producto_id = ? AND p.estado != 'cancelado'";
$stmt_verificar_compra = $conexion->prepare($sql_verificar_compra);
$stmt_verificar_compra->bind_param('ii', $usuario_id, $producto_id);
$stmt_verificar_compra->execute();
$resultado_verificar_compra = $stmt_verificar_compra->get_result();
$fila_verificar_compra = $resultado_verificar_compra->fetch_assoc();

$puede_valorar = $fila_verificar_compra['ha_comprado'] > 0;

// Buscar si el usuario ya ha valorado este producto
$sql_buscar_valoracion = "SELECT v.id, v.producto_id, v.usuario_id, v.puntuacion, v.comentario, v.fecha, 
                          u.nombre as usuario_nombre 
                          FROM valoraciones v 
                          JOIN usuarios u ON v.usuario_id = u.id 
                          WHERE v.usuario_id = ? AND v.producto_id = ?";
$stmt_buscar_valoracion = $conexion->prepare($sql_buscar_valoracion);
$stmt_buscar_valoracion->bind_param('ii', $usuario_id, $producto_id);
$stmt_buscar_valoracion->execute();
$resultado_buscar_valoracion = $stmt_buscar_valoracion->get_result();

$ha_valorado = $resultado_buscar_valoracion->num_rows > 0;
$valoracion = null;

if ($ha_valorado) {
    $valoracion = $resultado_buscar_valoracion->fetch_assoc();
    // Formatear la fecha
    $valoracion['fecha_formateada'] = date('d/m/Y H:i', strtotime($valoracion['fecha']));
}

// Devolver el resultado
echo json_encode([
    'puede_valorar' => $puede_valorar,
    'ha_valorado' => $ha_valorado,
    'valoracion' => $valoracion
]);

// Cerrar conexiones
$stmt_verificar_producto->close();
$stmt_verificar_compra->close();
$stmt_buscar_valoracion->close();
$conexion->close();