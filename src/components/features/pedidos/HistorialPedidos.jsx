import React, { useEffect, useState } from 'react';
import { listarPedidos } from '../../../services/servicioPedidos';

function HistorialPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarPedidos = async () => {
            try {
                setCargando(true);
                setError(null);
                const datos = await listarPedidos();
                setPedidos(datos);
            } catch (error) {
                console.error('Error al cargar pedidos:', error);
                setError('No se pudieron cargar los pedidos. ' + error.message);
            } finally {
                setCargando(false);
            }
        };

        cargarPedidos();
    }, []);

    const formatearFecha = (fechaStr) => {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (cargando) {
        return (
            <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger my-4" role="alert">
                {error}
            </div>
        );
    }

    if (pedidos.length === 0) {
        return (
            <div className="alert alert-info my-4" role="alert">
                No tienes pedidos realizados todavía.
            </div>
        );
    }

    return (
        <div className="container my-4">
            <h2 className="mb-4">Historial de Pedidos</h2>
            
            {pedidos.map((pedido) => (
                <div key={pedido.id} className="card mb-4 shadow-sm">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-0">Pedido #{pedido.id}</h5>
                            <small className="text-muted">{formatearFecha(pedido.fecha_pedido)}</small>
                        </div>
                        <div>
                            <span className={`badge ${pedido.estado === 'completado' ? 'bg-success' : 
                                              pedido.estado === 'pendiente' ? 'bg-warning' : 
                                              pedido.estado === 'cancelado' ? 'bg-danger' : 'bg-secondary'}`}>
                                {pedido.estado.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div className="card-body">
                        <h6 className="card-subtitle mb-3">Productos:</h6>
                        <div className="list-group">
                            {pedido.items.map((item) => (
                                <div key={item.id} className="list-group-item list-group-item-action">
                                    <div className="d-flex w-100 justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            {item.imagen && (
                                                <img 
                                                    src={item.imagen} 
                                                    alt={item.nombre} 
                                                    className="me-3" 
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                                />
                                            )}
                                            <div>
                                                <h6 className="mb-1">{item.nombre}</h6>
                                                <small className="text-muted">
                                                    Cantidad: {item.cantidad} x {parseFloat(item.precio_unitario).toFixed(2)}€
                                                </small>
                                            </div>
                                        </div>
                                        <span className="fw-bold">
                                            {(item.cantidad * parseFloat(item.precio_unitario)).toFixed(2)}€
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="d-flex justify-content-end mt-3">
                            <h5>Total: {parseFloat(pedido.total).toFixed(2)}€</h5>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default HistorialPedidos;