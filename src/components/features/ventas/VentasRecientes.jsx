import React from 'react';
import { Link } from 'react-router-dom';
import { usePedidosVendedor } from '../../../hooks/usePedidosVendedor';
import EstadoPedido from '../../common/EstadoPedido';
import EstadoCarga from '../../common/EstadoCarga';

/**
 * Componente que muestra las ventas más recientes del usuario
 * @param {Object} props - Propiedades del componente
 * @param {number} props.limite - Número máximo de ventas a mostrar
 * @returns {JSX.Element} Componente de ventas recientes
 */
function VentasRecientes({ limite = 3 }) {
    const { 
        pedidos, 
        cargando, 
        error, 
        formatearFecha,
        hayPedidos
    } = usePedidosVendedor({
        limite,
        ordenarPorRecientes: true,
        cargarAlInicio: true
    });

    return (
        <div className="ventas-recientes">
            <EstadoCarga 
                cargando={cargando} 
                error={error} 
                vacio={!hayPedidos}
                mensajeVacio="No tienes ventas realizadas todavía."
                className="my-3"
            >
                <div className="list-group">
                    {pedidos.map((pedido) => (
                        <div key={pedido.id} className="list-group-item list-group-item-action">
                            <div className="d-flex w-100 justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1">Pedido #{pedido.id}</h6>
                                    <small className="text-muted">{formatearFecha(pedido.fecha_pedido)}</small>
                                </div>
                                <div className="d-flex align-items-center">
                                    <EstadoPedido estado={pedido.estado} className="me-2" />
                                    <span className="fw-bold">
                                        {pedido.items.reduce((total, item) => total + (parseFloat(item.precio_unitario) * item.cantidad), 0).toFixed(2)}€
                                    </span>
                                </div>
                            </div>
                            <small className="d-block mt-2">
                                Cliente: {pedido.comprador_nombre} - 
                                {pedido.items.length} {pedido.items.length === 1 ? 'producto' : 'productos'}
                            </small>
                        </div>
                    ))}
                </div>
                
                <div className="d-flex justify-content-between mt-3">
                    <Link to="/estadisticas-ventas" className="btn btn-success text-white">
                        <i className="bi bi-graph-up"></i> Estadísticas
                    </Link>
                    <Link to="/mis-ventas" className="btn btn-outline-primary">
                        Ver historial completo
                    </Link>
                </div>
            </EstadoCarga>
        </div>
    );
}

export default VentasRecientes;