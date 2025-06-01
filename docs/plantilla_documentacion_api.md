# Plantilla de Documentación para Endpoints API (PHP)

Utilice esta plantilla como guía para documentar los endpoints de la API en el proyecto VendeYa.

## Estructura Básica de Documentación

```php
<?php
/**
 * [NOMBRE DEL ENDPOINT] - [DESCRIPCIÓN BREVE]
 * 
 * [DESCRIPCIÓN DETALLADA - Explique el propósito y funcionalidad del endpoint]
 * 
 * @api
 * @method [MÉTODO HTTP] GET|POST|PUT|DELETE
 * @param [TIPO] [NOMBRE_PARÁMETRO] [DESCRIPCIÓN]
 * @param [TIPO] [NOMBRE_PARÁMETRO] [DESCRIPCIÓN]
 * @return [TIPO] [DESCRIPCIÓN DE LA RESPUESTA]
 * @throws [TIPO] [DESCRIPCIÓN DEL ERROR]
 */

// Implementación del endpoint...
```

## Ejemplo Completo

```php
<?php
/**
 * Endpoint para listar productos por categoría.
 * 
 * Este endpoint devuelve una lista paginada de productos que pertenecen a una
 * categoría específica. Los resultados pueden filtrarse por precio y ordenarse
 * por diferentes criterios.
 * 
 * @api
 * @method GET
 * @param int $_GET['id_categoria'] ID de la categoría a consultar
 * @param int $_GET['pagina'] (opcional) Número de página para paginación (por defecto: 1)
 * @param int $_GET['por_pagina'] (opcional) Cantidad de productos por página (por defecto: 10)
 * @param string $_GET['orden'] (opcional) Campo para ordenar resultados (precio, nombre, fecha) (por defecto: fecha)
 * @param string $_GET['direccion'] (opcional) Dirección de ordenamiento (asc, desc) (por defecto: desc)
 * @param float $_GET['precio_min'] (opcional) Precio mínimo para filtrar
 * @param float $_GET['precio_max'] (opcional) Precio máximo para filtrar
 * @return array {
 *   "total": int, // Total de productos encontrados
 *   "paginas": int, // Total de páginas disponibles
 *   "pagina_actual": int, // Página actual
 *   "productos": array // Lista de productos en la página actual
 * }
 * @throws Exception Si ocurre un error en la consulta a la base de datos
 */

// Incluir configuración de base de datos
require_once '../config/database.php';

// Configurar cabeceras para JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Verificar método de solicitud
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Método no permitido
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Verificar parámetro requerido
if (!isset($_GET['id_categoria'])) {
    http_response_code(400); // Solicitud incorrecta
    echo json_encode(['error' => 'Se requiere el ID de la categoría']);
    exit;
}

// Obtener y validar parámetros
$idCategoria = intval($_GET['id_categoria']);
$pagina = isset($_GET['pagina']) ? max(1, intval($_GET['pagina'])) : 1;
$porPagina = isset($_GET['por_pagina']) ? min(50, max(1, intval($_GET['por_pagina']))) : 10;
$orden = isset($_GET['orden']) && in_array($_GET['orden'], ['precio', 'nombre', 'fecha']) ? $_GET['orden'] : 'fecha';
$direccion = isset($_GET['direccion']) && in_array($_GET['direccion'], ['asc', 'desc']) ? $_GET['direccion'] : 'desc';

// Filtros de precio opcionales
$precioMin = isset($_GET['precio_min']) ? floatval($_GET['precio_min']) : null;
$precioMax = isset($_GET['precio_max']) ? floatval($_GET['precio_max']) : null;

try {
    // Obtener conexión a la base de datos
    $conexion = obtenerConexion();
    
    // Construir consulta base
    $consultaBase = "FROM productos WHERE id_categoria = ?";
    $parametros = [$idCategoria];
    $tipos = 'i';
    
    // Añadir filtros de precio si están presentes
    if ($precioMin !== null) {
        $consultaBase .= " AND precio >= ?";
        $parametros[] = $precioMin;
        $tipos .= 'd';
    }
    
    if ($precioMax !== null) {
        $consultaBase .= " AND precio <= ?";
        $parametros[] = $precioMax;
        $tipos .= 'd';
    }
    
    // Consulta para contar total de resultados
    $consultaContar = "SELECT COUNT(*) as total " . $consultaBase;
    $stmt = $conexion->prepare($consultaContar);
    $stmt->bind_param($tipos, ...$parametros);
    $stmt->execute();
    $resultado = $stmt->get_result()->fetch_assoc();
    $totalProductos = $resultado['total'];
    
    // Calcular paginación
    $totalPaginas = ceil($totalProductos / $porPagina);
    $offset = ($pagina - 1) * $porPagina;
    
    // Mapear nombres de campos para ordenamiento
    $camposOrden = [
        'precio' => 'precio',
        'nombre' => 'nombre',
        'fecha' => 'fecha_creacion'
    ];
    
    // Consulta para obtener productos paginados
    $consultaProductos = "SELECT id, nombre, descripcion, precio, imagen, stock, fecha_creacion " . 
                         $consultaBase . 
                         " ORDER BY {$camposOrden[$orden]} {$direccion} " . 
                         " LIMIT ? OFFSET ?";
    
    $stmt = $conexion->prepare($consultaProductos);
    $stmt->bind_param($tipos . 'ii', ...[...$parametros, $porPagina, $offset]);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    $productos = [];
    while ($fila = $resultado->fetch_assoc()) {
        // Formatear datos si es necesario
        $fila['precio'] = floatval($fila['precio']);
        $fila['stock'] = intval($fila['stock']);
        $productos[] = $fila;
    }
    
    // Preparar respuesta
    $respuesta = [
        'total' => $totalProductos,
        'paginas' => $totalPaginas,
        'pagina_actual' => $pagina,
        'productos' => $productos
    ];
    
    // Devolver resultados
    echo json_encode($respuesta);
    
} catch (Exception $e) {
    http_response_code(500); // Error del servidor
    echo json_encode(['error' => 'Error al obtener productos: ' . $e->getMessage()]);
}
```

