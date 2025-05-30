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

// Consulta para obtener todas las categorías
// Seleccionamos parent_id también
$sql = "SELECT id, nombre, descripcion, parent_id FROM categorias ORDER BY parent_id ASC, nombre ASC";
$resultado = $conexion->query($sql);

$categorias = [];
$categorias_por_id = [];

if ($resultado->num_rows > 0) {
    // Organizar categorías en un array asociativo por ID
    while($fila = $resultado->fetch_assoc()) {
        $fila['subcategorias'] = []; // Inicializar array de subcategorías
        $categorias_por_id[$fila['id']] = $fila;
    }

    // Construir la jerarquía
    foreach ($categorias_por_id as &$categoria) {
        if ($categoria['parent_id'] === NULL) {
            // Es una categoría principal
            $categorias[] = &$categoria;
        } else {
            // Es una subcategoría, añadirla a su padre si existe
            $parent_id = $categoria['parent_id'];
            if (isset($categorias_por_id[$parent_id])) {
                $categorias_por_id[$parent_id]['subcategorias'][] = &$categoria;
            }
        }
    }
    // Deshacer las referencias para evitar problemas
    unset($categoria);
}

// Devolver las categorías en formato JSON
echo json_encode($categorias);

$conexion->close();
?> 