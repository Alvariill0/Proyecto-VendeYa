const BASE_URL = import.meta.env.VITE_API_URL;

// Función para obtener los items del carrito del usuario actual
export async function obtenerCarrito() {
    const respuesta = await fetch(`${BASE_URL}/carrito/listar.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Aquí se añadiría el token de autenticación en una implementación completa
        },
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al obtener el carrito');
    }

    return datos;
}

// Función para añadir un producto al carrito
export async function agregarAlCarrito(productoId, cantidad = 1) {
    const respuesta = await fetch(`${BASE_URL}/carrito/agregar.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Aquí se añadiría el token de autenticación en una implementación completa
        },
        body: JSON.stringify({ producto_id: productoId, cantidad }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al agregar al carrito');
    }

    return datos;
}

// Función para actualizar la cantidad de un producto en el carrito
export async function actualizarCantidadCarrito(itemId, cantidad) {
    if (cantidad <= 0) {
        return eliminarDelCarrito(itemId);
    }

    const respuesta = await fetch(`${BASE_URL}/carrito/actualizar.php`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // Aquí se añadiría el token de autenticación en una implementación completa
        },
        body: JSON.stringify({ item_id: itemId, cantidad }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al actualizar el carrito');
    }

    return datos;
}

// Función para eliminar un producto del carrito
export async function eliminarDelCarrito(itemId) {
    const respuesta = await fetch(`${BASE_URL}/carrito/eliminar.php`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            // Aquí se añadiría el token de autenticación en una implementación completa
        },
        body: JSON.stringify({ item_id: itemId }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al eliminar del carrito');
    }

    return datos;
}

// Función para vaciar el carrito
export async function vaciarCarrito() {
    const respuesta = await fetch(`${BASE_URL}/carrito/vaciar.php`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            // Aquí se añadiría el token de autenticación en una implementación completa
        },
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al vaciar el carrito');
    }

    return datos;
}