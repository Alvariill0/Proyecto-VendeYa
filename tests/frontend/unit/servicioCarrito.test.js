/**
 * Tests para el servicio de carrito
 */

// Mock de fetch para simular respuestas del servidor
global.fetch = jest.fn();

// Importamos las funciones a probar
import { obtenerCarrito, agregarAlCarrito, actualizarCantidadCarrito, eliminarDelCarrito, vaciarCarrito } from '../../../src/services/servicioCarrito';

// Configuración antes de cada test
beforeEach(() => {
  fetch.mockClear();
});

describe('Servicio de Carrito', () => {
  // Test para la función obtenerCarrito
  describe('obtenerCarrito', () => {
    it('debería obtener los items del carrito del usuario actual', async () => {
      // Datos de ejemplo para la respuesta
      const carritoEjemplo = {
        items: [
          { id: 1, producto_id: 101, nombre: 'Producto 1', precio: 100, cantidad: 2, subtotal: 200 },
          { id: 2, producto_id: 102, nombre: 'Producto 2', precio: 150, cantidad: 1, subtotal: 150 }
        ],
        total: 350
      };

      // Configurar el mock para simular una respuesta exitosa
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => carritoEjemplo
      });

      // Ejecutar la función
      const resultado = await obtenerCarrito();

      // Verificar que fetch fue llamado con los parámetros correctos
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/carrito/listar.php'),
        expect.any(Object)
      );

      // Verificar el resultado
      expect(resultado).toEqual(carritoEjemplo);
    });
  });

  // Test para la función agregarAlCarrito
  describe('agregarAlCarrito', () => {
    it('debería añadir un producto al carrito con la cantidad especificada', async () => {
      // Configurar el mock para simular una respuesta exitosa
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Producto agregado al carrito' })
      });

      // Ejecutar la función
      const resultado = await agregarAlCarrito(101, 3);

      // Verificar que fetch fue llamado con los parámetros correctos
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/carrito/agregar.php'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ producto_id: 101, cantidad: 3 })
        })
      );

      // Verificar el resultado
      expect(resultado).toEqual({
        success: true,
        message: 'Producto agregado al carrito'
      });
    });

    it('debería usar cantidad 1 por defecto si no se especifica', async () => {
      // Configurar el mock para simular una respuesta exitosa
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Producto agregado al carrito' })
      });

      // Ejecutar la función sin especificar cantidad
      const resultado = await agregarAlCarrito(101);

      // Verificar que fetch fue llamado con los parámetros correctos
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/carrito/agregar.php'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ producto_id: 101, cantidad: 1 })
        })
      );

      // Verificar el resultado
      expect(resultado).toEqual({
        success: true,
        message: 'Producto agregado al carrito'
      });
    });
  });

  // Test para la función actualizarCantidadCarrito
  describe('actualizarCantidadCarrito', () => {
    it('debería actualizar la cantidad de un producto en el carrito', async () => {
      // Configurar el mock para simular una respuesta exitosa
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Cantidad actualizada' })
      });

      // Ejecutar la función
      const resultado = await actualizarCantidadCarrito(1, 5);

      // Verificar que fetch fue llamado con los parámetros correctos
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/carrito/actualizar.php'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ item_id: 1, cantidad: 5 })
        })
      );

      // Verificar el resultado
      expect(resultado).toEqual({
        success: true,
        message: 'Cantidad actualizada'
      });
    });

    it('debería llamar a eliminarDelCarrito si la cantidad es 0 o menor', async () => {
      // Configurar el mock para simular una respuesta exitosa de eliminarDelCarrito
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Producto eliminado del carrito' })
      });

      // Ejecutar la función con cantidad 0
      const resultado = await actualizarCantidadCarrito(1, 0);

      // Verificar que fetch fue llamado con los parámetros correctos para eliminar
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/carrito/eliminar.php'),
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ item_id: 1 })
        })
      );

      // Verificar el resultado
      expect(resultado).toEqual({
        success: true,
        message: 'Producto eliminado del carrito'
      });
    });
  });

  // Test para la función eliminarDelCarrito
  describe('eliminarDelCarrito', () => {
    it('debería eliminar un producto del carrito', async () => {
      // Configurar el mock para simular una respuesta exitosa
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Producto eliminado del carrito' })
      });

      // Ejecutar la función
      const resultado = await eliminarDelCarrito(1);

      // Verificar que fetch fue llamado con los parámetros correctos
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/carrito/eliminar.php'),
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ item_id: 1 })
        })
      );

      // Verificar el resultado
      expect(resultado).toEqual({
        success: true,
        message: 'Producto eliminado del carrito'
      });
    });
  });

  // Test para la función vaciarCarrito
  describe('vaciarCarrito', () => {
    it('debería vaciar el carrito completamente', async () => {
      // Configurar el mock para simular una respuesta exitosa
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Carrito vaciado correctamente' })
      });

      // Ejecutar la función
      const resultado = await vaciarCarrito();

      // Verificar que fetch fue llamado con los parámetros correctos
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/carrito/vaciar.php'),
        expect.objectContaining({
          method: 'POST'
        })
      );

      // Verificar el resultado
      expect(resultado).toEqual({
        success: true,
        message: 'Carrito vaciado correctamente'
      });
    });
  });
});