## Secciones Recomendadas para la Documentación

### 1. Descripción General

Explique brevemente qué hace el endpoint y para qué se utiliza.

### 2. Método HTTP

Especifique el método HTTP que utiliza el endpoint (GET, POST, PUT, DELETE).

### 3. Parámetros

Documente todos los parámetros que acepta el endpoint:

| Parámetro | Tipo | Requerido | Valor por defecto | Descripción |
|-----------|------|-----------|-------------------|-------------|
| `id_categoria` | `int` | Sí | - | ID de la categoría a consultar |
| `pagina` | `int` | No | 1 | Número de página para paginación |
| `por_pagina` | `int` | No | 10 | Cantidad de productos por página |

### 4. Respuesta

Documente la estructura de la respuesta exitosa:

```json
{
  "total": 45,
  "paginas": 5,
  "pagina_actual": 1,
  "productos": [
    {
      "id": 1,
      "nombre": "Producto 1",
      "descripcion": "Descripción del producto",
      "precio": 99.99,
      "imagen": "ruta/imagen.jpg",
      "stock": 10,
      "fecha_creacion": "2023-05-15 10:30:00"
    },
    // Más productos...
  ]
}
```

### 5. Códigos de Estado

Documente los posibles códigos de estado HTTP:

| Código | Descripción |
|--------|-------------|
| 200 | Éxito - Devuelve la lista de productos |
| 400 | Error de cliente - Parámetros incorrectos o faltantes |
| 404 | No encontrado - La categoría no existe |
| 405 | Método no permitido - Se utilizó un método HTTP incorrecto |
| 500 | Error del servidor - Error interno al procesar la solicitud |

### 6. Errores

Documente los posibles mensajes de error:

```json
{
  "error": "Se requiere el ID de la categoría"
}
```

```json
{
  "error": "Error al obtener productos: [mensaje de error]"
}
```

### 7. Ejemplos de Uso

Proporcione ejemplos de cómo llamar al endpoint:

```
GET /api/productos/listar.php?id_categoria=5&pagina=1&por_pagina=10&orden=precio&direccion=asc
```

### 8. Notas de Implementación

Incluya notas importantes sobre la implementación, limitaciones conocidas o consideraciones de rendimiento.

### 9. Dependencias

Liste las dependencias que utiliza el endpoint:

- `../config/database.php`: Para la conexión a la base de datos
- Etc.

### 10. Seguridad

Documente consideraciones de seguridad importantes:

- Validación de parámetros
- Sanitización de entradas
- Control de acceso (si aplica)
- Etc.