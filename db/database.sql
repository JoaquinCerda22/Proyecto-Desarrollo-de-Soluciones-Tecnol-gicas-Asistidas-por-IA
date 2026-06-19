-- database.sql

CREATE TABLE products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER,
  image_url VARCHAR(1024),
  category VARCHAR(255),
  is_featured INTEGER
);

CREATE TABLE supplies (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2),
  unit VARCHAR(50),
  category VARCHAR(255),
  status VARCHAR(255),
  min_threshold DECIMAL(10,2),
  supplier VARCHAR(255)
);

CREATE TABLE kitchen_config (
  config_key VARCHAR(255) PRIMARY KEY,
  config_value VARCHAR(255)
);

CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  client_email VARCHAR(255),
  client_address VARCHAR(255),
  delivery_date DATE,
  delivery_time VARCHAR(10),
  payment_method VARCHAR(50),
  status VARCHAR(50),
  notes TEXT,
  total_price INTEGER,
  type VARCHAR(50),
  created_at TIMESTAMP
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id VARCHAR(255) REFERENCES orders(id),
  product_name VARCHAR(255),
  quantity INTEGER,
  price INTEGER
);

CREATE TABLE custom_specifications (
  id INTEGER PRIMARY KEY,
  order_id VARCHAR(255) REFERENCES orders(id),
  shape VARCHAR(255),
  cake_base VARCHAR(255),
  filling VARCHAR(255),
  frosting VARCHAR(255),
  portions INTEGER,
  event_type VARCHAR(255),
  description TEXT
);

