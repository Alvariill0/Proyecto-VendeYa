import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eliminarProducto } from '../../../services/servicioProductos';

function TablaProductos({ productos, onRecargar }) {
    const [eliminando, setEliminando] = useState(false);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const navigate = useNavigate();

    const handleEditar = (productoId) => {
        navigate(`/editar-producto/${productoId}`);
    };

    const handleEliminar = async (productoId) => {
        try {
            setEliminando(true);
            setError(null);
            setMensajeExito('');
            
            await eliminarProducto(productoId);
            
            setMensajeExito('Producto eliminado correctamente');
            // Recargar la lista de productos
            if (onRecargar) {
                onRecargar();
            }
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            setError('Error al eliminar el producto. Por favor, intenta de nuevo.');
        } finally {
            setEliminando(false);
            setProductoSeleccionado(null);
        }
    };

    const confirmarEliminar = (producto) => {
        setProductoSeleccionado(producto);
    };

    const cancelarEliminar = () => {
        setProductoSeleccionado(null);
    };

    return (
        <div>
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            
            {mensajeExito && (
                <div className="alert alert-success" role="alert">
                    {mensajeExito}
                </div>
            )}
            
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map(producto => (
                            <tr key={producto.id}>
                                <td>
                                    <img 
                                        src={producto.imagen || 'https://via.placeholder.com/50'} 
                                        alt={producto.nombre} 
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                    />
                                </td>
                                <td>{producto.nombre}</td>
                                <td>{producto.categoria_nombre || 'Sin categoría'}</td>
                                <td>${producto.precio}</td>
                                <td>{producto.stock}</td>
                                <td>
                                    <div className="btn-group" role="group">
                                        <button 
                                            className="btn btn-sm btn-outline-primary" 
                                            onClick={() => handleEditar(producto.id)}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-outline-danger" 
                                            onClick={() => confirmarEliminar(producto)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Modal de confirmación para eliminar */}
            {productoSeleccionado && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirmar eliminación</h5>
                                <button type="button" className="btn-close" onClick={cancelarEliminar}></button>
                            </div>
                            <div className="modal-body">
                                <p>¿Estás seguro de que deseas eliminar el producto <strong>{productoSeleccionado.nombre}</strong>?</p>
                                <p className="text-danger">Esta acción no se puede deshacer.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={cancelarEliminar}>Cancelar</button>
                                <button 
                                    type="button" 
                                    className="btn btn-danger" 
                                    onClick={() => handleEliminar(productoSeleccionado.id)}
                                    disabled={eliminando}
                                >
                                    {eliminando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            <span className="ms-2">Eliminando...</span>
                                        </>
                                    ) : 'Eliminar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TablaProductos;