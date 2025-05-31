import React from 'react';
import { usePedidos } from '../../../hooks/usePedidos';
import EstadoPedido from '../../common/EstadoPedido';
import ItemPedido from '../../common/ItemPedido';
import EstadoCarga from '../../common/EstadoCarga';
import { useTheme } from '../../../context/ContextoTema';

/**
 * Componente que muestra el historial completo de pedidos del usuario
 * @returns {JSX.Element} Componente de historial de pedidos
 */
function HistorialPedidos() {
    const { isDarkMode } = useTheme();
    const { 
        pedidos, 
        cargando, 
        error, 
        formatearFecha 
    } = usePedidos({
        ordenarPorRecientes: true,
        cargarAlInicio: true
    });

    return (
        <div className="container my-4">
            <h2 className="mb-4">Historial de Pedidos</h2>
            
            <EstadoCarga 
                cargando={cargando} 
                error={error} 
                vacio={pedidos.length === 0}
                mensajeVacio="No tienes pedidos realizados todavía."
                className="my-4"
            >
                {pedidos.map((pedido) => (
                    <div key={pedido.id} className="card mb-4 shadow-sm">
                        <div className={`card-header d-flex justify-content-between align-items-center ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}>
                            <div>
                                <h5 className="mb-0">Pedido #{pedido.id}</h5>
                                <small className={isDarkMode ? 'text-light-50' : 'text-muted'}>{formatearFecha(pedido.fecha_pedido)}</small>
                            </div>
                            <EstadoPedido estado={pedido.estado} />
                        </div>
                        <div className="card-body">
                            <h6 className="card-subtitle mb-3">Productos:</h6>
                            <div className="list-group">
                                {pedido.items.map((item) => (
                                    <ItemPedido 
                                        key={item.id} 
                                        item={item} 
                                        mostrarImagen={true} 
                                        mostrarPrecioTotal={true} 
                                    />
                                ))}
                            </div>
                            <div className="d-flex justify-content-end mt-3">
                                <h5>Total: {parseFloat(pedido.total).toFixed(2)}€</h5>
                            </div>
                        </div>
                    </div>
                ))}
            </EstadoCarga>
        </div>
    );
}

export default HistorialPedidos;