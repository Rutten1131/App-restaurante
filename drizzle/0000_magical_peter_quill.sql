CREATE TABLE `alertas_fidelizacion` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cliente_id` int NOT NULL,
	`dias_sin_volver` int NOT NULL,
	`mensaje_sugerido` text NOT NULL,
	`estado` enum('pendiente','enviada','descartada') NOT NULL DEFAULT 'pendiente',
	`creada_en` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alertas_fidelizacion_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`orden` int NOT NULL DEFAULT 0,
	CONSTRAINT `categorias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero_cliente` varchar(20) NOT NULL,
	`nombre` varchar(150) NOT NULL,
	`telefono` varchar(30),
	`email` varchar(150),
	`cumpleanios` date,
	`creado_en` timestamp NOT NULL DEFAULT (now()),
	`ultima_visita` timestamp,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`),
	CONSTRAINT `clientes_numero_cliente_unique` UNIQUE(`numero_cliente`)
);
--> statement-breakpoint
CREATE TABLE `facturas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pedido_id` int NOT NULL,
	`cliente_id` int,
	`email_envio_destino` varchar(150),
	`subtotal` decimal(10,2) NOT NULL,
	`iva` decimal(10,2) NOT NULL,
	`total` decimal(10,2) NOT NULL,
	`estado` enum('simulada','enviada','oficial_sri') NOT NULL DEFAULT 'simulada',
	`creada_en` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `facturas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insumos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(150) NOT NULL,
	`unidad` varchar(30) NOT NULL,
	`stock_actual` decimal(10,2) NOT NULL DEFAULT '0.00',
	`stock_minimo` decimal(10,2) NOT NULL DEFAULT '0.00',
	CONSTRAINT `insumos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `items_pedido` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pedido_id` int NOT NULL,
	`plato_id` int NOT NULL,
	`cantidad` int NOT NULL DEFAULT 1,
	`precio_unitario` decimal(10,2) NOT NULL,
	`notas` varchar(255),
	CONSTRAINT `items_pedido_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `movimientos_inventario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`insumo_id` int NOT NULL,
	`tipo` enum('entrada','salida_venta','ajuste') NOT NULL,
	`cantidad` decimal(10,2) NOT NULL,
	`pedido_id` int,
	`creado_en` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `movimientos_inventario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pedidos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cliente_id` int,
	`origen` enum('qr_mesa','mesero','caja') NOT NULL,
	`mesa` varchar(20),
	`estado` enum('recibido','en_cocina','listo','entregado','cancelado') NOT NULL DEFAULT 'recibido',
	`total` decimal(10,2) NOT NULL DEFAULT '0.00',
	`creado_en` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pedidos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoria_id` int,
	`nombre` varchar(150) NOT NULL,
	`descripcion` text,
	`precio` decimal(10,2) NOT NULL,
	`imagen_url` varchar(500),
	`video_url` varchar(500),
	`disponible` boolean NOT NULL DEFAULT true,
	`creado_en` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `receta_insumos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plato_id` int NOT NULL,
	`insumo_id` int NOT NULL,
	`cantidad_usada` decimal(10,2) NOT NULL,
	CONSTRAINT `receta_insumos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resenas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cliente_id` int,
	`calificacion` int NOT NULL,
	`comentario` text,
	`es_publica` boolean NOT NULL DEFAULT false,
	`creada_en` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resenas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usuarios_admin` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(150) NOT NULL,
	`email` varchar(150) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`rol` enum('owner','caja','cocina') NOT NULL DEFAULT 'caja',
	`creado_en` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usuarios_admin_id` PRIMARY KEY(`id`),
	CONSTRAINT `usuarios_admin_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `alertas_fidelizacion` ADD CONSTRAINT `alertas_fidelizacion_cliente_id_clientes_id_fk` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `facturas` ADD CONSTRAINT `facturas_pedido_id_pedidos_id_fk` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `facturas` ADD CONSTRAINT `facturas_cliente_id_clientes_id_fk` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `items_pedido` ADD CONSTRAINT `items_pedido_pedido_id_pedidos_id_fk` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `items_pedido` ADD CONSTRAINT `items_pedido_plato_id_platos_id_fk` FOREIGN KEY (`plato_id`) REFERENCES `platos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_insumo_id_insumos_id_fk` FOREIGN KEY (`insumo_id`) REFERENCES `insumos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_pedido_id_pedidos_id_fk` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pedidos` ADD CONSTRAINT `pedidos_cliente_id_clientes_id_fk` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platos` ADD CONSTRAINT `platos_categoria_id_categorias_id_fk` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `receta_insumos` ADD CONSTRAINT `receta_insumos_plato_id_platos_id_fk` FOREIGN KEY (`plato_id`) REFERENCES `platos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `receta_insumos` ADD CONSTRAINT `receta_insumos_insumo_id_insumos_id_fk` FOREIGN KEY (`insumo_id`) REFERENCES `insumos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resenas` ADD CONSTRAINT `resenas_cliente_id_clientes_id_fk` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE no action ON UPDATE no action;