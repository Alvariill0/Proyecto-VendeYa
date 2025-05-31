import { useState, useEffect } from 'react';
import { listarPedidosVendedor, actualizarEstadoPedido } from '../services/servicioPedidos';

/**
 * Hook personalizado para gestionar pedidos que contienen productos del vendedor
 * @param {Object} options - Opciones de configuración
 * @param {number} options.limite - Número máximo de pedidos a mostrar
 * @param {boolean} options.ordenarPorRecientes - Si es true, ordena los pedidos por fecha más reciente
 * @param {boolean} options.cargarAlInicio - Si es true, carga los pedidos al montar el componente
 * @returns {Object} Estado y funciones para gestionar pedidos del vendedor
 */
function usePedidosVendedor(options = {}) {
    const { limite = null, ordenarPorRecientes = true, cargarAlInicio = true } = options;
    
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [actualizando, setActualizando] = useState(false);

    const cargarPedidos = async () => {
        try {
            setCargando(true);
            setError(null);
            const datos = await listarPedidosVendedor();
            
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
            console.error('Error al cargar pedidos del vendedor:', error);
            setError('No se pudieron cargar los pedidos. ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    const actualizarEstado = async (pedidoId, nuevoEstado) => {
        try {
            setActualizando(true);
            setError(null);
            await actualizarEstadoPedido(pedidoId, nuevoEstado);
            
            // Actualizar el estado localmente
            setPedidos(pedidos.map(pedido => {
                if (pedido.id === pedidoId) {
                    return { ...pedido, estado: nuevoEstado };
                }
                return pedido;
            }));
            
            return { success: true };
        } catch (error) {
            console.error('Error al actualizar estado del pedido:', error);
            setError('No se pudo actualizar el estado del pedido. ' + error.message);
            return { success: false, error: error.message };
        } finally {
            setActualizando(false);
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
        actualizando,
        cargarPedidos,
        actualizarEstado,
        formatearFecha,
        hayPedidos: pedidos.length > 0
    };
}

export { usePedidosVendedor };