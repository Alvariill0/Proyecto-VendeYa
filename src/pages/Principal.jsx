import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listarProductos } from '../services/servicioProductos';
import ListaProductosConFiltros from '../components/features/productos/ListaProductosConFiltros';

export default function Principal() {
    const { categoriaId } = useParams(); // Obtener el parámetro de la URL

    return (
        <div>
            {/* Renderizar el componente de lista de productos con filtros */}
            <ListaProductosConFiltros categoriaId={categoriaId} />
        </div>
    );
}