<?php
/**
 * API para listar valoraciones de un producto
 * 
 * Este endpoint devuelve todas las valoraciones de un producto específico
 * junto con la información del usuario que realizó cada valoración.
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

// Crear conexión a la base de datos
$conexion = obtenerConexion();

// Verificar conexión
if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $conexion->connect_error]);
    exit();
}

// Verificar si se proporcionó un ID de producto
if (!isset($_GET['producto_id']) || empty($_GET['producto_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Se requiere un ID de producto']);
    exit();
}

$producto_id = $conexion->real_escape_string($_GET['producto_id']);

// Consulta para obtener las valoraciones del producto con información del usuario
$sql = "SELECT v.id, v.producto_id, v.usuario_id, v.puntuacion, v.comentario, v.fecha, 
        u.nombre as usuario_nombre 
        FROM valoraciones v 
        JOIN usuarios u ON v.usuario_id = u.id 
        WHERE v.producto_id = ? 
        ORDER BY v.fecha DESC";

$stmt = $conexion->prepare($sql);
$stmt->bind_param('i', $producto_id);
$stmt->execute();
$resultado = $stmt->get_result();

$valoraciones = [];
while ($fila = $resultado->fetch_assoc()) {
    // Formatear la fecha para mejor legibilidad
    $fila['fecha_formateada'] = date('d/m/Y H:i', strtotime($fila['fecha']));
    $valoraciones[] = $fila;
}

// Calcular la puntuación promedio
$puntuacion_promedio = 0;
$total_valoraciones = count($valoraciones);

if ($total_valoraciones > 0) {
    $suma_puntuaciones = array_sum(array_column($valoraciones, 'puntuacion'));
    $puntuacion_promedio = round($suma_puntuaciones / $total_valoraciones, 1);
}

// Devolver las valoraciones y estadísticas
echo json_encode([
    'valoraciones' => $valoraciones,
    'estadisticas' => [
        'total' => $total_valoraciones,
        'promedio' => $puntuacion_promedio
    ]
]);

$stmt->close();
$conexion->close();