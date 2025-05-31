/**
 * Servicio base para realizar peticiones HTTP
 * @module servicioBase
 */

/**
 * URL base para las peticiones a la API
 * @type {string}
 */
export const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Opciones por defecto para las peticiones fetch
 * @type {Object}
 */
const defaultOptions = {
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include'
};

/**
 * Realiza una petición HTTP y procesa la respuesta
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} options - Opciones para fetch
 * @returns {Promise<any>} Datos de la respuesta
 * @throws {Error} Error de la petición
 */
async function fetchWithErrorHandling(endpoint, options = {}) {
    try {
        const url = `${BASE_URL}${endpoint}`;
        const fetchOptions = { ...defaultOptions, ...options };
        
        const response = await fetch(url, fetchOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
        }
        
        return data;
    } catch (error) {
        console.error(`Error en petición a ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Realiza una petición GET
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} options - Opciones adicionales para fetch
 * @returns {Promise<any>} Datos de la respuesta
 */
export function get(endpoint, options = {}) {
    return fetchWithErrorHandling(endpoint, {
        method: 'GET',
        ...options
    });
}

/**
 * Realiza una petición POST
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos a enviar en el cuerpo de la petición
 * @param {Object} options - Opciones adicionales para fetch
 * @returns {Promise<any>} Datos de la respuesta
 */
export function post(endpoint, data = {}, options = {}) {
    return fetchWithErrorHandling(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        ...options
    });
}

/**
 * Realiza una petición PUT
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos a enviar en el cuerpo de la petición
 * @param {Object} options - Opciones adicionales para fetch
 * @returns {Promise<any>} Datos de la respuesta
 */
export function put(endpoint, data = {}, options = {}) {
    return fetchWithErrorHandling(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
        ...options
    });
}

/**
 * Realiza una petición DELETE
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} options - Opciones adicionales para fetch
 * @returns {Promise<any>} Datos de la respuesta
 */
export function del(endpoint, options = {}) {
    return fetchWithErrorHandling(endpoint, {
        method: 'DELETE',
        ...options
    });
}

/**
 * Realiza una petición PATCH
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos a enviar en el cuerpo de la petición
 * @param {Object} options - Opciones adicionales para fetch
 * @returns {Promise<any>} Datos de la respuesta
 */
export function patch(endpoint, data = {}, options = {}) {
    return fetchWithErrorHandling(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
        ...options
    });
}

export default {
    get,
    post,
    put,
    del,
    patch,
    BASE_URL
};