INSERT INTO products (id, name, description, price, image_url, category, is_featured) VALUES
('torta-frutos', 'Torta de Frutos Rojos', 'Bizcocho de vainilla, crema diplomática y una selección de los mejores frutos rojos de temporada.', 45000, 'https://media.elgourmet.com/recetas/cover_2olanrw9ec_frutosrojos.jpg', 'Torta', 1),
('croissants', 'Croissants Franceses', 'Docena de croissants de mantequilla pura, laminados a mano con precisión.', 28000, 'https://sabor.eluniverso.com/wp-content/uploads/2024/01/shutterstock_642373528-scaled.jpg', 'Bollería', 0),
('cupcakes', 'Caja de Cupcakes', 'Surtido de 6 unidades con decoraciones personalizadas y sabores premium.', 22000, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTydrIVhQkMPrv6Lxy-El9ZlxfLLTIdT6Ltng&s', 'Cupcakes', 0),
('chocolate-premium', 'Torta de Chocolate Premium', 'Intenso bizcocho de chocolate con ganache de chocolate belga.', 38000, 'https://velvetbakery.cl/cdn/shop/products/TrozoChocolateCS.jpg?v=1666196913&width=990', 'Torta', 1),
('selva-negra', 'Torta Selva Negra', 'Bizcocho de chocolate, crema chantilly, cerezas al marrasquino.', 35000, 'https://media.falabella.com/tottusCL/21346128_1/w=1004,h=1500,fit=pad', 'Torta', 0),
('tres-leches', 'Torta Tres Leches', 'Clásico bizcocho bañado en tres tipos de leche con merengue suizo.', 32000, 'https://sweetbrownie.cl/wp-content/uploads/2025/10/torta-tres-leches-para-25-personas.webp', 'Torta', 1),
('mil-hojas-manjar', 'Mil Hojas de Manjar', 'Capas crujientes de hoja con abundante manjar blanco.', 36000, 'https://lafloresta.cl/wp-content/uploads/2024/07/20210723_160600-scaled-1.jpg', 'Torta', 0),
('mil-hojas-frambuesa', 'Mil Hojas de Frambuesa', 'Capas de hoja con manjar y coulis de frambuesa natural.', 38000, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5kMmem1L2c53Mw38lL_naJFI6L18_HHiTYw&s', 'Torta', 0),
('torta-oreo', 'Torta de Oreo', 'Bizcocho de chocolate con crema de oreo y trozos de galleta.', 34000, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNaPBVAZlPl2Y5mvYpOrKQqnDuf_TSQfE0jQ&s', 'Torta', 0),
('torta-matrimonial', 'Torta Matrimonial', 'Elegante torta de novios con decoración personalizada y flores naturales.', 150000, 'https://www.brides.com/thmb/T6vlFOgbrCowU4Ab5AGQXUm7nFM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/ChadWuPhotographysweetheatheranne-ce590b554dad466589fc28b41a122e8d.jpg', 'Torta', 1);

INSERT INTO supplies (id, name, quantity, unit, category, status, min_threshold, supplier) VALUES
(1, 'Harina Sin Polvos', 2.5, 'kg', 'Ingredientes Base', 'Por Agotarse', 10.0, 'Molino San Cristóbal'),
(2, 'Mantequilla Sin Sal', 0.5, 'kg', 'Ingredientes Base', 'Por Agotarse', 5.0, 'Lácteos del Sur'),
(3, 'Chocolate Semi-Amargo', 0.0, 'kg', 'Ingredientes Base', 'Por Agotarse', 2.0, 'Cacao Real'),
(4, 'Azúcar Granulada', 25.0, 'kg', 'Ingredientes Base', 'Suficiente', 10.0, 'Distribuidora Dulce'),
(5, 'Cajas de Cartón 20x20', 15.0, 'unid.', 'Empaque', 'Por Agotarse', 30.0, 'Cajas Envases S.A.'),
(6, 'Sal Fina', 2.0, 'kg', 'Ingredientes Base', 'En Pedido', 1.0, 'Molino San Cristóbal'),
(7, 'Cinta de Embalaje', 5.0, 'rollos', 'Suministros Generales', 'Suficiente', 2.0, 'Suministros Central');

INSERT INTO kitchen_config (config_key, config_value) VALUES
('kitchen_name', 'Dulce Descontrol Central'),
('kitchen_email', 'dulce.descontrol01@gmail.com'),
('prep_lead_time', '48'),
('schedule_monday_active', 'true'),
('schedule_monday_start', '06:00'),
('schedule_monday_end', '16:00'),
('schedule_tuesday_active', 'true'),
('schedule_tuesday_start', '06:00'),
('schedule_tuesday_end', '16:00'),
('admin_pin', '123456');

INSERT INTO orders (id, client_name, client_phone, client_email, client_address, delivery_date, delivery_time, payment_method, status, notes, total_price, type, created_at) VALUES
('#089', 'María González', '+56 9 8765 4321', 'maria@gmail.com', 'Retiro en Taller', '2026-06-19', '14:00', 'transferencia', 'En producción', '', 1450000, 'custom', '2026-06-19 09:00:00'),
('#092', 'Cafetería El Grano', '+56 2 2234 5678', 'contacto@elgrano.cl', 'Retiro en Taller', '2026-06-20', '07:00', 'transferencia', 'Confirmado', 'Retiro temprano.', 850000, 'standard', '2026-06-19 10:30:00'),
('#085', 'Carlos Ruiz', '+56 9 1111 2222', 'carlos@ruiz.cl', 'Retiro en Taller', '2026-06-19', '10:00', 'efectivo', 'Entregado', '', 320000, 'standard', '2026-06-14 11:15:00'),
('#095', 'Valentina Tapia', '+56 9 9999 8888', 'valita@tapia.cl', 'Retiro en Taller', '2026-06-20', '18:00', 'transferencia', 'Cotizado', 'Escribir "Feliz Cumple Vale"', 2100000, 'custom', '2026-06-19 12:45:00');

INSERT INTO order_items (id, order_id, product_name, quantity, price) VALUES
(1, '#089', 'Pastel de Bodas 3 Pisos', 1, 1400000),
(2, '#089', 'Macarons Surtidos', 48, 50000),
(3, '#092', 'Croissants', 24, 400000),
(4, '#092', 'Pan de Masa Madre', 12, 300000),
(5, '#092', 'Galletas de Chispas', 30, 150000),
(6, '#085', 'Tarta de Manzana Clásica', 1, 320000),
(7, '#095', 'Torta de Bodas Personalizada', 1, 2100000);

INSERT INTO custom_specifications (id, order_id, shape, cake_base, filling, frosting, portions, event_type, description) VALUES
(1, '#089', 'Múltiples Pisos', 'Vainilla Bourbon', 'Ganache de Chocolate Blanco y Frambuesa', 'Buttercream Suizo', 50, 'Matrimonio', 'Pastel rústico con flores naturales blancas y toque dorado.'),
(2, '#095', 'Redonda Clásica', 'Chocolate Cacao Intenso', 'Manjar Blanco', 'Fondant Liso', 30, 'Cumpleaños', 'Diseño temático elegante en tonos pasteles.');
