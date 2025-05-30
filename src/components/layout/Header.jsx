import { Link, useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../../context/ContextoAutenticacion';
import logo from '../../assets/VendeYa_Logo.png';

export default function Header() {
    const { logout } = useAutenticacion();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center py-3 gap-3">
                    {/* Logo */}
                    <Link to="/principal" className="text-decoration-none p-0">
                        <img src={logo} alt="VendeYa Logo" height="100" />
                    </Link>

                    {/* Buscador */}
                    <div className="flex-grow-1">
                        <input
                            type="search"
                            className="form-control"
                            placeholder="Buscar productos..."
                        />
                    </div>

                    {/* Botones de navegación */}
                    <div className="d-flex align-items-center gap-3">
                        <Link to="/mensajes" className="btn btn-outline-primary">
                            <i className="bi bi-envelope"></i>
                        </Link>
                        <Link to="/perfil" className="btn btn-outline-primary">
                            <i className="bi bi-person"></i>
                        </Link>
                        <Link to="/vender" className="btn btn-primary">
                            Vender
                        </Link>
                        <button onClick={handleLogout} className="btn btn-outline-danger">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
} 