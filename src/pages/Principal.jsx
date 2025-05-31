import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { listarProductos } from '../services/servicioProductos';
import ListaProductosConFiltros from '../components/features/productos/ListaProductosConFiltros';

export default function Principal() {
    const { categoriaId } = useParams(); // Obtener el parámetro de la URL
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const terminoBusqueda = searchParams.get('busqueda');

    return (
        <div>
            {/* Renderizar el componente de lista de productos con filtros */}
            <ListaProductosConFiltros 
                categoriaId={categoriaId} 
                terminoBusqueda={terminoBusqueda}
            />
        </div>
    );
}