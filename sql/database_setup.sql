-- Script para configurar la base de datos del marketplace VendeYa
-- Este script crea la base de datos, las tablas y inserta un usuario administrador por defecto.

-- Creamos la base de datos si no existe
CREATE DATABASE IF NOT EXISTS vendeya CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usamos la base de datos
USE vendeya;

-- Tabla Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    -- Contraseña previamente hasheada
    password VARCHAR(255) NOT NULL,
    -- Rol usuario (por defecto) o admin (hardcodeado)
    rol VARCHAR(50) NOT NULL DEFAULT 'usuario',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    -- Clave foránea al usuario que vende el producto
    vendedor_id INT NOT NULL,
    imagen VARCHAR(255), -- Ruta a la imagen del producto
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendedor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla Carrito
CREATE TABLE IF NOT EXISTS carrito_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    UNIQUE KEY (usuario_id, producto_id) -- Asegura que un usuario solo tenga un ítem por producto en el carrito
);

-- Tabla Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente', -- ej: 'pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    -- Opcional: Podríamos añadir más campos como dirección de envío, método de pago, etc.
);

-- Tabla intermedia para relacionar pedidos y productos (detalles del pedido)
CREATE TABLE IF NOT EXISTS pedido_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2) NOT NULL, -- Precio del producto en el momento de la compra
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Tabla para almacenar valoraciones y comentarios de productos
CREATE TABLE IF NOT EXISTS valoraciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    puntuacion INT NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY (producto_id, usuario_id) -- Un usuario solo puede valorar un producto una vez
);

-- Insertar usuario administrador por defecto (contraseña hasheada)

INSERT IGNORE INTO usuarios (nombre, email, password, rol) VALUES
('Administrador', 'admin@vendeya.com', '$2y$10$QhkqUTv0fhOoq46jD14ekO3m4Poup1D2gKrM7qnZT5o.qydJMemvS', 'admin'); 