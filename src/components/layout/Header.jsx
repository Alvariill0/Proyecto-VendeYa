import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../../context/ContextoAutenticacion';
import { useCarrito } from '../../context/ContextoCarrito';
import { useTheme } from '../../context/ContextoTema';
import logo from '../../assets/VendeYa_Logo-nobg.png';

export default function Header() {
    const { logout } = useAutenticacion();
    const { totalItems } = useCarrito();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [mostrarMenu, setMostrarMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    const handleBusqueda = (e) => {
        e.preventDefault();
        if (terminoBusqueda.trim()) {
            navigate(`/principal?busqueda=${encodeURIComponent(terminoBusqueda.trim())}`);
        } else {
            navigate('/principal');
        }
    };

    const toggleMenu = () => {
        setMostrarMenu(!mostrarMenu);
    };

    return (
        <header className={`shadow-sm header ${isDarkMode ? 'bg-dark text-light' : 'bg-white'}`}>
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center py-3 gap-3">
                    {/* Logo */}
                    <Link to="/principal" className="text-decoration-none p-0">
                        <img src={logo} alt="VendeYa Logo" height="100" className="img-fluid" style={{ maxHeight: '60px' }} />
                    </Link>

                    {/* Buscador - Oculto en móviles */}
                    <div className="flex-grow-1 d-none d-md-block">
                        <form onSubmit={handleBusqueda} className="d-flex">
                            <input
                                type="search"
                                className={`form-control me-2 ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                placeholder="Buscar productos..."
                                value={terminoBusqueda}
                                onChange={(e) => setTerminoBusqueda(e.target.value)}
                                aria-label="Buscar productos"
                            />
                            <button type="submit" className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-primary'} d-flex align-items-center`}>
                                <i className="bi bi-search me-2"></i> Buscar
                            </button>
                        </form>
                    </div>

                    {/* Botón de menú hamburguesa - Solo visible en móviles */}
                    <button 
                        className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-primary'} d-md-none`}
                        onClick={toggleMenu}
                        aria-label="Menú"
                    >
                        <i className="bi bi-list fs-4"></i>
                    </button>

                    {/* Botones de navegación - Ocultos en móviles */}
                    <div className="d-none d-md-flex align-items-center gap-3">
                        <Link to="/mensajes" className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-primary'} d-flex align-items-center`}>
                            <i className="bi bi-chat-dots-fill me-2 fs-5"></i> Mensajes
                        </Link>
                        <Link to="/panel-usuario" className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-primary'} d-flex align-items-center`}>
                            <i className="bi bi-person-circle me-2 fs-5"></i> Mi Panel
                        </Link>
                        <Link to="/carrito" className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-primary'} position-relative d-flex align-items-center`}>
                            <i className="bi bi-cart-fill me-2 fs-5"></i> Carrito
                            {totalItems > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                        <Link to="/crear-producto" className="btn btn-primary d-flex align-items-center">
                            <i className="bi bi-bag-plus-fill me-2 fs-5"></i> Vender
                        </Link>
                        <button onClick={handleLogout} className="btn btn-outline-danger d-flex align-items-center">
                            <i className="bi bi-box-arrow-right me-2 fs-5"></i> Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* Menú móvil desplegable */}
                <div className={`d-md-none ${mostrarMenu ? 'd-block' : 'd-none'} py-3 border-top`}>
                    {/* Buscador para móviles */}
                    <form onSubmit={handleBusqueda} className="d-flex mb-3">
                        <input
                            type="search"
                            className={`form-control me-2 ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                            placeholder="Buscar productos..."
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                            aria-label="Buscar productos"
                        />
                        <button type="submit" className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}>
                            <i className="bi bi-search"></i>
                        </button>
                    </form>

                    {/* Enlaces del menú móvil */}
                    <div className="d-flex flex-column gap-2">
                        <Link to="/mensajes" className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-primary'} w-100 text-start`}>
                            <i className="bi bi-chat-dots-fill me-2"></i> Mensajes
                        </Link>
                        <Link to="/panel-usuario" className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-primary'} w-100 text-start`}>
                            <i className="bi bi-person-circle me-2"></i> Mi Panel
                        </Link>
                        <Link to="/carrito" className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-primary'} w-100 text-start position-relative`}>
                            <i className="bi bi-cart-fill me-2"></i> Carrito
                            {totalItems > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                        <Link to="/crear-producto" className="btn btn-primary w-100 text-start">
                            <i className="bi bi-bag-plus-fill me-2"></i> Vender
                        </Link>
                        <button onClick={handleLogout} className="btn btn-outline-danger w-100 text-start">
                            <i className="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}