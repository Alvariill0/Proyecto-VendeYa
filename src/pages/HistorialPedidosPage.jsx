import React from 'react';
import HistorialPedidos from '../components/features/pedidos/HistorialPedidos';

function HistorialPedidosPage() {
    return (
        <div className="container my-4">
            <h1 className="mb-4">Mis Pedidos</h1>
            <HistorialPedidos />
        </div>
    );
}

export default HistorialPedidosPage;