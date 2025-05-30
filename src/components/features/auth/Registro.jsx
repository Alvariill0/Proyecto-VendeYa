import { useState } from 'react';
import { useAutenticacion } from '../../../context/ContextoAutenticacion';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../../assets/VendeYa_Logo.png';    

export default function Registro() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const { registro, error, cargando } = useAutenticacion();
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
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-12">
                        <div className="card">
                            <div className="card-body">
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
                                            className="form-control"
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
                                            className="form-control"
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
                                            className="form-control"
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
                                            className="form-control"
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
                                    <p>
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