import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerProducto } from '../../../services/servicioProductos';
import { useCarrito } from '../../../context/ContextoCarrito';

function DetalleProducto() {
    const { id } = useParams();
    const [producto, setProducto] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');
    const { agregar } = useCarrito();

    useEffect(() => {
        const cargarProducto = async () => {
            try {
                setCargando(true);
                setError(null);
                const productoObtenido = await obtenerProducto(id);
                setProducto(productoObtenido);
            } catch (error) {
                setError(error.message);
                console.error('Error al obtener el producto:', error);
            } finally {
                setCargando(false);
            }
        };

        cargarProducto();
    }, [id]);

    const handleAgregarAlCarrito = () => {
        try {
            agregar(producto.id);
            setMensajeExito('Producto añadido al carrito');
            // Limpiar el mensaje después de 3 segundos
            setTimeout(() => setMensajeExito(''), 3000);
        } catch (error) {
            setError('Error al añadir al carrito: ' + error.message);
        }
    };

    if (cargando) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando detalles del producto...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <Link to="/principal" className="btn btn-primary">
                    Volver a la lista de productos
                </Link>
            </div>
        );
    }

    if (!producto) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning" role="alert">
                    Producto no encontrado
                </div>
                <Link to="/principal" className="btn btn-primary">
                    Volver a la lista de productos
                </Link>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {mensajeExito && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {mensajeExito}
                    <button type="button" className="btn-close" onClick={() => setMensajeExito('')} aria-label="Close"></button>
                </div>
            )}

            <div className="row">
                <div className="col-md-6">
                    <img 
                        src={producto.imagen || 'https://via.placeholder.com/400x300?text=Sin+imagen'} 
                        alt={producto.nombre} 
                        className="img-fluid rounded" 
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                    />
                </div>
                <div className="col-md-6">
                    <h1 className="mb-3">{producto.nombre}</h1>
                    <p className="text-muted">Categoría: {producto.categoria_nombre || 'Sin categoría'}</p>
                    <p className="text-muted">Vendedor: {producto.vendedor_nombre}</p>
                    
                    <div className="mb-3">
                        <h3 className="text-primary">{producto.precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</h3>
                    </div>
                    
                    <div className="mb-4">
                        <p className={`fw-bold ${producto.stock > 0 ? 'text-success' : 'text-danger'}`}>
                            {producto.stock > 0 ? `Stock disponible: ${producto.stock} unidades` : 'Sin stock'}
                        </p>
                    </div>
                    
                    <div className="d-grid gap-2">
                        <button 
                            className="btn btn-primary btn-lg" 
                            onClick={handleAgregarAlCarrito}
                            disabled={producto.stock <= 0}
                        >
                            {producto.stock > 0 ? 'Añadir al carrito' : 'Producto agotado'}
                        </button>
                        <Link to="/principal" className="btn btn-outline-secondary">
                            Volver a la lista de productos
                        </Link>
                    </div>
                </div>
            </div>
            
            <div className="row mt-5">
                <div className="col-12">
                    <h3>Descripción</h3>
                    <div className="card">
                        <div className="card-body">
                            <p className="card-text">{producto.descripcion || 'No hay descripción disponible para este producto.'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Aquí se podría añadir una sección para valoraciones y comentarios en el futuro */}
        </div>
    );
}

export default DetalleProducto;