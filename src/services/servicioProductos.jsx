/**
 * Servicio para gestionar productos
 * @module servicioProductos
 */

import { get, post, del } from './servicioBase';

/**
 * Obtiene la lista de productos, opcionalmente filtrados por categoría y/o término de búsqueda
 * @param {number|null} categoriaId - ID de la categoría para filtrar (opcional)
 * @param {string|null} busqueda - Término de búsqueda para filtrar productos (opcional)
 * @returns {Promise<Array>} Lista de productos
 */
export async function listarProductos(categoriaId = null, busqueda = null) {
    let endpoint = '/productos/listar.php';
    const params = new URLSearchParams();
    
    if (categoriaId !== null) {
        params.append('categoria_id', categoriaId);
    }
    
    if (busqueda !== null && busqueda.trim() !== '') {
        params.append('busqueda', busqueda.trim());
    }
    
    const queryString = params.toString();
    if (queryString) {
        endpoint += `?${queryString}`;
    }
    
    return get(endpoint);
}

/**
 * Obtiene los detalles de un producto específico
 * @param {number} productoId - ID del producto
 * @returns {Promise<Object>} Detalles del producto
 */
export async function obtenerProducto(productoId) {
    if (!productoId) {
        throw new Error('Se requiere un ID de producto válido');
    }
    return get(`/productos/obtener.php?id=${productoId}`);
}

/**
 * Crea un nuevo producto
 * @param {FormData} formData - Datos del producto en formato FormData
 * @returns {Promise<Object>} Información del producto creado
 */
export async function crearProducto(formData) {
    const url = `${import.meta.env.VITE_API_URL}/productos/crear.php`;
    
    const respuesta = await fetch(url, {
        method: 'POST',
        body: formData // FormData maneja correctamente los datos del formulario y la imagen
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error en la respuesta del servidor al crear producto.');
    }

    return datos;
}

/**
 * Actualiza un producto existente
 * @param {number} productoId - ID del producto a actualizar
 * @param {FormData} formData - Datos actualizados del producto en formato FormData
 * @returns {Promise<Object>} Resultado de la actualización
 */
export async function actualizarProducto(productoId, formData) {
    if (!productoId) {
        throw new Error('Se requiere un ID de producto válido');
    }

    // Asegurarse de que el ID del producto esté en el formData
    formData.append('producto_id', productoId);

    const url = `${import.meta.env.VITE_API_URL}/productos/actualizar.php`;
    
    const respuesta = await fetch(url, {
        method: 'POST', // Usamos POST para compatibilidad con FormData
        body: formData
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al actualizar el producto');
    }

    return datos;
}

/**
 * Elimina un producto
 * @param {number} productoId - ID del producto a eliminar
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export async function eliminarProducto(productoId) {
    if (!productoId) {
        throw new Error('Se requiere un ID de producto válido');
    }
    return del(`/productos/eliminar.php?id=${productoId}`);
}

/**
 * Obtiene la lista de productos de un vendedor específico
 * @param {number} vendedorId - ID del vendedor
 * @returns {Promise<Array>} Lista de productos del vendedor
 */
export async function listarProductosVendedor(vendedorId) {
    if (!vendedorId) {
        throw new Error('Se requiere un ID de vendedor válido');
    }
    return get(`/productos/listar.php?vendedor_id=${vendedorId}`);
}

/**
 * Busca productos por término de búsqueda
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Array>} Lista de productos que coinciden con la búsqueda
 */
export async function buscarProductos(termino) {
    if (!termino || termino.trim() === '') {
        return [];
    }
    return listarProductos(null, termino);
}

export default {
    listarProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    listarProductosVendedor,
    buscarProductos
};