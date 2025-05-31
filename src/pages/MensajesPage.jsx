import React from 'react';
import { Container } from 'react-bootstrap';
import SistemaMensajes from '../components/features/mensajes/SistemaMensajes';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import { Navigate } from 'react-router-dom';

/**
 * Página que muestra el sistema de mensajería entre usuarios
 */
function MensajesPage() {
    const { usuario, cargando } = useAutenticacion();

    // Redirigir si no hay usuario autenticado
    if (!cargando && !usuario) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Mensajes</h2>
            <SistemaMensajes />
        </Container>
    );
}

export default MensajesPage;