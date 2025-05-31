/**
 * Servicio para gestionar categorías
 * @module servicioCategorias
 */

import { get, post } from './servicioBase';

/**
 * Obtiene la lista de todas las categorías
 * @returns {Promise<Array>} Lista de categorías
 */
export async function listarCategorias() {
    return get('/categorias/listar.php');
}

/**
 * Crea una nueva categoría
 * @param {Object} categoria - Datos de la categoría a crear
 * @param {string} categoria.nombre - Nombre de la categoría
 * @param {string} categoria.descripcion - Descripción de la categoría
 * @param {number|null} categoria.categoria_padre_id - ID de la categoría padre (opcional)
 * @returns {Promise<Object>} Información de la categoría creada
 */
export async function crearCategoria(categoria) {
    if (!categoria || !categoria.nombre) {
        throw new Error('Se requiere un nombre de categoría válido');
    }
    return post('/categorias/crear.php', categoria);
}

/**
 * Obtiene las categorías sugeridas por los usuarios en las descripciones de productos
 * @returns {Promise<Array>} Lista de productos con categorías sugeridas
 */
export async function listarCategoriasSugeridas() {
    return get('/productos/listar.php?categorias_sugeridas=true');
}

/**
 * Actualiza un producto para aprobar una categoría sugerida
 * @param {number} productoId - ID del producto
 * @param {number} categoriaId - ID de la categoría aprobada
 * @param {string} descripcion - Nueva descripción sin la categoría sugerida
 * @returns {Promise<Object>} Resultado de la actualización
 */
export async function actualizarProductoConCategoria(productoId, categoriaId, descripcion) {
    if (!productoId || !categoriaId) {
        throw new Error('Se requieren IDs válidos de producto y categoría');
    }
    return post('/productos/actualizar.php', {
        id: productoId,
        categoria_id: categoriaId,
        descripcion
    });
}

/**
 * Actualiza la descripción de un producto para eliminar una categoría sugerida
 * @param {number} productoId - ID del producto
 * @param {string} descripcion - Nueva descripción sin la categoría sugerida
 * @returns {Promise<Object>} Resultado de la actualización
 */
export async function actualizarDescripcionProducto(productoId, descripcion) {
    if (!productoId) {
        throw new Error('Se requiere un ID de producto válido');
    }
    return post('/productos/actualizar.php', {
        id: productoId,
        descripcion
    });
}

export default {
    listarCategorias,
    crearCategoria,
    listarCategoriasSugeridas,
    actualizarProductoConCategoria,
    actualizarDescripcionProducto
};