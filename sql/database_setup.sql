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

-- Tabla Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    -- Para subcategorías, referencia a la categoría padre
    parent_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categorias(id) ON DELETE CASCADE -- Si se elimina una categoría padre, sus hijos también se eliminan
);

-- Tabla Productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    -- Clave foránea al usuario que vende el producto
    vendedor_id INT NOT NULL,
    -- Clave foránea a la categoría del producto
    categoria_id INT,
    imagen VARCHAR(255), -- Ruta a la imagen del producto
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendedor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
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
-- Tabla para almacenar las valoraciones de productos
CREATE TABLE IF NOT EXISTS `valoraciones` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `producto_id` int(11) NOT NULL,
    `usuario_id` int(11) NOT NULL,
    `puntuacion` int(11) NOT NULL,
    `comentario` text COLLATE utf8mb4_unicode_ci,
    `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `producto_id` (`producto_id`),
    KEY `usuario_id` (`usuario_id`),
    CONSTRAINT `valoraciones_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
    CONSTRAINT `valoraciones_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice para optimizar la búsqueda de valoraciones por producto
CREATE INDEX IF NOT EXISTS `idx_valoraciones_producto` ON `valoraciones` (`producto_id`);

-- Índice para optimizar la búsqueda de valoraciones por usuario
CREATE INDEX IF NOT EXISTS `idx_valoraciones_usuario` ON `valoraciones` (`usuario_id`);

-- Índice único para evitar que un usuario valore el mismo producto más de una vez
CREATE UNIQUE INDEX IF NOT EXISTS `idx_valoraciones_usuario_producto` ON `valoraciones` (`usuario_id`, `producto_id`);

-- Tabla para almacenar las conversaciones de mensajes entre usuarios
CREATE TABLE IF NOT EXISTS `conversaciones` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario1_id` INT NOT NULL,
    `usuario2_id` INT NOT NULL,
    `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario1_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`usuario2_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
    UNIQUE KEY (`usuario1_id`, `usuario2_id`)
);

-- Tabla para almacenar los mensajes individuales
CREATE TABLE IF NOT EXISTS `mensajes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `conversacion_id` INT NOT NULL,
    `remitente_id` INT NOT NULL,
    `receptor_id` INT NOT NULL,
    `contenido` TEXT NOT NULL,
    `leido` BOOLEAN DEFAULT FALSE,
    `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`remitente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`receptor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
);

-- Índices para optimizar la búsqueda de mensajes
CREATE INDEX IF NOT EXISTS `idx_mensajes_conversacion` ON `mensajes` (`conversacion_id`);
CREATE INDEX IF NOT EXISTS `idx_mensajes_remitente` ON `mensajes` (`remitente_id`);
CREATE INDEX IF NOT EXISTS `idx_mensajes_receptor` ON `mensajes` (`receptor_id`);
CREATE INDEX IF NOT EXISTS `idx_mensajes_fecha_creacion` ON `mensajes` (`fecha_creacion`);
-- Insertar usuario administrador por defecto (contraseña hasheada)
INSERT IGNORE INTO usuarios (nombre, email, password, rol) VALUES
('Administrador', 'admin@vendeya.com', '$2y$10$QhkqUTv0fhOoq46jD14ekO3m4Poup1D2gKrM7qnZT5o.qydJMemvS', 'admin');

-- Insertar categorías de ejemplo (incluyendo subcategorías)
INSERT IGNORE INTO categorias (id, nombre, descripcion, parent_id) VALUES
(1, 'Electrónica', 'Dispositivos electrónicos y accesorios', NULL),
(2, 'Ropa y Moda', 'Vestimenta, calzado y accesorios', NULL),
(3, 'Hogar y Jardín', 'Artículos para el hogar, decoración y exteriores', NULL),
(4, 'Deportes y Aire Libre', 'Equipamiento deportivo y actividades al aire libre', NULL),
(5, 'Libros, Música y Películas', 'Contenido multimedia físico y digital', NULL),
(6, 'Smartphones', 'Teléfonos móviles y accesorios', 1),
(7, 'Laptops y Computadoras', 'Ordenadores portátiles y de escritorio', 1),
(8, 'Audio y Video', 'Equipos de sonido y video', 1),
(9, 'Camisetas', 'Prendas superiores', 2),
(10, 'Pantalones', 'Prendas inferiores', 2),
(11, 'Juguetes', 'Juguetes y juegos para todas las edades', NULL),
(12, 'Salud y Belleza', 'Productos de salud y belleza', NULL),
(13, 'Automotriz', 'Accesorios y repuestos para vehículos', NULL),
(14, 'Electrodomésticos', 'Aparatos eléctricos para el hogar', NULL),
(15, 'Oficina', 'Suministros y muebles de oficina', NULL),
(16, 'Mascotas', 'Productos para mascotas', NULL),
(17, 'Bebés', 'Productos para bebés y niños pequeños', NULL),
(18, 'Joyería', 'Joyas y accesorios', NULL),
(19, 'Herramientas', 'Herramientas y equipos de construcción', NULL),
(20, 'Juegos de Mesa', 'Juegos de mesa y rompecabezas', 11);

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion,stock, precio, vendedor_id, categoria_id, imagen) VALUES
('Smartphone Avanzado', 'Potente smartphone con cámara de alta resolución.', 33, 699.99, 1, 6, 'https://placehold.co/600x400?text=Smartphone'),
('Laptop Ultrabook', 'Portátil ligero y rápido para productividad.',  33,950.00, 1, 7, 'https://placehold.co/600x400?text=Laptop'),
('Camiseta de Algodón', 'Camiseta básica de algodón orgánico.', 33, 19.95, 1, 9, 'https://placehold.co/600x400?text=Camiseta'),
('Pantalón Vaquero', 'Vaqueros ajustados de diseño moderno.', 33, 45.50, 1, 10, 'https://placehold.co/600x400?text=Pantalon'),
('Coche de Juguete', 'Coche de juguete a control remoto.', 33, 29.99, 1, 11, 'https://placehold.co/600x400?text=Coche+de+Juguete'),
('Crema Facial', 'Crema hidratante para el rostro.', 33, 15.50, 1, 12, 'https://placehold.co/600x400?text=Crema+Facial'),
('Aceite de Motor', 'Aceite sintético para motor de coche.', 33, 40.00, 1, 13, 'https://placehold.co/600x400?text=Aceite+de+Motor'),
('Aspiradora', 'Aspiradora potente y silenciosa.', 33, 120.00, 1, 14, 'https://placehold.co/600x400?text=Aspiradora'),
('Silla de Oficina', 'Silla ergonómica para oficina.', 33, 85.00, 1, 15, 'https://placehold.co/600x400?text=Silla+de+Oficina'),
('Comida para Perros', 'Alimento balanceado para perros adultos.', 33, 25.00, 1, 16, 'https://placehold.co/600x400?text=Comida+para+Perros'),
('Cuna para Bebé', 'Cuna segura y cómoda para bebés.', 33, 150.00, 1, 17, 'https://placehold.co/600x400?text=Cuna+para+Bebé'),
('Collar de Perlas', 'Elegante collar de perlas.', 33, 200.00, 1, 18, 'https://placehold.co/600x400?text=Collar+de+Perlas'),
('Taladro Eléctrico', 'Taladro eléctrico con múltiples velocidades.', 33, 60.00, 1, 19, 'https://placehold.co/600x400?text=Taladro+Eléctrico'),
('Ajedrez', 'Juego de ajedrez clásico.', 33, 35.00, 1, 20, 'https://placehold.co/600x400?text=Ajedrez');