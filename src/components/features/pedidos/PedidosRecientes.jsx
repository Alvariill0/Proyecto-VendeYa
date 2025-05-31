import React from 'react';
import { Link } from 'react-router-dom';
import { usePedidos } from '../../../hooks/usePedidos';
import EstadoPedido from '../../common/EstadoPedido';
import EstadoCarga from '../../common/EstadoCarga';

/**
 * Componente que muestra los pedidos más recientes del usuario
 * @param {Object} props - Propiedades del componente
 * @param {number} props.limite - Número máximo de pedidos a mostrar
 * @returns {JSX.Element} Componente de pedidos recientes
 */
function PedidosRecientes({ limite = 3 }) {
    const { 
        pedidos, 
        cargando, 
        error, 
        formatearFecha 
    } = usePedidos({
        limite,
        ordenarPorRecientes: true,
        cargarAlInicio: true
    });

    return (
        <div className="pedidos-recientes">
            <EstadoCarga 
                cargando={cargando} 
                error={error} 
                vacio={pedidos.length === 0}
                mensajeVacio="No tienes pedidos realizados todavía."
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
                    <Link to="/historial-pedidos" className="btn btn-outline-primary">
                        Ver historial completo
                    </Link>
                </div>
            </EstadoCarga>
        </div>
    );
}

export default PedidosRecientes;