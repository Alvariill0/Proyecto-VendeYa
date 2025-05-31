const BASE_URL = import.meta.env.VITE_API_URL;

export async function login(email, password) {
    const respuesta = await fetch(`${BASE_URL}/auth/login.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error en el login');
    }

    return datos; // Devolvemos los datos completos, incluyendo token y usuario
}

export async function registro(nombre, email, password) {
    const respuesta = await fetch(`${BASE_URL}/auth/registro.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email, password }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error en el registro');
    }

    return datos;
}