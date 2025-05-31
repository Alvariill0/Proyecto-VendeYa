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
import './App.css'

// Componente para rutas protegidas
function RutaProtegida({ children }) {
    const { usuario } = useAutenticacion()
    
    if (!usuario) {
        return <Navigate to="/" />
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
                            path="/principal/:categoriaId?"
                            element={
                                <RutaProtegida>
                                    <Principal />
                                </RutaProtegida>
                            }
                        />
                        {/* Ruta para crear producto (protegida) */}
                        <Route
                            path="/crear-producto"
                            element={
                                <RutaProtegida>
                                    <CrearProductoForm />
                                </RutaProtegida>
                            }
                        />
                        {/* Ruta para el carrito (protegida) */}
                        <Route
                            path="/carrito"
                            element={
                                <RutaProtegida>
                                    <CarritoPage />
                                </RutaProtegida>
                            }
                        />
                        {/* Ruta para el historial de pedidos (protegida) */}
                        <Route
                            path="/mis-pedidos"
                            element={
                                <RutaProtegida>
                                    <HistorialPedidosPage />
                                </RutaProtegida>
                            }
                        />
                        {/* Ruta para el detalle de producto (protegida) */}
                        <Route
                            path="/producto/:id"
                            element={
                                <RutaProtegida>
                                    <DetalleProductoPage />
                                </RutaProtegida>
                            }
                        />
                        {/* Ruta para el panel de usuario (protegida) */}
                        <Route
                            path="/mi-panel"
                            element={
                                <RutaProtegida>
                                    <PanelUsuarioPage />
                                </RutaProtegida>
                            }
                        />
                        {/* Ruta para editar producto (protegida) */}
                        <Route
                            path="/editar-producto/:id"
                            element={
                                <RutaProtegida>
                                    <EditarProductoPage />
                                </RutaProtegida>
                            }
                        />
                    </Routes>
                </ProveedorCarrito>
            </ProveedorAutenticacion>
        </Router>
    )
}

export default App
