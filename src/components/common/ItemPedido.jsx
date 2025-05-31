import React from 'react';
import { useTheme } from '../../context/ContextoTema';

/**
 * Componente para mostrar un ítem de pedido
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.item - Datos del ítem
 * @param {boolean} props.mostrarImagen - Si es true, muestra la imagen del producto
 * @param {boolean} props.mostrarPrecioTotal - Si es true, muestra el precio total del ítem
 * @returns {JSX.Element} Elemento de lista con los datos del ítem
 */
function ItemPedido({ item, mostrarImagen = true, mostrarPrecioTotal = true }) {
    const { isDarkMode } = useTheme();
    return (
        <div className={`list-group-item list-group-item-action ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}>
            <div className="d-flex w-100 justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    {mostrarImagen && item.imagen && (
                        <img 
                            src={item.imagen} 
                            alt={item.nombre} 
                            className="me-3" 
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                        />
                    )}
                    <div>
                        <h6 className="mb-1">{item.nombre}</h6>
                        <small className={isDarkMode ? 'text-light-50' : 'text-muted'}>
                            Cantidad: {item.cantidad} x {parseFloat(item.precio_unitario).toFixed(2)}€
                        </small>
                    </div>
                </div>
                {mostrarPrecioTotal && (
                    <span className="fw-bold">
                        {(item.cantidad * parseFloat(item.precio_unitario)).toFixed(2)}€
                    </span>
                )}
            </div>
        </div>
    );
}

export default ItemPedido;