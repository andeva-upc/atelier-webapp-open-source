CREATE DATABASE IF NOT EXISTS atelier_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE atelier_db;

CREATE TABLE workshops (
    id CHAR(36) PRIMARY KEY,
    tax_id VARCHAR(50) NOT NULL UNIQUE,
    business_name VARCHAR(150) NOT NULL,
    subscription_plan VARCHAR(20) NOT NULL COMMENT 'Enum: LITE, PRO, MAX',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE branches (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    branch_id CHAR(36) NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    google_id VARCHAR(255) UNIQUE NULL,
    role VARCHAR(20) NOT NULL COMMENT 'Enum: ADMIN, MECHANIC, CUSTOMER, RECEPTIONIST',
    specialty VARCHAR(30) NULL COMMENT 'Enum: GENERAL_MECHANIC, AUTOMOTIVE_ELECTRONIC, BODY_AND_PAINT, DIAGNOSTICIAN. Null for non-mechanics',
    full_name VARCHAR(200) NULL,
    
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

CREATE TABLE password_recovery_tokens (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recovery_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE customers (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    document_number VARCHAR(50) NOT NULL,
    document_type VARCHAR(20) NOT NULL COMMENT 'Enum: DNI, RUC, CE, PASSPORT',
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(150) NULL,
    phone VARCHAR(50),
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    CONSTRAINT fk_customers_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT,
    UNIQUE (workshop_id, document_type, document_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_customers_tenant ON customers(workshop_id, created_at);

CREATE TABLE vehicles (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NULL,
    plate_number VARCHAR(20) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
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

CREATE TABLE work_bays (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    branch_id CHAR(36) NOT NULL,
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

CREATE TABLE appointments (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    branch_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NULL,
    vehicle_id CHAR(36) NULL,
    appointment_date DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' COMMENT 'Enum: PENDING_APPROVAL, SCHEDULED, COMPLETED, CANCELLED',
    
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

CREATE TABLE telemetry_snapshots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id CHAR(36) NOT NULL,
    timestamp DATETIME NOT NULL,
    rpm INT NOT NULL,
    temp DOUBLE NOT NULL,
    speed_kmh INT NULL,
    odometer_km INT NULL,
    fuel_level_percent DOUBLE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_telemetry_device FOREIGN KEY (device_id) REFERENCES obd2_devices(id) ON DELETE CASCADE,
    CONSTRAINT chk_telemetry_rpm CHECK (rpm >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_telemetry_device_time ON telemetry_snapshots(device_id, timestamp);

CREATE TABLE work_orders (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    branch_id CHAR(36) NOT NULL,
    internal_number INT NOT NULL,
    customer_id CHAR(36) NOT NULL,
    billing_customer_id CHAR(36) NULL,
    vehicle_id CHAR(36) NOT NULL,
    assigned_mechanic_id CHAR(36) NOT NULL,
    driver_name VARCHAR(150) NULL,
    driver_phone VARCHAR(50) NULL,
    current_mileage INT NOT NULL DEFAULT 0,
    diagnosis TEXT NULL,
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
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
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

CREATE TABLE quotes (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    vehicle_id CHAR(36) NOT NULL,
    description TEXT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
    subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_percentage DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    notes TEXT NULL,
    valid_until DATETIME NULL,
    approved_at DATETIME NULL,
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_quote_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT,
    CONSTRAINT fk_quote_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_quote_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quote_items (
    id CHAR(36) PRIMARY KEY,
    quote_id CHAR(36) NOT NULL,
    type VARCHAR(20) NOT NULL COMMENT 'Enum: PRODUCT, SERVICE',
    reference_id CHAR(36) NULL,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quote_item_quote FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NULL,
    description TEXT,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    current_stock INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 0,
    
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
    reference_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by CHAR(36) NULL,
    CONSTRAINT fk_movement_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE vouchers (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    work_order_id CHAR(36) NOT NULL,
    type VARCHAR(20) NOT NULL COMMENT 'Enum: INVOICE, RECEIPT, CREDIT_NOTE',
    subtotal_amount DECIMAL(10,2) NOT NULL,
    subtotal_currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
    tax_percentage DECIMAL(5,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    total_currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
    voucher_number VARCHAR(50) NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'Enum: PENDING, PAID, CANCELLED',
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

CREATE TABLE voucher_items (
    id CHAR(36) PRIMARY KEY,
    voucher_id CHAR(36) NOT NULL,
    type VARCHAR(20) NOT NULL COMMENT 'Enum: PRODUCT, SERVICE',
    reference_id CHAR(36) NULL,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_voucher_item_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_vouchers_tenant_sunat ON vouchers(workshop_id, sunat_status);

CREATE TABLE payments (
    id CHAR(36) PRIMARY KEY,
    voucher_id CHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
    method VARCHAR(20) NOT NULL COMMENT 'Enum: CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER',
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_payment_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_payments_voucher ON payments(voucher_id);

CREATE TABLE outbox_messages (
    id CHAR(36) PRIMARY KEY,
    workshop_id CHAR(36) NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSON NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'Enum: PENDING, SENT, FAILED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$

CREATE PROCEDURE SP_REGISTRAR_MOVIMIENTO_STOCK(
    IN p_product_id CHAR(36),
    IN p_movement_type VARCHAR(20),
    IN p_quantity INT,
    IN p_user_id CHAR(36)
)
SP_BODY: BEGIN
    DECLARE v_current_stock INT;
    DECLARE v_new_stock INT;
    DECLARE v_workshop_id CHAR(36);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT current_stock, workshop_id INTO v_current_stock, v_workshop_id
    FROM products
    WHERE id = p_product_id AND deleted_at IS NULL
    FOR UPDATE;

    IF v_current_stock IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERR_PRODUCT_NOT_FOUND: El producto especificado no existe o fue eliminado.';
    END IF;

    IF p_movement_type = 'INBOUND' THEN
        SET v_new_stock = v_current_stock + p_quantity;
    ELSEIF p_movement_type = 'OUTBOUND' THEN
        IF v_current_stock < p_quantity THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERR_INSUFFICIENT_STOCK: Stock insuficiente para realizar la salida.';
        END IF;
        SET v_new_stock = v_current_stock - p_quantity;
    ELSEIF p_movement_type = 'ADJUSTMENT' THEN
        SET v_new_stock = v_current_stock + p_quantity;
        IF v_new_stock < 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERR_INSUFFICIENT_STOCK: El ajuste resulta en stock negativo.';
        END IF;
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERR_INVALID_MOVEMENT_TYPE: Tipo de movimiento inválido (INBOUND, OUTBOUND, ADJUSTMENT).';
    END IF;

    UPDATE products
    SET current_stock = v_new_stock,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = p_user_id
    WHERE id = p_product_id;

    INSERT INTO inventory_movements (product_id, movement_type, quantity, created_by)
    VALUES (p_product_id, p_movement_type, p_quantity, p_user_id);

    COMMIT;
END $$

DELIMITER ;