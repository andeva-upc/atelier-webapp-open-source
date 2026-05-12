-- ====================================================================================
-- Script DDL Enterprise para el sistema Atelier (MySQL)
-- Optimizado para Spring Boot, Hibernate, Alta Escalabilidad y Auditoría Estricta
-- ====================================================================================

CREATE DATABASE IF NOT EXISTS atelier_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE atelier_db;

-- ==========================================
-- 1. BOUNDED CONTEXT: CORE (Identity & Multi-Tenancy)
-- ==========================================

CREATE TABLE workshops (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID v4/v7',
    tax_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'RUC o Identificador Fiscal (US001 exige UNIQUE)',
    business_name VARCHAR(150) NOT NULL,
    subscription_plan VARCHAR(20) NOT NULL COMMENT 'Enum: LITE, PRO, MAX',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'JPA Optimistic Locking',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft Delete',
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Entidad Raíz Multi-Tenant';

CREATE TABLE branches (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID v4/v7',
    workshop_id CHAR(36) NOT NULL COMMENT 'Tenant al que pertenece la sede',
    name VARCHAR(100) NOT NULL COMMENT 'Nombre de la sede (ej: Miraflores, San Isidro)',
    address VARCHAR(200) NULL,
    phone VARCHAR(50) NULL,
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    CONSTRAINT fk_branches_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT,
    UNIQUE (workshop_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sedes o Sucursales de un taller';

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL COMMENT 'Tenant al que pertenece',
    branch_id CHAR(36) NULL COMMENT 'Sede asignada (NULL para administradores corporativos)',
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL COMMENT 'Null para cuentas externas (OAuth2)',
    google_id VARCHAR(255) UNIQUE NULL,
    role VARCHAR(20) NOT NULL COMMENT 'Enum: ADMIN, MECHANIC, CUSTOMER, RECEPTIONIST',
    specialty VARCHAR(30) NULL COMMENT 'Enum: GENERAL_MECHANIC, AUTOMOTIVE_ELECTRONIC, BODY_AND_PAINT, DIAGNOSTICIAN. Null for non-mechanics',
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    CONSTRAINT fk_users_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT,
    CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant ON users(workshop_id, role);

-- Tabla para tokens de recuperación de contraseña (US006)
CREATE TABLE password_recovery_tokens (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recovery_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. BOUNDED CONTEXT: FLEET (Fleet Management)
-- ==========================================

CREATE TABLE customers (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL COMMENT 'Aislamiento Tenant',
    document_number VARCHAR(50) NOT NULL,
    document_type VARCHAR(20) NOT NULL COMMENT 'Enum: DNI, RUC, CE, PASSPORT',
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(150) NULL COMMENT 'Correo electrónico (US011 exige correo)',
    phone VARCHAR(50),
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    CONSTRAINT fk_customers_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT,
    UNIQUE (workshop_id, document_type, document_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes gestionados por un taller';

CREATE INDEX idx_customers_tenant ON customers(workshop_id, created_at);

CREATE TABLE vehicles (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL COMMENT 'Aislamiento Tenant para vehiculos',
    customer_id CHAR(36) NULL COMMENT 'Propietario principal del vehículo (puede ser nulo si se mapea en customer_vehicles)',
    plate_number VARCHAR(20) NOT NULL COMMENT 'Placa (Homologado con db.json)',
    brand VARCHAR(50) NOT NULL COMMENT 'Marca del vehículo (Agregado)',
    model VARCHAR(50) NOT NULL COMMENT 'Modelo del vehículo (Agregado)',
    year INT NOT NULL COMMENT 'Año de fabricación (Agregado)',
    vin VARCHAR(50) NOT NULL,
    current_mileage INT NOT NULL DEFAULT 0,
    usage_type VARCHAR(30) NOT NULL DEFAULT 'PARTICULAR' COMMENT 'Enum: PARTICULAR, TAXI_UBER, HEAVY_DUTY',
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    CONSTRAINT fk_vehicles_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT,
    CONSTRAINT fk_vehicles_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT uq_vehicles_plate UNIQUE (workshop_id, plate_number),
    CONSTRAINT uq_vehicles_vin UNIQUE (workshop_id, vin),
    CONSTRAINT chk_vehicle_mileage CHECK (current_mileage >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);

-- Tabla intermedia para vehículos compartidos o multi-conductor (Caso Especial G)
CREATE TABLE customer_vehicles (
    customer_id CHAR(36) NOT NULL,
    vehicle_id CHAR(36) NOT NULL,
    association_type VARCHAR(30) NOT NULL DEFAULT 'OWNER' COMMENT 'Enum: OWNER, AUTHORIZED_DRIVER, FAMILY_MEMBER',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    PRIMARY KEY (customer_id, vehicle_id),
    CONSTRAINT fk_cust_veh_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_cust_veh_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para lockers / bahías físicas de trabajo en taller (US013)
CREATE TABLE work_bays (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    branch_id CHAR(36) NOT NULL COMMENT 'Sede física donde esta la bahia',
    name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'VACANT' COMMENT 'Enum: VACANT, OCCUPIED',
    vehicle_id CHAR(36) NULL,
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_bay_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bay_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bay_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    CONSTRAINT uq_bay_name_branch UNIQUE (branch_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para agendamiento y reprogramación de citas (US024, US025)
CREATE TABLE appointments (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    branch_id CHAR(36) NOT NULL COMMENT 'Sede física donde es la cita',
    customer_id CHAR(36) NULL COMMENT 'Null para pre-registros pendientes de aprobacion',
    vehicle_id CHAR(36) NULL COMMENT 'Null para pre-registros pendientes de aprobacion',
    appointment_date DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' COMMENT 'Enum: PENDING_APPROVAL, SCHEDULED, COMPLETED, CANCELLED',
    
    -- Campos para auto-registro online (Borrador temporal)
    pre_registered_full_name VARCHAR(200) NULL,
    pre_registered_document_type VARCHAR(20) NULL COMMENT 'Enum: DNI, RUC, CE, PASSPORT',
    pre_registered_document_number VARCHAR(50) NULL,
    pre_registered_email VARCHAR(150) NULL,
    pre_registered_phone VARCHAR(50) NULL,
    pre_registered_vehicle_plate VARCHAR(20) NULL,
    pre_registered_vehicle_brand_model VARCHAR(100) NULL,
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_app_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT,
    CONSTRAINT fk_app_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
    CONSTRAINT fk_app_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_app_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. BOUNDED CONTEXT: IOT (Hardware y Telemetría)
-- ==========================================

CREATE TABLE obd2_devices (
    id CHAR(36) PRIMARY KEY,
    mac_address VARCHAR(17) NOT NULL UNIQUE,
    vehicle_id CHAR(36),
    last_ping DATETIME,
    status VARCHAR(20) NOT NULL DEFAULT 'INACTIVE' COMMENT 'Enum: ACTIVE, INACTIVE',
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    CONSTRAINT fk_obd2_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_obd2_mac ON obd2_devices(mac_address);

CREATE TABLE vehicle_dtc_alerts (
    id CHAR(36) PRIMARY KEY,
    vehicle_id CHAR(36) NOT NULL,
    dtc_code VARCHAR(10) NOT NULL,
    description VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL COMMENT 'Enum: LOW, MEDIUM, HIGH, CRITICAL',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_dtc_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_dtc_vehicle_active ON vehicle_dtc_alerts(vehicle_id, is_active);

-- Tabla de Ingesta Masiva: Simplificada con clave primaria simple para compatibilidad perfecta con JPA/Hibernate y EF Core.
CREATE TABLE telemetry_snapshots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id CHAR(36) NOT NULL,
    timestamp DATETIME NOT NULL,
    rpm INT NOT NULL,
    temp DOUBLE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_telemetry_device FOREIGN KEY (device_id) REFERENCES obd2_devices(id) ON DELETE CASCADE,
    CONSTRAINT chk_telemetry_rpm CHECK (rpm >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Eventos IoT Inmutables';

CREATE INDEX idx_telemetry_device_time ON telemetry_snapshots(device_id, timestamp);

-- ==========================================
-- 4. BOUNDED CONTEXT: OPERATIONS (Work Orders)
-- ==========================================

CREATE TABLE work_orders (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL COMMENT 'Aislamiento Tenant',
    branch_id CHAR(36) NOT NULL COMMENT 'Sede física donde se hace el servicio',
    internal_number INT NOT NULL,
    customer_id CHAR(36) NOT NULL COMMENT 'Cliente (dueño) que autoriza la orden de trabajo',
    billing_customer_id CHAR(36) NULL COMMENT 'Cliente pagador real (ej: aseguradora para siniestros) (Caso Especial F)',
    vehicle_id CHAR(36) NOT NULL,
    assigned_mechanic_id CHAR(36) NOT NULL,
    driver_name VARCHAR(150) NULL COMMENT 'Nombre del conductor (para flotas o casos especiales)',
    driver_phone VARCHAR(50) NULL COMMENT 'Teléfono del conductor (para flotas o casos especiales)',
    diagnosis TEXT NULL COMMENT 'Diagnóstico técnico del mecánico (US016 exige esto)',
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' COMMENT 'Enum: DRAFT, DIAGNOSING, IN_PROGRESS, COMPLETED, INVOICED',
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    CONSTRAINT fk_wo_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT,
    CONSTRAINT fk_wo_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
    CONSTRAINT fk_wo_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_wo_billing_customer FOREIGN KEY (billing_customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_wo_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_wo_mechanic FOREIGN KEY (assigned_mechanic_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_wo_number CHECK (internal_number > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_wo_tenant_status ON work_orders(workshop_id, status);
CREATE INDEX idx_wo_mechanic ON work_orders(assigned_mechanic_id, status);

CREATE TABLE work_order_tasks (
    id CHAR(36) PRIMARY KEY,
    work_order_id CHAR(36) NOT NULL,
    description TEXT NOT NULL,
    estimated_hours DECIMAL(5,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'Enum: PENDING, DOING, DONE',
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    CONSTRAINT fk_task_wo FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE RESTRICT,
    CONSTRAINT chk_task_hours CHECK (estimated_hours > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Cotizaciones Digitales (US026, US027)
CREATE TABLE quotes (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    vehicle_id CHAR(36) NOT NULL,
    description TEXT NULL,
    subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_percentage DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_quote_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT,
    CONSTRAINT fk_quote_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_quote_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. BOUNDED CONTEXT: INVENTORY (Warehouse)
-- ==========================================

CREATE TABLE products (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL COMMENT 'Aislamiento Tenant',
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NULL COMMENT 'Categoría de repuesto (US017 exige esto)',
    description TEXT,
    current_stock INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 0 COMMENT 'Stock mínimo para alertas preventivas (US010 exige esto)',
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    CONSTRAINT fk_products_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT,
    CONSTRAINT chk_product_stock CHECK (current_stock >= 0),
    UNIQUE (workshop_id, sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_products_tenant ON products(workshop_id, sku);

CREATE TABLE inventory_movements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id CHAR(36) NOT NULL,
    movement_type VARCHAR(20) NOT NULL COMMENT 'Enum: INBOUND, OUTBOUND, ADJUSTMENT',
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by CHAR(36) NULL COMMENT 'Usuario que registró el movimiento',
    CONSTRAINT fk_movement_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Eventos inmutables de almacén';

-- ==========================================
-- 6. BOUNDED CONTEXT: BILLING (Invoicing and Payments)
-- ==========================================

CREATE TABLE vouchers (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL COMMENT 'Aislamiento Tenant',
    work_order_id CHAR(36) NOT NULL,
    type VARCHAR(20) NOT NULL COMMENT 'Enum: INVOICE, RECEIPT, CREDIT_NOTE',
    subtotal_amount DECIMAL(10,2) NOT NULL,
    subtotal_currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
    tax_percentage DECIMAL(5,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    total_currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
    sunat_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'Enum: PENDING, ACCEPTED, REJECTED',
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    CONSTRAINT fk_voucher_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT,
    CONSTRAINT fk_voucher_wo FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE RESTRICT,
    CONSTRAINT chk_voucher_amounts CHECK (subtotal_amount >= 0 AND total_amount >= 0 AND tax_percentage >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_vouchers_tenant_sunat ON vouchers(workshop_id, sunat_status);

CREATE TABLE payments (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID v4/v7',
    voucher_id CHAR(36) NOT NULL COMMENT 'Relación con Voucher',
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
    method VARCHAR(20) NOT NULL COMMENT 'Enum: CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER',
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_payment_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Entidad de pagos realizados a vouchers';

CREATE INDEX idx_payments_voucher ON payments(voucher_id);


-- ==========================================
-- 7. INFRASTRUCTURE: PATRÓN OUTBOX (TS006)
-- ==========================================

CREATE TABLE outbox_messages (
    id CHAR(36) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    payload JSON NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'Enum: PENDING, SENT, FAILED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Patrón Outbox para consistencia eventual';


-- ==========================================
-- 8. PROCEDIMIENTOS ALMACENADOS (TS010)
-- ==========================================

DELIMITER $$

CREATE PROCEDURE SP_REGISTRAR_MOVIMIENTO_STOCK(
    IN p_product_id CHAR(36),
    IN p_movement_type VARCHAR(20),
    IN p_quantity INT,
    IN p_user_id CHAR(36)
)
COMMENT 'Registra movimientos de almacén de forma atómica evitando stock negativo concurrentemente'
SP_BODY: BEGIN
    DECLARE v_current_stock INT;
    DECLARE v_new_stock INT;
    DECLARE v_workshop_id CHAR(36);
    
    -- Manejo de Errores SQL Estricto
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- SELECT ... FOR UPDATE para bloquear el registro concurrentemente y garantizar consistencia ACID
    SELECT current_stock, workshop_id INTO v_current_stock, v_workshop_id
    FROM products
    WHERE id = p_product_id AND deleted_at IS NULL
    FOR UPDATE;

    -- Validar existencia del producto
    IF v_current_stock IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERR_PRODUCT_NOT_FOUND: El producto especificado no existe o fue eliminado.';
    END IF;

    -- Calcular y Validar nuevo stock
    IF p_movement_type = 'INBOUND' THEN
        SET v_new_stock = v_current_stock + p_quantity;
    ELSEIF p_movement_type = 'OUTBOUND' THEN
        IF v_current_stock < p_quantity THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERR_INSUFFICIENT_STOCK: Stock insuficiente para realizar la salida.';
        END IF;
        SET v_new_stock = v_current_stock - p_quantity;
    ELSEIF p_movement_type = 'ADJUSTMENT' THEN
        SET v_new_stock = v_current_stock + p_quantity; -- p_quantity puede ser negativo para ajustes de salida
        IF v_new_stock < 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERR_INSUFFICIENT_STOCK: El ajuste resulta en stock negativo.';
        END IF;
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERR_INVALID_MOVEMENT_TYPE: Tipo de movimiento inválido (INBOUND, OUTBOUND, ADJUSTMENT).';
    END IF;

    -- Actualizar stock del producto
    UPDATE products
    SET current_stock = v_new_stock,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = p_user_id
    WHERE id = p_product_id;

    -- Registrar movimiento inmutable en historial
    INSERT INTO inventory_movements (product_id, movement_type, quantity, created_by)
    VALUES (p_product_id, p_movement_type, p_quantity, p_user_id);

    COMMIT;
END $$

DELIMITER ;