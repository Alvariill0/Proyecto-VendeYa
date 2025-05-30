import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProveedorAutenticacion } from './context/ContextoAutenticacion'
import { useAutenticacion } from './context/ContextoAutenticacion'
import Login from './components/features/auth/Login'
import Registro from './components/features/auth/Registro'
import Bienvenida from './pages/Bienvenida'
import Principal from './pages/Principal'
import Layout from './components/layout/Layout'
import './App.css'

// Componente para rutas protegidas
function RutaProtegida({ children }) {
    const { usuario } = useAutenticacion()
    
    if (!usuario) {
        return <Navigate to="/login" />
    }

    return <Layout>{children}</Layout>
}

function App() {
    return (
        <Router>
            <ProveedorAutenticacion>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Bienvenida />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />

                    {/* Rutas protegidas */}
                    <Route
                        path="/principal"
                        element={
                            <RutaProtegida>
                                <Principal />
                            </RutaProtegida>
                        }
                    />
                </Routes>
            </ProveedorAutenticacion>
        </Router>
    )
}

export default App
