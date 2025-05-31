import { createContext, useContext, useState, useEffect } from 'react';
import { obtenerCarrito, agregarAlCarrito, actualizarCantidadCarrito, eliminarDelCarrito, vaciarCarrito } from '../services/servicioCarrito';
import { useAutenticacion } from './ContextoAutenticacion';

// Crear el contexto
const ContextoCarrito = createContext();

// Hook personalizado para usar el contexto
export function useCarrito() {
    return useContext(ContextoCarrito);
}

// Proveedor del contexto
export function ProveedorCarrito({ children }) {
    const { usuario } = useAutenticacion();
    const [items, setItems] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPrecio, setTotalPrecio] = useState(0);

    // Cargar el carrito cuando el usuario inicia sesión
    useEffect(() => {
        if (usuario) {
            cargarCarrito();
        } else {
            // Si no hay usuario, vaciar el carrito local
            setItems([]);
            setTotalItems(0);
            setTotalPrecio(0);
        }
    }, [usuario]);

    // Calcular totales cuando cambian los items
    useEffect(() => {
        calcularTotales();
    }, [items]);

    // Función para cargar el carrito desde el servidor
    const cargarCarrito = async () => {
        if (!usuario) return;
    
        try {
            setCargando(true);
            setError(null);
            const datosCarrito = await obtenerCarrito();
            setItems(Array.isArray(datosCarrito) ? datosCarrito : []); // Ensure items is an array
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };

    // Función para calcular totales
    const calcularTotales = () => {
        const cantidadTotal = items.reduce((total, item) => total + item.cantidad, 0);
        const precioTotal = items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
        
        setTotalItems(cantidadTotal);
        setTotalPrecio(precioTotal);
    };

    // Función para agregar un producto al carrito
    const agregar = async (productoId, cantidad = 1) => {
        if (!usuario) {
            setError('Debe iniciar sesión para agregar productos al carrito');
            return;
        }

        try {
            setCargando(true);
            setError(null);
            await agregarAlCarrito(productoId, cantidad);
            await cargarCarrito(); // Recargar el carrito para obtener los datos actualizados
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };

    // Función para actualizar la cantidad de un producto
    const actualizarCantidad = async (itemId, cantidad) => {
        if (!usuario) return;

        try {
            setCargando(true);
            setError(null);
            await actualizarCantidadCarrito(itemId, cantidad);
            await cargarCarrito(); // Recargar el carrito
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };

    // Función para eliminar un producto del carrito
    const eliminar = async (itemId) => {
        if (!usuario) return;

        try {
            setCargando(true);
            setError(null);
            await eliminarDelCarrito(itemId);
            await cargarCarrito(); // Recargar el carrito
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };

    // Función para vaciar el carrito
    const vaciar = async () => {
        if (!usuario) return;

        try {
            setCargando(true);
            setError(null);
            await vaciarCarrito();
            setItems([]);
            setTotalItems(0);
            setTotalPrecio(0);
        } catch (error) {
            console.error('Error al vaciar el carrito:', error);
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };

    // Valores que se proporcionarán a través del contexto
    const value = {
        items,
        cargando,
        error,
        totalItems,
        totalPrecio,
        agregar,
        actualizarCantidad,
        eliminar,
        vaciar,
        cargarCarrito
    };

    return (
        <ContextoCarrito.Provider value={value}>
            {children}
        </ContextoCarrito.Provider>
    );
}