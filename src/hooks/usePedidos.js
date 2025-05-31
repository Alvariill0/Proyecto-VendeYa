import { useState, useEffect } from 'react';
import { listarPedidos } from '../services/servicioPedidos';

/**
 * Hook personalizado para gestionar pedidos
 * @param {Object} options - Opciones de configuración
 * @param {number} options.limite - Número máximo de pedidos a mostrar
 * @param {boolean} options.ordenarPorRecientes - Si es true, ordena los pedidos por fecha más reciente
 * @param {boolean} options.cargarAlInicio - Si es true, carga los pedidos al montar el componente
 * @returns {Object} Estado y funciones para gestionar pedidos
 */
function usePedidos(options = {}) {
    const { limite = null, ordenarPorRecientes = true, cargarAlInicio = true } = options;
    
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const cargarPedidos = async () => {
        try {
            setCargando(true);
            setError(null);
            const datos = await listarPedidos();
            
            let pedidosProcesados = [...datos];
            
            // Ordenar por fecha si es necesario
            if (ordenarPorRecientes) {
                pedidosProcesados = pedidosProcesados.sort(
                    (a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido)
                );
            }
            
            // Limitar la cantidad si se especifica un límite
            if (limite && limite > 0) {
                pedidosProcesados = pedidosProcesados.slice(0, limite);
            }
            
            setPedidos(pedidosProcesados);
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
            setError('No se pudieron cargar los pedidos. ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (cargarAlInicio) {
            cargarPedidos();
        }
    }, [limite, cargarAlInicio]);

    const formatearFecha = (fechaStr, incluirHora = false) => {
        const fecha = new Date(fechaStr);
        const opciones = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        };

        if (incluirHora) {
            opciones.hour = '2-digit';
            opciones.minute = '2-digit';
        }

        return fecha.toLocaleDateString('es-ES', opciones);
    };

    return {
        pedidos,
        cargando,
        error,
        cargarPedidos,
        formatearFecha,
        hayPedidos: pedidos.length > 0
    };
}

export { usePedidos };