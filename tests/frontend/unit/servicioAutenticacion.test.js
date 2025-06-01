/**
 * Tests para el servicio de autenticación
 */

// Mock de fetch para simular respuestas del servidor
global.fetch = jest.fn();

// Importamos las funciones a probar
import { login, registro, logout } from '../../../src/services/servicioAutenticacion';

// Configuración antes de cada test
beforeEach(() => {
  fetch.mockClear();
});

describe('Servicio de Autenticación', () => {
  // Test para la función login
  describe('login', () => {
    it('debería llamar al endpoint correcto con los datos proporcionados', async () => {
      // Configurar el mock para simular una respuesta exitosa
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, nombre: 'Usuario Test', email: 'test@example.com', rol: 'cliente' })
      });

      // Ejecutar la función
      const resultado = await login('test@example.com', 'password123');

      // Verificar que fetch fue llamado con los parámetros correctos
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login.php'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
          headers: expect.objectContaining({ 'Content-Type': 'application/json' })
        })
      );

      // Verificar el resultado
      expect(resultado).toEqual({
        id: 1,
        nombre: 'Usuario Test',
        email: 'test@example.com',
        rol: 'cliente'
      });
    });

    it('debería manejar errores de autenticación', async () => {
      // Configurar el mock para simular un error de autenticación
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Credenciales inválidas' })
      });

      // Ejecutar la función y verificar que lanza un error
      await expect(login('wrong@example.com', 'wrongpass'))
        .rejects
        .toThrow('Credenciales inválidas');
    });
  });

  // Test para la función registro
  describe('registro', () => {
    it('debería llamar al endpoint correcto con los datos proporcionados', async () => {
      // Configurar el mock para simular una respuesta exitosa
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, nombre: 'Nuevo Usuario', email: 'nuevo@example.com', rol: 'cliente' })
      });

      // Ejecutar la función
      const resultado = await registro('Nuevo Usuario', 'nuevo@example.com', 'password123');

      // Verificar que fetch fue llamado con los parámetros correctos
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/registro.php'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ nombre: 'Nuevo Usuario', email: 'nuevo@example.com', password: 'password123' }),
          headers: expect.objectContaining({ 'Content-Type': 'application/json' })
        })
      );

      // Verificar el resultado
      expect(resultado).toEqual({
        id: 2,
        nombre: 'Nuevo Usuario',
        email: 'nuevo@example.com',
        rol: 'cliente'
      });
    });
  });

  // Test para la función logout
  describe('logout', () => {
    it('debería llamar al endpoint correcto', async () => {
      // Configurar el mock para simular una respuesta exitosa
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Sesión cerrada correctamente' })
      });

      // Ejecutar la función
      const resultado = await logout();

      // Verificar que fetch fue llamado con los parámetros correctos
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/logout.php'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' })
        })
      );

      // Verificar el resultado
      expect(resultado).toEqual({
        success: true,
        message: 'Sesión cerrada correctamente'
      });
    });
  });
});