import { useState } from 'react';
import { useAutenticacion } from '../../../context/ContextoAutenticacion';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../../assets/VendeYa_Logo.png';
import { useTheme } from '../../../context/ContextoTema';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, cargando } = useAutenticacion();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const manejarSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/principal'); // Redirige a la página principal después del login
        } catch (error) {
            console.error('Error en el login:', error);
        }
    };

    return (
        <div className={`min-vh-100 d-flex flex-column ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}>
            {/* Header con logo y toggle de tema */}
            <header className={`${isDarkMode ? 'bg-dark border-bottom border-secondary' : 'bg-white shadow-sm'} py-3`}>
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center">
                        <div></div> {/* Espacio vacío para centrar el logo */}
                        <Link to="/" className="text-decoration-none">
                            <img src={logo} alt="VendeYa Logo" height="80" />
                        </Link>
                        <button 
                            onClick={toggleTheme} 
                            className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'} d-flex align-items-center gap-2`}
                            aria-label="Cambiar tema"
                        >
                            {isDarkMode ? <FaSun /> : <FaMoon />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Contenido principal */}
            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-6 col-lg-5">
                        <div className={`card ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                            <div className="card-body p-4">
                                <h2 className="text-center mb-4">Iniciar Sesión</h2>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={manejarSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">
                                            Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={cargando}
                                    >
                                        {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                    </button>
                                </form>
                                <div className="text-center mt-3">
                                    <p className={isDarkMode ? 'text-light-50' : ''}>
                                        ¿No tienes una cuenta?{' '}
                                        <Link to="/registro" className="text-decoration-none">
                                            Regístrate aquí
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}