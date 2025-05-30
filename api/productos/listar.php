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

// Consulta base para obtener productos
// Incluimos el nombre del vendedor (nombre de la tabla usuarios)
$sql = "SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen, u.nombre as vendedor_nombre FROM productos p JOIN usuarios u ON p.vendedor_id = u.id";

// Añadir filtro por categoría si se proporciona un categoria_id
if ($categoria_id !== null) {
    // Para incluir subcategorías, necesitamos obtener todos los IDs de subcategoría de la categoría principal.
    // Esto se puede hacer con una consulta recursiva o una serie de consultas.
    // Por ahora, implementaremos una versión simple que obtiene todas las subcategorías directas e indirectas.

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

        // Opcional: buscar sub-subcategorías si es necesario. 
        // Para una jerarquía profunda, una función recursiva en PHP o una consulta CTE en SQL sería mejor.
        // Por simplicidad, aquí solo obtenemos un nivel. Para obtener todos los niveles, necesitaríamos más lógica.
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
}

// Añadir ordenación (opcional)
$sql .= " ORDER BY p.created_at DESC";

// Preparar la consulta principal
$stmt = $conexion->prepare($sql);

// Si hay filtro, bind los parámetros (todos son enteros)
if ($categoria_id !== null) {
    // Necesitamos bind_param dinámicamente para un número variable de IDs
    // Esto requiere construir la cadena de tipos dinámicamente
    $types = str_repeat('i', count($categoria_ids_a_incluir));
    $stmt->bind_param($types, ...$categoria_ids_a_incluir);
}

// Ejecutar la consulta
$stmt->execute();
$resultado = $stmt->get_result();

$productos = [];

if ($resultado->num_rows > 0) {
    // Recorrer resultados y añadirlos al array
    while($fila = $resultado->fetch_assoc()) {
        $productos[] = $fila;
    }
}

// Devolver los productos en formato JSON
echo json_encode($productos);

$stmt->close();
$conexion->close();
?> 