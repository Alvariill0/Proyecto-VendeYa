import { Link } from 'react-router-dom';
import logo from '../assets/VendeYa_Logo.png';

export default function Bienvenida() {
    return (
        <div className="min-vh-100 d-flex flex-column">
            {/* Header con logo */}
            <header className="bg-white shadow-sm">
                <div className="container">
                    <div className="d-flex justify-content-center">
                        <Link to="/" className="text-decoration-none">
                            <img src={logo} alt="VendeYa Logo" height="100" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Contenido principal */}
            <main className="flex-grow-1 d-flex align-items-center">
                <div className="container text-center">
                    <h2 className="display-4 mb-3">Bienvenido a VendeYa</h2>
                    <p className="lead mb-5">Tu marketplace de confianza</p>
                    
                    <div className="d-flex justify-content-center gap-3">
                        <Link to="/login" className="btn btn-primary btn-lg px-4">
                            Iniciar Sesión
                        </Link>
                        <Link to="/registro" className="btn btn-outline-primary btn-lg px-4">
                            Registrarse
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
} 