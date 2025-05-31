import { useState } from 'react';
import { useAutenticacion } from '../../../context/ContextoAutenticacion';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../../assets/VendeYa_Logo.png';
import { useTheme } from '../../../context/ContextoTema';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function Registro() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const { registro, error, cargando } = useAutenticacion();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const manejarSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmarPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        try {
            await registro(nombre, email, password);
            navigate('/login'); // Redirige al login después del registro exitoso
        } catch (error) {
            console.error('Error en el registro:', error);
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
                                <h2 className="text-center mb-4">Registro</h2>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={manejarSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="nombre" className="form-label">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                            id="nombre"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            required
                                        />
                                    </div>
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
                                    <div className="mb-3">
                                        <label htmlFor="confirmarPassword" className="form-label">
                                            Confirmar Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                            id="confirmarPassword"
                                            value={confirmarPassword}
                                            onChange={(e) => setConfirmarPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={cargando}
                                    >
                                        {cargando ? 'Registrando...' : 'Registrarse'}
                                    </button>
                                </form>
                                <div className="text-center mt-3">
                                    <p className={isDarkMode ? 'text-light-50' : ''}>
                                        ¿Ya tienes una cuenta?{' '}
                                        <Link to="/login" className="text-decoration-none">
                                            Inicia sesión aquí
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