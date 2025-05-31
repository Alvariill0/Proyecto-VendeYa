const BASE_URL = import.meta.env.VITE_API_URL;

export async function listarCategorias() {
    const respuesta = await fetch(`${BASE_URL}/categorias/listar.php`);
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al obtener categorías');
    }

    return datos;
}

export async function listarProductos(categoriaId = null) {
    let url = `${BASE_URL}/productos/listar.php`;
    if (categoriaId !== null) {
        url += `?categoria_id=${categoriaId}`;
    }

    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al obtener productos');
    }

    return datos;
}

export async function obtenerProducto(productoId) {
    if (!productoId) {
        throw new Error('Se requiere un ID de producto válido');
    }

    const respuesta = await fetch(`${BASE_URL}/productos/obtener.php?id=${productoId}`);
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al obtener el producto');
    }

    return datos;
}

export async function crearProducto(formData) {
    const url = `${BASE_URL}/productos/crear.php`;
    
    // TODO: En una aplicación real, la identificación del usuario debería manejarse de forma segura (ej. sesiones, tokens).
    // No se debería confiar en un user_id enviado directamente desde el frontend para operaciones sensibles.

    const respuesta = await fetch(url, {
        method: 'POST',
        body: formData // FormData maneja correctamente los datos del formulario y la imagen
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        // Si la respuesta no es OK (ej. 400, 500), lanzamos un error con el mensaje del backend si existe
        throw new Error(datos.error || 'Error en la respuesta del servidor al crear producto.');
    }

    // Si la respuesta es OK (ej. 201 Created), devolvemos los datos (ej. mensaje de éxito, ID del producto)
    return datos;
}