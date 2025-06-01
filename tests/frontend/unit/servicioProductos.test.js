/**
 * Tests para el servicio de productos
 */

// Mock de fetch para simular respuestas del servidor
global.fetch = jest.fn();

// Importamos las funciones a probar
import { listarProductos, obtenerProducto, eliminarProducto } from '../../../src/services/servicioProductos';

// Configuración antes de cada test
beforeEach(() => {
  fetch.mockClear();
});

describe('Servicio de Productos', () => {
  // Test para la función listarProductos
  describe('listarProductos', () => {
    it('debería obtener todos los productos sin filtros', async () => {
      // Datos de ejemplo para la respuesta
      const productosEjemplo = [
        { id: 1, nombre: 'Producto 1', precio: 100 },
        { id: 2, nombre: 'Producto 2', precio: 200 }
      ];

      // Configurar el mock para simular una respuesta exitosa
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => productosEjemplo
      });

      // Ejecutar la función sin filtros
      const resultado = await listarProductos();

      // Verificar que fetch fue llamado con los parámetros correctos
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/productos/listar.php'),
        expect.any(Object)
      );

      // Verificar el resultado
      expect(resultado).toEqual(productosEjemplo);
    });

    it('debería filtrar productos por categoría', async () => {
      // Datos de ejemplo para la respuesta
      const productosFiltrados = [
        { id: 1, nombre: 'Producto 1', precio: 100, categoria_id: 5 }
      ];

      // Configurar el mock para simular una respuesta exitosa
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => productosFiltrados
      });

      // Ejecutar la función con filtro de categoría
      const resultado = await listarProductos(5);

      // Verificar que fetch fue llamado con los parámetros correctos
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/productos/listar.php?categoria_id=5'),
        expect.any(Object)
      );

      // Verificar el resultado
      expect(resultado).toEqual(productosFiltrados);
    });

    it('debería filtrar productos por término de búsqueda', async () => {
      // Datos de ejemplo para la respuesta
      const productosBusqueda = [
        { id: 2, nombre: 'Producto Especial', precio: 200 }
      ];

      // Configurar el mock para simular una respuesta exitosa
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => productosBusqueda
      });

      // Ejecutar la función con término de búsqueda
      const resultado = await listarProductos(null, 'Especial');

      // Verificar que fetch fue llamado con los parámetros correctos
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/productos/listar.php?busqueda=Especial'),
        expect.any(Object)
      );

      // Verificar el resultado
      expect(resultado).toEqual(productosBusqueda);
    });
  });

  // Test para la función obtenerProducto
  describe('obtenerProducto', () => {
    it('debería obtener los detalles de un producto específico', async () => {
      // Datos de ejemplo para la respuesta
      const productoDetalle = {
        id: 1,
        nombre: 'Producto Detallado',
        descripcion: 'Descripción detallada del producto',
        precio: 150,
        imagen: 'ruta/imagen.jpg',
        vendedor_id: 3,
        vendedor_nombre: 'Vendedor Test'
      };

      // Configurar el mock para simular una respuesta exitosa
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => productoDetalle
      });

      // Ejecutar la función
      const resultado = await obtenerProducto(1);

      // Verificar que fetch fue llamado con los parámetros correctos
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/productos/obtener.php?id=1'),
        expect.any(Object)
      );

      // Verificar el resultado
      expect(resultado).toEqual(productoDetalle);
    });

    it('debería lanzar un error si no se proporciona un ID de producto', async () => {
      // Ejecutar la función sin ID y verificar que lanza un error
      await expect(obtenerProducto())
        .rejects
        .toThrow('Se requiere un ID de producto válido');

      // Verificar que fetch no fue llamado
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  // Test para la función eliminarProducto
  describe('eliminarProducto', () => {
    it('debería eliminar un producto correctamente', async () => {
      // Configurar el mock para simular una respuesta exitosa
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Producto eliminado correctamente' })
      });

      // Ejecutar la función
      const resultado = await eliminarProducto(1);

      // Verificar que fetch fue llamado con los parámetros correctos
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/productos/eliminar.php'),
        expect.objectContaining({
          method: 'DELETE',
          body: expect.stringContaining('"producto_id":1')
        })
      );

      // Verificar el resultado
      expect(resultado).toEqual({
        success: true,
        message: 'Producto eliminado correctamente'
      });
    });
  });
});