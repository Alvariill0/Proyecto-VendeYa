import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ContextoTema';
import logo from '../../assets/VendeYa_Logo.png';

export default function Footer() {
    const { toggleTheme, isDarkMode } = useTheme();

    return (
        <footer className={`py-4 border-top mt-auto ${isDarkMode ? 'bg-dark text-light' : 'bg-white'}`}>
            <div className="container-fluid">
                <div className="row">
                    {/* Logo y copyright */}
                    <div className="col-12 col-md-3 mb-4 mb-md-0">
                        <div className="d-flex flex-column align-items-center align-items-md-start">
                            <Link to="/principal" className="text-decoration-none mb-2">
                                <img src={logo} alt="VendeYa Logo" height="60" />
                            </Link>
                            <p className="text-muted small">
                                © 2024-2025 VendeYa. Todos los derechos reservados
                            </p>
                        </div>
                    </div>

                    {/* Enlaces de VendeYa */}
                    <div className="col-6 col-md-2 mb-3">
                        <h6 className="fw-bold mb-3">VendeYa</h6>
                        <ul className="nav flex-column">
                            <li className="nav-item mb-2">
                                <Link to="/quienes-somos" className="nav-link p-0 text-muted">Quiénes somos</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/como-funciona" className="nav-link p-0 text-muted">Cómo funciona</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Enlaces de Soporte */}
                    <div className="col-6 col-md-2 mb-3">
                        <h6 className="fw-bold mb-3">Soporte</h6>
                        <ul className="nav flex-column">
                            <li className="nav-item mb-2">
                                <Link to="/centro-ayuda" className="nav-link p-0 text-muted">Centro de ayuda</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/normas-comunidad" className="nav-link p-0 text-muted">Normas de la comunidad</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/contacto" className="nav-link p-0 text-muted">Contacto</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Enlaces Legales */}
                    <div className="col-6 col-md-2 mb-3">
                        <h6 className="fw-bold mb-3">Legal</h6>
                        <ul className="nav flex-column">
                            <li className="nav-item mb-2">
                                <Link to="/aviso-legal" className="nav-link p-0 text-muted">Aviso legal</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/condiciones-uso" className="nav-link p-0 text-muted">Condiciones de uso</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/privacidad" className="nav-link p-0 text-muted">Política de privacidad</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/cookies" className="nav-link p-0 text-muted">Política de Cookies</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Redes sociales y modo oscuro */}
                    <div className="col-6 col-md-3 mb-3">
                        <h6 className="fw-bold mb-3">Síguenos</h6>
                        <div className="d-flex gap-3 mb-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted fs-5">
                                <i className="bi bi-facebook"></i>
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted fs-5">
                                <i className="bi bi-twitter-x"></i>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted fs-5">
                                <i className="bi bi-instagram"></i>
                            </a>
                        </div>
                        
                        {/* Botón de modo oscuro */}
                        <div>
                            <button 
                                onClick={toggleTheme} 
                                className={`btn ${isDarkMode ? 'btn-light' : 'btn-dark'} d-flex align-items-center gap-2`}
                            >
                                <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
                                {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}