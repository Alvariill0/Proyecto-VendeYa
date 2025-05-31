import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarPedidos } from '../../../services/servicioPedidos';

function PedidosRecientes({ limite = 3 }) {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarPedidos = async () => {
            try {
                setCargando(true);
                setError(null);
                const datos = await listarPedidos();
                // Ordenar por fecha más reciente y limitar al número especificado
                const pedidosRecientes = [...datos]
                    .sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))
                    .slice(0, limite);
                setPedidos(pedidosRecientes);
            } catch (error) {
                console.error('Error al cargar pedidos recientes:', error);
                setError('No se pudieron cargar los pedidos. ' + error.message);
            } finally {
                setCargando(false);
            }
        };

        cargarPedidos();
    }, [limite]);

    const formatearFecha = (fechaStr) => {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    if (cargando) {
        return (
            <div className="d-flex justify-content-center my-3">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger my-3" role="alert">
                {error}
            </div>
        );
    }

    if (pedidos.length === 0) {
        return (
            <div className="alert alert-info my-3" role="alert">
                No tienes pedidos realizados todavía.
            </div>
        );
    }

    return (
        <div className="pedidos-recientes">
            <div className="list-group">
                {pedidos.map((pedido) => (
                    <div key={pedido.id} className="list-group-item list-group-item-action">
                        <div className="d-flex w-100 justify-content-between align-items-center">
                            <div>
                                <h6 className="mb-1">Pedido #{pedido.id}</h6>
                                <small className="text-muted">{formatearFecha(pedido.fecha_pedido)}</small>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className={`badge me-2 ${pedido.estado === 'completado' ? 'bg-success' : 
                                    pedido.estado === 'pendiente' ? 'bg-warning' : 
                                    pedido.estado === 'cancelado' ? 'bg-danger' : 'bg-secondary'}`}>
                                    {pedido.estado.toUpperCase()}
                                </span>
                                <span className="fw-bold">{parseFloat(pedido.total).toFixed(2)}€</span>
                            </div>
                        </div>
                        <small className="d-block mt-2">
                            {pedido.items.length} {pedido.items.length === 1 ? 'producto' : 'productos'}
                        </small>
                    </div>
                ))}
            </div>
            
            <div className="d-flex justify-content-end mt-3">
                <Link to="/mis-pedidos" className="btn btn-outline-primary">
                    Ver historial completo
                </Link>
            </div>
        </div>
    );
}

export default PedidosRecientes;