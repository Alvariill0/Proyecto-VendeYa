import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar llamadas a la API
 * @param {Function} apiFunction - Función que realiza la llamada a la API
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.loadingInitial - Estado inicial de carga
 * @param {boolean} options.executeImmediately - Si es true, ejecuta la función inmediatamente
 * @param {Array} options.params - Parámetros para la función API si se ejecuta inmediatamente
 * @returns {Object} Estado y funciones para manejar la llamada a la API
 */
function useApiCall(apiFunction, options = {}) {
    const { 
        loadingInitial = false, 
        executeImmediately = false,
        params = []
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(loadingInitial);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await apiFunction(...args);
            
            setData(result);
            setSuccess(true);
            return result;
        } catch (err) {
            console.error('Error en llamada API:', err);
            setError(err.message || 'Ha ocurrido un error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    // Ejecutar inmediatamente si se especifica
    useState(() => {
        if (executeImmediately) {
            execute(...params);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
        setSuccess(false);
    }, []);

    return {
        data,
        loading,
        error,
        success,
        execute,
        reset
    };
}

export default useApiCall;