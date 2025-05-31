import React, { useState, useEffect } from 'react';
import { useAutenticacion } from '../../../context/ContextoAutenticacion';
import { listarProductosVendedor } from '../../../services/servicioProductos';
import { Link, useNavigate } from 'react-router-dom';
import TablaProductos from './TablaProductos';
import PedidosRecientes from '../pedidos/PedidosRecientes';
import PedidosVendedor from '../../../components/PedidosVendedor';

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
                        <PedidosVendedor />
                    </div>
                );
            case 'perfil':
                return (
                    <div className="perfil-container">
                        <h3>Mi Perfil</h3>
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{usuario.nombre}</h5>
                                <p className="card-text"><strong>Email:</strong> {usuario.email}</p>
                                <p className="card-text"><strong>Rol:</strong> {usuario.rol}</p>
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