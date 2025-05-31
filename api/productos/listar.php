<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Conectar a la base de datos
$conexion = new mysqli('localhost', 'root', '', 'vendeya');

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $conexion->connect_error]);
    exit();
}

// Obtener el ID de categoría si se proporciona en la URL (GET)
$categoria_id = isset($_GET['categoria_id']) ? $_GET['categoria_id'] : null;

// Obtener el ID del vendedor si se proporciona en la URL (GET)
$vendedor_id = isset($_GET['vendedor_id']) ? $_GET['vendedor_id'] : null;

// Verificar si se deben incluir productos con stock 0 (útil para historial de pedidos)
$incluir_stock_cero = isset($_GET['incluir_stock_cero']) && $_GET['incluir_stock_cero'] === 'true';

// Consulta base para obtener productos
// Incluimos el nombre del vendedor (nombre de la tabla usuarios) y el stock
$sql = "SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen, p.stock, u.nombre as vendedor_nombre FROM productos p JOIN usuarios u ON p.vendedor_id = u.id";

// Añadir filtro por categoría si se proporciona un categoria_id
if ($categoria_id !== null) {
    // Para incluir subcategorías, necesitamos obtener todos los IDs de subcategoría de la categoría principal.
    $categoria_ids_a_incluir = [$categoria_id]; // Incluir la categoría principal

    // Consulta para obtener IDs de subcategorías (directas e indirectas)
    // Esto podría optimizarse para bases de datos grandes.
    $sql_subcategorias = "SELECT id FROM categorias WHERE parent_id = ?";
    $stmt_sub = $conexion->prepare($sql_subcategorias);
    $stmt_sub->bind_param('i', $categoria_id);
    $stmt_sub->execute();
    $resultado_sub = $stmt_sub->get_result();

    while ($fila_sub = $resultado_sub->fetch_assoc()) {
        $categoria_ids_a_incluir[] = $fila_sub['id'];

        $sql_sub_subcategorias = "SELECT id FROM categorias WHERE parent_id = ?";
        $stmt_sub_sub = $conexion->prepare($sql_sub_subcategorias);
        $stmt_sub_sub->bind_param('i', $fila_sub['id']);
        $stmt_sub_sub->execute();
        $resultado_sub_sub = $stmt_sub_sub->get_result();
        while ($fila_sub_sub = $resultado_sub_sub->fetch_assoc()) {
            $categoria_ids_a_incluir[] = $fila_sub_sub['id'];
        }
        $stmt_sub_sub->close();

    }
    $stmt_sub->close();

    // Construir la cláusula WHERE con todos los IDs relevantes
    $placeholders = implode(', ', array_fill(0, count($categoria_ids_a_incluir), '?'));
    $sql .= " WHERE p.categoria_id IN ($placeholders)";
    
    // Filtrar productos con stock 0 a menos que se indique lo contrario
    if (!$incluir_stock_cero) {
        $sql .= " AND p.stock > 0";
    }
}

// Si hay filtro por vendedor_id
if ($vendedor_id !== null) {
    // Si ya tenemos una cláusula WHERE (por categoría)
    if (strpos($sql, 'WHERE') !== false) {
        $sql .= " AND p.vendedor_id = ?";
    } else {
        $sql .= " WHERE p.vendedor_id = ?";
    }
}

// Si no hay filtro por categoría ni vendedor, añadir la condición WHERE para el stock
if ($categoria_id === null && $vendedor_id === null) {
    // Filtrar productos con stock 0 a menos que se indique lo contrario
    if (!$incluir_stock_cero) {
        $sql .= " WHERE p.stock > 0";
    }
}

// Añadir ordenación (opcional)
$sql .= " ORDER BY p.created_at DESC";

// Preparar la consulta principal
$stmt = $conexion->prepare($sql);

// Preparar los parámetros para bind_param
$params = [];
$types = '';

// Si hay filtro por categoría
if ($categoria_id !== null) {
    // Añadir los IDs de categoría a los parámetros
    $types .= str_repeat('i', count($categoria_ids_a_incluir));
    $params = array_merge($params, $categoria_ids_a_incluir);
}

// Si hay filtro por vendedor
if ($vendedor_id !== null) {
    $types .= 'i';
    $params[] = $vendedor_id;
}

// Si hay parámetros, hacer bind_param
if (!empty($params)) {
    // Crear un array de referencias para bind_param
    $bindParams = array();
    $bindParams[] = &$types;
    
    // Añadir referencias a cada parámetro
    foreach ($params as $key => $value) {
        $bindParams[] = &$params[$key];
    }
    
    // Usar call_user_func_array para pasar los parámetros dinámicamente
    call_user_func_array([$stmt, 'bind_param'], $bindParams);
}

// Ejecutar la consulta
$stmt->execute();
$resultado = $stmt->get_result();

$productos = [];

if ($resultado->num_rows > 0) {
    // Recorrer resultados y añadirlos al array
while($fila = $resultado->fetch_assoc()) {
    // Asegurarse de que la ruta de la imagen sea accesible desde el frontend
    if ($fila['imagen']) {
        // Si es una URL externa (http o https), mantenerla igual
        if (strpos($fila['imagen'], 'http://') === 0 || strpos($fila['imagen'], 'https://') === 0) {
            // No modificar URLs externas
        } 
        // Si no tiene barra inicial, añadirla para que sea una ruta absoluta
        else if (substr($fila['imagen'], 0, 1) !== '/') {
            $fila['imagen'] = '/' . $fila['imagen'];
        }
    }
    $productos[] = $fila;
}
}

// Devolver los productos en formato JSON
echo json_encode($productos);

$stmt->close();
$conexion->close();
?>