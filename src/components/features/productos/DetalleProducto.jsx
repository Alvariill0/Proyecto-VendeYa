import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { obtenerProducto } from '../../../services/servicioProductos';
import { useCarrito } from '../../../context/ContextoCarrito';
import { useAutenticacion } from '../../../context/ContextoAutenticacion';
import ValoracionesProducto from '../../../components/productos/ValoracionesProducto';

function DetalleProducto() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');
    const { agregar } = useCarrito();
    const { usuario } = useAutenticacion();
    
    // Verificar si el usuario es el propietario del producto
    const esProductoPropio = usuario && producto && usuario.id === producto.vendedor_id;

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

    const handleAgregarAlCarrito = async () => {
        try {
            // Si el producto es propio, no permitir añadirlo al carrito
            if (esProductoPropio) {
                setError('No puedes añadir tu propio producto al carrito');
                setTimeout(() => setError(null), 3000);
                return;
            }
            
            await agregar(producto.id);
            setMensajeExito('Producto añadido al carrito');
            // Limpiar el mensaje después de 3 segundos
            setTimeout(() => setMensajeExito(''), 3000);
        } catch (error) {
            setError('Error al añadir al carrito: ' + error.message);
            setTimeout(() => setError(null), 3000);
        }
    };
    
    // Función para ir al panel de edición del producto
    const handleEditarProducto = () => {
        navigate(`/editar-producto/${producto.id}`);
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
                        {esProductoPropio ? (
                            <button 
                                className="btn btn-warning btn-lg d-flex align-items-center justify-content-center" 
                                onClick={handleEditarProducto}
                            >
                                <i className="bi bi-pencil-square me-2 fs-5"></i> Editar mi producto
                            </button>
                        ) : (
                            <button 
                                className="btn btn-primary btn-lg d-flex align-items-center justify-content-center" 
                                onClick={handleAgregarAlCarrito}
                                disabled={producto.stock <= 0}
                            >
                                {producto.stock > 0 ? (
                                    <>
                                        <i className="bi bi-cart-plus-fill me-2 fs-5"></i> Añadir al carrito
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-x-circle-fill me-2 fs-5"></i> Producto agotado
                                    </>
                                )}
                            </button>
                        )}
                        <Link to="/principal" className="btn btn-outline-secondary d-flex align-items-center justify-content-center">
                            <i className="bi bi-arrow-left me-2 fs-5"></i> Volver a la lista de productos
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
            
            <div className="row mt-5">
                <div className="col-12">
                    <ValoracionesProducto productoId={producto.id} />
                </div>
            </div>
        </div>
    );
}

export default DetalleProducto;