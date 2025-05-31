import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProveedorAutenticacion } from './context/ContextoAutenticacion'
import { useAutenticacion } from './context/ContextoAutenticacion'
import { ProveedorCarrito } from './context/ContextoCarrito'
import Login from './components/features/auth/Login'
import Registro from './components/features/auth/Registro'
import Bienvenida from './pages/Bienvenida'
import Principal from './pages/Principal'
import Layout from './components/layout/Layout'
import CrearProductoForm from './components/features/productos/CrearProductoForm'
import CarritoPage from './pages/CarritoPage'
import HistorialPedidosPage from './pages/HistorialPedidosPage'
import DetalleProductoPage from './pages/DetalleProductoPage'
import PanelUsuarioPage from './pages/PanelUsuarioPage'
import EditarProductoPage from './pages/EditarProductoPage'
import AdminCategoriasPage from './pages/AdminCategoriasPage'
import PedidosVendedorPage from './pages/PedidosVendedorPage'
import './App.css'

// Componente para rutas protegidas
function RutaProtegida({ children, rol }) {
    const { usuario } = useAutenticacion()
    
    if (!usuario) {
        return <Navigate to="/" />
    }

    // Si se requiere un rol específico y el usuario no lo tiene, redirigir al panel de usuario
    if (rol && usuario.rol !== rol) {
        return <Navigate to="/panel-usuario" />
    }

    return <Layout>{children}</Layout>
}

// Componente para rutas públicas
function RutaPublica({ children }) {
    const { usuario } = useAutenticacion()

    if (usuario) {
        return <Navigate to="/principal" />
    }

    return children
}

function App() {
    return (
        <Router>
            <ProveedorAutenticacion>
                <ProveedorCarrito>
                    <Routes>
                        {/* Rutas públicas */}
                        <Route
                            path="/"
                            element={
                                <RutaPublica>
                                    <Bienvenida />
                                </RutaPublica>
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                <RutaPublica>
                                    <Login />
                                </RutaPublica>
                            }
                        />
                        <Route
                            path="/registro"
                            element={
                                <RutaPublica>
                                    <Registro />
                                </RutaPublica>
                            }
                        />

                        {/* Rutas protegidas */}
                        <Route
                            path="/principal"
                            element={
                                <RutaProtegida>
                                    <Principal />
                                </RutaProtegida>
                            }
                        />
                        <Route
                            path="/principal/:categoriaId"
                            element={
                                <RutaProtegida>
                                    <Principal />
                                </RutaProtegida>
                            }
                        />
                        <Route
                            path="/crear-producto"
                            element={
                                <RutaProtegida>
                                    <CrearProductoForm />
                                </RutaProtegida>
                            }
                        />
                        <Route
                            path="/carrito"
                            element={
                                <RutaProtegida>
                                    <CarritoPage />
                                </RutaProtegida>
                            }
                        />
                        <Route
                            path="/historial-pedidos"
                            element={
                                <RutaProtegida>
                                    <HistorialPedidosPage />
                                </RutaProtegida>
                            }
                        />
                        <Route
                            path="/producto/:id"
                            element={
                                <RutaProtegida>
                                    <DetalleProductoPage />
                                </RutaProtegida>
                            }
                        />
                        <Route
                            path="/panel-usuario"
                            element={
                                <RutaProtegida>
                                    <PanelUsuarioPage />
                                </RutaProtegida>
                            }
                        />
                        <Route
                            path="/editar-producto/:id"
                            element={
                                <RutaProtegida>
                                    <EditarProductoPage />
                                </RutaProtegida>
                            }
                        />
                        {/* Ruta para administrar categorías (solo admin) */}
                        <Route
                            path="/admin-categorias"
                            element={
                                <RutaProtegida rol="admin">
                                    <AdminCategoriasPage />
                                </RutaProtegida>
                            }
                        />
                        {/* Ruta para gestionar pedidos como vendedor */}
                        <Route
                            path="/mis-ventas"
                            element={
                                <RutaProtegida>
                                    <PedidosVendedorPage />
                                </RutaProtegida>
                            }
                        />
                        {/* Ruta temporal para mensajes (funcionalidad en desarrollo) */}
                        <Route
                            path="/mensajes"
                            element={
                                <RutaProtegida>
                                    <div className="container mt-5">
                                        <div className="alert alert-info">
                                            <h4 className="alert-heading">¡Funcionalidad en desarrollo!</h4>
                                            <p>El sistema de mensajería estará disponible próximamente.</p>
                                        </div>
                                    </div>
                                </RutaProtegida>
                            }
                        />
                        {/* Ruta para manejar rutas no encontradas */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </ProveedorCarrito>
            </ProveedorAutenticacion>
        </Router>
    )
}

export default App
