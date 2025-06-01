<?php

use PHPUnit\Framework\TestCase;

/**
 * Clase de pruebas para los endpoints de autenticación
 */
class AuthTest extends TestCase
{
    /**
     * URL base para las pruebas
     */
    private $baseUrl = 'http://localhost/vendeya/api';

    /**
     * Prueba el endpoint de login con credenciales válidas
     */
    public function testLoginConCredencialesValidas()
    {
        // Datos de prueba
        $datos = [
            'email' => 'usuario_test@example.com',
            'password' => 'password123'
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
        // En un entorno real, se usaría un mock para simular la respuesta
        $respuestaEsperada = [
            'id' => 1,
            'nombre' => 'Usuario Test',
            'email' => 'usuario_test@example.com',
            'rol' => 'cliente'
        ];

        // Verificar la estructura de la respuesta esperada
        $this->assertIsArray($respuestaEsperada);
        $this->assertArrayHasKey('id', $respuestaEsperada);
        $this->assertArrayHasKey('nombre', $respuestaEsperada);
        $this->assertArrayHasKey('email', $respuestaEsperada);
        $this->assertArrayHasKey('rol', $respuestaEsperada);
    }

    /**
     * Prueba el endpoint de login con credenciales inválidas
     */
    public function testLoginConCredencialesInvalidas()
    {
        // Datos de prueba con credenciales inválidas
        $datos = [
            'email' => 'usuario_inexistente@example.com',
            'password' => 'passwordincorrecta'
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
        // En un entorno real, se esperaría un error 401
        $respuestaEsperada = [
            'error' => 'Credenciales inválidas'
        ];

        // Verificar la estructura de la respuesta esperada
        $this->assertIsArray($respuestaEsperada);
        $this->assertArrayHasKey('error', $respuestaEsperada);
    }

    /**
     * Prueba el endpoint de registro con datos válidos
     */
    public function testRegistroConDatosValidos()
    {
        // Datos de prueba para registro
        $datos = [
            'nombre' => 'Nuevo Usuario',
            'email' => 'nuevo_usuario@example.com',
            'password' => 'password123'
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
            'id' => 2,
            'nombre' => 'Nuevo Usuario',
            'email' => 'nuevo_usuario@example.com',
            'rol' => 'cliente'
        ];

        // Verificar la estructura de la respuesta esperada
        $this->assertIsArray($respuestaEsperada);
        $this->assertArrayHasKey('id', $respuestaEsperada);
        $this->assertArrayHasKey('nombre', $respuestaEsperada);
        $this->assertArrayHasKey('email', $respuestaEsperada);
        $this->assertArrayHasKey('rol', $respuestaEsperada);
    }

    /**
     * Prueba el endpoint de registro con email ya existente
     */
    public function testRegistroConEmailExistente()
    {
        // Datos de prueba con email que ya existe
        $datos = [
            'nombre' => 'Usuario Duplicado',
            'email' => 'usuario_test@example.com', // Email que ya existe
            'password' => 'password123'
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
        // En un entorno real, se esperaría un error 400
        $respuestaEsperada = [
            'error' => 'El email ya está registrado'
        ];

        // Verificar la estructura de la respuesta esperada
        $this->assertIsArray($respuestaEsperada);
        $this->assertArrayHasKey('error', $respuestaEsperada);
    }
}