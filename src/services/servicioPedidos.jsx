const BASE_URL = import.meta.env.VITE_API_URL;

export async function listarPedidos() {
    const respuesta = await fetch(`${BASE_URL}/pedidos/listar.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al obtener los pedidos');
    }

    return datos;
}

export async function crearPedido() {
    const respuesta = await fetch(`${BASE_URL}/pedidos/crear.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al crear el pedido');
    }

    return datos;
}