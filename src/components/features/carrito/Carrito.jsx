import React, { useEffect } from 'react';
import { useCarrito } from '../../../context/ContextoCarrito';
import { Link } from 'react-router-dom';

function Carrito() {
    const { 
        items, 
        cargando, 
        error, 
        totalItems, 
        totalPrecio, 
        actualizarCantidad, 
        eliminar, 
        vaciar, 
        cargarCarrito 
    } = useCarrito();

    // Cargar el carrito al montar el componente
    useEffect(() => {
        cargarCarrito();
    }, []);

    // Función para manejar el cambio de cantidad
    const handleCantidadChange = (itemId, nuevaCantidad) => {
        if (nuevaCantidad >= 1) {
            actualizarCantidad(itemId, nuevaCantidad);
        }
    };

    // Función para eliminar un item
    const handleEliminar = (itemId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este producto del carrito?')) {
            eliminar(itemId);
        }
    };

    // Función para vaciar el carrito
    const handleVaciar = () => {
        if (window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
            vaciar();
        }
    };

    if (cargando) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                Error al cargar el carrito: {error}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body text-center">
                                <h2 className="mb-4">Tu carrito está vacío</h2>
                                <p className="mb-4">Parece que aún no has añadido productos a tu carrito.</p>
                                <Link to="/principal" className="btn btn-primary">
                                    Explorar productos
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="mb-4">Tu Carrito de Compras</h2>

            <div className="row">
                {/* Lista de productos en el carrito */}
                <div className="col-md-8">
                    <div className="card mb-4">
                        <div className="card-body">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Producto</th>
                                        <th scope="col">Precio</th>
                                        <th scope="col">Cantidad</th>
                                        <th scope="col">Subtotal</th>
                                        <th scope="col">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {item.imagen && (
                                                        <img 
                                                            src={item.imagen} 
                                                            alt={item.nombre} 
                                                            className="img-thumbnail me-3" 
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                                        />
                                                    )}
                                                    <div>
                                                        <h6 className="mb-0">{item.nombre}</h6>
                                                        <small className="text-muted">{item.vendedor_nombre}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{parseFloat(item.precio).toFixed(2)} €</td>
                                            <td>
                                                <div className="input-group input-group-sm" style={{ width: '120px' }}>
                                                    <button 
                                                        className="btn btn-outline-secondary" 
                                                        type="button"
                                                        onClick={() => handleCantidadChange(item.id, item.cantidad - 1)}
                                                        disabled={item.cantidad <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <input 
                                                        type="number" 
                                                        className="form-control text-center" 
                                                        value={item.cantidad} 
                                                        min="1"
                                                        onChange={(e) => handleCantidadChange(item.id, parseInt(e.target.value) || 1)}
                                                        readOnly
                                                    />
                                                    <button 
                                                        className="btn btn-outline-secondary" 
                                                        type="button"
                                                        onClick={() => handleCantidadChange(item.id, item.cantidad + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td>{(parseFloat(item.precio) * item.cantidad).toFixed(2)} €</td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleEliminar(item.id)}
                                                >
                                                    <i className="bi bi-trash"></i> Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="d-flex justify-content-end">
                                <button 
                                    className="btn btn-outline-danger"
                                    onClick={handleVaciar}
                                >
                                    Vaciar carrito
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumen del carrito */}
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Resumen del pedido</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-3">
                                <span>Productos ({totalItems}):</span>
                                <span>{totalPrecio.toFixed(2)} €</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Envío:</span>
                                <span>Gratis</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-3 fw-bold">
                                <span>Total:</span>
                                <span>{totalPrecio.toFixed(2)} €</span>
                            </div>
                            <button className="btn btn-success w-100">
                                Proceder al pago
                            </button>
                            <div className="mt-3">
                                <Link to="/principal" className="btn btn-link w-100">
                                    Continuar comprando
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Carrito;