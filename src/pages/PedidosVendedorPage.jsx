import React from 'react';
import { Container } from 'react-bootstrap';
import PedidosVendedor from '../components/PedidosVendedor';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import { Navigate } from 'react-router-dom';

/**
 * Página que muestra los pedidos que contienen productos vendidos por el usuario actual
 */
const PedidosVendedorPage = () => {
    const { usuario, cargando } = useAutenticacion();

    // Redirigir si no hay usuario autenticado
    if (!cargando && !usuario) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Gestión de Ventas</h2>
            <PedidosVendedor />
        </Container>
    );
};

export default PedidosVendedorPage;