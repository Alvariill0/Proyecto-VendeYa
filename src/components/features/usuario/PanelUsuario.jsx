import React, { useState, useEffect } from 'react';
import { useAutenticacion } from '../../../context/ContextoAutenticacion';
import { listarProductosVendedor } from '../../../services/servicioProductos';
import { Link, useNavigate } from 'react-router-dom';
import TablaProductos from './TablaProductos';
import PedidosRecientes from '../pedidos/PedidosRecientes';
import VentasRecientes from '../ventas/VentasRecientes';

function PanelUsuario() {
    const { usuario } = useAutenticacion();
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [seccionActiva, setSeccionActiva] = useState('productos');
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar si el usuario está autenticado
        if (!usuario) {
            navigate('/login');
            return;
        }

        // Cargar los productos del vendedor
        if (seccionActiva === 'productos') {
            cargarProductos();
        }
    }, [usuario, seccionActiva, navigate]);

    const cargarProductos = async () => {
        try {
            setCargando(true);
            setError(null);
            const productosObtenidos = await listarProductosVendedor(usuario.id);
            setProductos(productosObtenidos);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            setError('Error al cargar los productos. Por favor, intenta de nuevo.');
        } finally {
            setCargando(false);
        }
    };

    const handleCrearProducto = () => {
        navigate('/crear-producto');
    };

    const renderSeccion = () => {
        switch (seccionActiva) {
            case 'productos':
                return (
                    <div className="productos-container">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3>Mis Productos</h3>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleCrearProducto}
                            >
                                Crear Nuevo Producto
                            </button>
                        </div>
                        
                        {cargando ? (
                            <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        ) : productos.length === 0 ? (
                            <div className="alert alert-info" role="alert">
                                No tienes productos publicados. ¡Crea tu primer producto!
                            </div>
                        ) : (
                            <TablaProductos 
                                productos={productos} 
                                onRecargar={cargarProductos} 
                            />
                        )}
                    </div>
                );
            case 'pedidos':
                return (
                    <div className="pedidos-container">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3>Mis Pedidos Recientes</h3>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <PedidosRecientes limite={3} />
                            </div>
                        </div>
                    </div>
                );
            case 'ventas':
                return (
                    <div className="ventas-container">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3>Gestión de Mis Ventas</h3>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <VentasRecientes limite={3} />
                            </div>
                        </div>
                    </div>
                );
            case 'perfil':
                return (
                    <div className="perfil-container">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3>Mi Perfil</h3>
                        </div>
                        <div className="card shadow border-0">
                            <div className="card-body p-4">
                                <div className="row">
                                    <div className="col-md-4 text-center mb-4 mb-md-0">
                                        <div className="avatar-container mb-3">
                                            <div className="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto">
                                                <span className="display-4">{usuario.nombre.charAt(0).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <h4 className="mb-2">{usuario.nombre}</h4>
                                        <span className="badge bg-info rounded-pill px-3 py-2 shadow-sm">{usuario.rol}</span>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="info-section shadow-sm">
                                            <h5 className="border-bottom pb-2 mb-3">Información Personal</h5>
                                            <div className="mb-3">
                                                <div className="d-flex">
                                                    <div className="info-label">
                                                        <i className="bi bi-envelope-fill text-primary me-2"></i>
                                                        <strong>Email:</strong>
                                                    </div>
                                                    <div className="info-value ms-2">{usuario.email}</div>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="d-flex">
                                                    <div className="info-label">
                                                        <i className="bi bi-person-badge-fill text-primary me-2"></i>
                                                        <strong>Rol:</strong>
                                                    </div>
                                                    <div className="info-value ms-2">{usuario.rol}</div>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="d-flex">
                                                    <div className="info-label">
                                                        <i className="bi bi-calendar-check-fill text-primary me-2"></i>
                                                        <strong>Miembro desde:</strong>
                                                    </div>
                                                    <div className="info-value ms-2">Enero 2023</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <button className="btn btn-primary me-2 shadow-sm">
                                                <i className="bi bi-pencil-fill me-2"></i>Editar Perfil
                                            </button>
                                            <button className="btn btn-secondary shadow-sm">
                                                <i className="bi bi-key-fill me-2"></i>Cambiar Contraseña
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!usuario) {
        return null; // No renderizar nada si no hay usuario (redirigirá a login)
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Panel de Usuario</h2>
            
            <div className="row">
                <div className="col-md-3">
                    <div className="list-group">
                        <button
                            className={`list-group-item list-group-item-action ${seccionActiva === 'productos' ? 'active' : ''}`}
                            onClick={() => setSeccionActiva('productos')}
                        >
                            Mis Productos
                        </button>
                        <button
                            className={`list-group-item list-group-item-action ${seccionActiva === 'pedidos' ? 'active' : ''}`}
                            onClick={() => setSeccionActiva('pedidos')}
                        >
                            Mis Pedidos
                        </button>
                        <button
                            className={`list-group-item list-group-item-action ${seccionActiva === 'ventas' ? 'active' : ''}`}
                            onClick={() => setSeccionActiva('ventas')}
                        >
                            Mis Ventas
                        </button>
                        <button
                            className={`list-group-item list-group-item-action ${seccionActiva === 'perfil' ? 'active' : ''}`}
                            onClick={() => setSeccionActiva('perfil')}
                        >
                            Mi Perfil
                        </button>
                        {usuario.rol === 'admin' && (
                            <Link 
                                to="/admin-categorias" 
                                className="list-group-item list-group-item-action"
                            >
                                Administrar Categorías
                            </Link>
                        )}
                    </div>
                </div>
                
                <div className="col-md-9">
                    {renderSeccion()}
                </div>
            </div>
        </div>
    );
}

export default PanelUsuario;