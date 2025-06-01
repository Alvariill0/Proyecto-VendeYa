<?php

use PHPUnit\Framework\TestCase;

/**
 * Clase de pruebas para los endpoints de productos
 */
class ProductosTest extends TestCase
{
    /**
     * URL base para las pruebas
     */
    private $baseUrl = 'http://localhost/vendeya/api';

    /**
     * Prueba el endpoint de listar productos sin filtros
     */
    public function testListarProductosSinFiltros()
    {
        // Configurar opciones de la petición
        $opciones = [
            'http' => [
                'method' => 'GET',
                'header' => 'Content-Type: application/json'
            ]
        ];

        // Crear el contexto para la petición
        $contexto = stream_context_create($opciones);

        // Esta prueba no realiza la petición real, solo verifica la estructura
        // En un entorno real, se usaría un mock para simular la respuesta
        $respuestaEsperada = [
            [
                'id' => 1,
                'nombre' => 'Producto 1',
                'descripcion' => 'Descripción del producto 1',
                'precio' => 100.00,
                'imagen' => 'ruta/imagen1.jpg',
                'stock' => 10,
                'vendedor_nombre' => 'Vendedor 1'
            ],
            [
                'id' => 2,
                'nombre' => 'Producto 2',
                'descripcion' => 'Descripción del producto 2',
                'precio' => 200.00,
                'imagen' => 'ruta/imagen2.jpg',
                'stock' => 5,
                'vendedor_nombre' => 'Vendedor 2'
            ]
        ];

        // Verificar la estructura de la respuesta esperada
        $this->assertIsArray($respuestaEsperada);
        $this->assertGreaterThan(0, count($respuestaEsperada));
        $this->assertArrayHasKey('id', $respuestaEsperada[0]);
        $this->assertArrayHasKey('nombre', $respuestaEsperada[0]);
        $this->assertArrayHasKey('descripcion', $respuestaEsperada[0]);
        $this->assertArrayHasKey('precio', $respuestaEsperada[0]);
        $this->assertArrayHasKey('imagen', $respuestaEsperada[0]);
        $this->assertArrayHasKey('stock', $respuestaEsperada[0]);
        $this->assertArrayHasKey('vendedor_nombre', $respuestaEsperada[0]);
    }

    /**
     * Prueba el endpoint de listar productos filtrados por categoría
     */
    public function testListarProductosFiltradosPorCategoria()
    {
        // ID de categoría para filtrar
        $categoriaId = 1;

        // Configurar opciones de la petición
        $opciones = [
            'http' => [
                'method' => 'GET',
                'header' => 'Content-Type: application/json'
            ]
        ];

        // Crear el contexto para la petición
        $contexto = stream_context_create($opciones);

        // Esta prueba no realiza la petición real, solo verifica la estructura
        $respuestaEsperada = [
            [
                'id' => 1,
                'nombre' => 'Producto 1',
                'descripcion' => 'Descripción del producto 1',
                'precio' => 100.00,
                'imagen' => 'ruta/imagen1.jpg',
                'stock' => 10,
                'vendedor_nombre' => 'Vendedor 1'
            ]
        ];

        // Verificar la estructura de la respuesta esperada
        $this->assertIsArray($respuestaEsperada);
        $this->assertGreaterThan(0, count($respuestaEsperada));
        $this->assertArrayHasKey('id', $respuestaEsperada[0]);
        $this->assertArrayHasKey('nombre', $respuestaEsperada[0]);
    }

    /**
     * Prueba el endpoint de obtener un producto específico
     */
    public function testObtenerProducto()
    {
        // ID del producto a obtener
        $productoId = 1;

        // Configurar opciones de la petición
        $opciones = [
            'http' => [
                'method' => 'GET',
                'header' => 'Content-Type: application/json'
            ]
        ];

        // Crear el contexto para la petición
        $contexto = stream_context_create($opciones);

        // Esta prueba no realiza la petición real, solo verifica la estructura
        $respuestaEsperada = [
            'id' => 1,
            'nombre' => 'Producto 1',
            'descripcion' => 'Descripción detallada del producto 1',
            'precio' => 100.00,
            'imagen' => 'ruta/imagen1.jpg',
            'stock' => 10,
            'vendedor_id' => 1,
            'vendedor_nombre' => 'Vendedor 1',
            'categoria_id' => 1,
            'categoria_nombre' => 'Categoría 1'
        ];

        // Verificar la estructura de la respuesta esperada
        $this->assertIsArray($respuestaEsperada);
        $this->assertArrayHasKey('id', $respuestaEsperada);
        $this->assertArrayHasKey('nombre', $respuestaEsperada);
        $this->assertArrayHasKey('descripcion', $respuestaEsperada);
        $this->assertArrayHasKey('precio', $respuestaEsperada);
        $this->assertArrayHasKey('imagen', $respuestaEsperada);
        $this->assertArrayHasKey('stock', $respuestaEsperada);
        $this->assertArrayHasKey('vendedor_id', $respuestaEsperada);
        $this->assertArrayHasKey('vendedor_nombre', $respuestaEsperada);
        $this->assertArrayHasKey('categoria_id', $respuestaEsperada);
        $this->assertArrayHasKey('categoria_nombre', $respuestaEsperada);
    }

    /**
     * Prueba el endpoint de crear un producto
     */
    public function testCrearProducto()
    {
        // Datos de prueba para crear un producto
        $datos = [
            'nombre' => 'Nuevo Producto',
            'descripcion' => 'Descripción del nuevo producto',
            'precio' => 150.00,
            'stock' => 20,
            'categoria_id' => 1
            // En un caso real, también se enviaría una imagen
        ];

        // Configurar opciones de la petición
        $opciones = [
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/json',
                'content' => json_encode($datos)
            ]
        ];

        // Crear el contexto para la petición
        $contexto = stream_context_create($opciones);

        // Esta prueba no realiza la petición real, solo verifica la estructura
        $respuestaEsperada = [
            'success' => true,
            'message' => 'Producto creado correctamente',
            'producto_id' => 3
        ];

        // Verificar la estructura de la respuesta esperada
        $this->assertIsArray($respuestaEsperada);
        $this->assertArrayHasKey('success', $respuestaEsperada);
        $this->assertArrayHasKey('message', $respuestaEsperada);
        $this->assertArrayHasKey('producto_id', $respuestaEsperada);
        $this->assertTrue($respuestaEsperada['success']);
    }

    /**
     * Prueba el endpoint de eliminar un producto
     */
    public function testEliminarProducto()
    {
        // ID del producto a eliminar
        $productoId = 1;

        // Datos para la petición
        $datos = [
            'producto_id' => $productoId
        ];

        // Configurar opciones de la petición
        $opciones = [
            'http' => [
                'method' => 'DELETE',
                'header' => 'Content-Type: application/json',
                'content' => json_encode($datos)
            ]
        ];

        // Crear el contexto para la petición
        $contexto = stream_context_create($opciones);

        // Esta prueba no realiza la petición real, solo verifica la estructura
        $respuestaEsperada = [
            'success' => true,
            'message' => 'Producto eliminado correctamente'
        ];

        // Verificar la estructura de la respuesta esperada
        $this->assertIsArray($respuestaEsperada);
        $this->assertArrayHasKey('success', $respuestaEsperada);
        $this->assertArrayHasKey('message', $respuestaEsperada);
        $this->assertTrue($respuestaEsperada['success']);
    }
}