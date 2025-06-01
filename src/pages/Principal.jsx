import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { listarProductos } from '../services/servicioProductos';
import ListaProductosConFiltros from '../components/features/productos/ListaProductosConFiltros';
import ListaProductos from './ListaProductos';

export default function Principal() {
    const { categoriaId } = useParams(); // Obtener el parámetro de la URL
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const terminoBusqueda = searchParams.get('busqueda');

    // Si hay una categoría seleccionada o un término de búsqueda, mostrar ListaProductosConFiltros
    // De lo contrario, mostrar la página principal con productos destacados y recientes
    return (
        <div>
            {(categoriaId || terminoBusqueda) ? (
                <ListaProductosConFiltros 
                    categoriaId={categoriaId} 
                    terminoBusqueda={terminoBusqueda}
                />
            ) : (
                <ListaProductos />
            )}
        </div>
    );
}