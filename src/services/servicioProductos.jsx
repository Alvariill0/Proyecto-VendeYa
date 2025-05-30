export async function listarCategorias() {
    const respuesta = await fetch('http://localhost/VendeYaCursor/api/categorias/listar.php');
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al obtener categorías');
    }

    return datos;
}

export async function listarProductos(categoriaId = null) {
    let url = 'http://localhost/VendeYaCursor/api/productos/listar.php';
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

// Función para crear un nuevo producto
// formData debe incluir los datos del producto (nombre, descripcion, etc.) y la imagen.
// Se asume que el vendedor_id se obtiene de forma segura en el backend.
export async function crearProducto(formData) {
    const url = 'http://localhost/VendeYaCursor/api/productos/crear.php';
    
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

// Más adelante, añadiremos funciones para listar y filtrar productos aquí 