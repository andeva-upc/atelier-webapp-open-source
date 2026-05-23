CREATE TABLE appointments
(
  id               CHAR(36)    NOT NULL,
  branch_id        CHAR(36)    NOT NULL,
  customer_id      CHAR(36)    NOT NULL,
  vehicle_id       CHAR(36)    NOT NULL,
  appointment_date DATETIME    NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' COMMENT 'Enum: SCHEDULED, COMPLETED, CANCELLED',
  version          BIGINT      NULL     DEFAULT 0,
  created_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP   NULL    ,
  PRIMARY KEY (id)
);

CREATE TABLE branches
(
  id                CHAR(36)     NOT NULL,
  workshop_id       CHAR(36)     NOT NULL,
  branch_name       VARCHAR(100) NOT NULL,
  branch_address    VARCHAR(200) NULL    ,
  branch_phone      VARCHAR(50)  NULL    ,
  hourly_capacity   INT          NOT NULL DEFAULT 3,
  subscription_plan VARCHAR(20)  NOT NULL,
  version           BIGINT       NOT NULL DEFAULT 0,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NULL    ,
  deleted_at        TIMESTAMP    NULL    ,
  created_by        CHAR(36)     NULL    ,
  updated_by        CHAR(36)     NULL    ,
  PRIMARY KEY (id)
);

CREATE TABLE categories
(
  id            CHAR(36)    NOT NULL,
  category_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE customer_profiles
(
  id            CHAR(36)    NOT NULL,
  user_id       CHAR(36)    NOT NULL,
  first_name    VARCHAR(50) NULL    ,
  last_name     VARCHAR(50) NULL    ,
  is_corporate  BOOLEAN     NOT NULL,
  business_name VARCHAR(50) NULL    ,
  created_by    CHAR(36)    NULL    ,
  PRIMARY KEY (id)
);

CREATE TABLE customer_registration
(
  id              CHAR(36)   NOT NULL,
  branch_id       CHAR(36)   NOT NULL,
  customer_id     CHAR(36)   NOT NULL,
  registered_at   TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unregistered_at TIMESTAMP  NULL    ,
  PRIMARY KEY (id)
);

CREATE TABLE dtc_alerts
(
  id                    CHAR(36)     NOT NULL,
  telemetry_snapshot_id CHAR(36)     NOT NULL,
  dtc_code              VARCHAR(10)  NOT NULL,
  description           VARCHAR(255) NOT NULL,
  severity              VARCHAR(20)  NOT NULL COMMENT 'Enum: LOW, MEDIUM, HIGH, CRITICAL',
  created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version               BIGINT       NOT NULL DEFAULT 0,
  branch_id             CHAR(36)     NULL    ,
  PRIMARY KEY (id)
);

CREATE TABLE employee_profiles
(
  id         CHAR(36)    NOT NULL,
  user_id    CHAR(36)    NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name  VARCHAR(50) NOT NULL,
  created_by CHAR(36)    NULL    ,
  PRIMARY KEY (id)
);

CREATE TABLE employee_registration
(
  id              CHAR(36)      NOT NULL,
  branch_id       CHAR(36)      NOT NULL,
  employee_id     CHAR(36)      NOT NULL,
  specialty_id    CHAR(36)      NOT NULL,
  salary          DECIMAL(10,2) NOT NULL,
  registered_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unregistered_at TIMESTAMP     NULL    ,
  PRIMARY KEY (id)
);

CREATE TABLE inventory_batches
(
  id                 CHAR(36)      NOT NULL,
  product_id         CHAR(36)      NOT NULL,
  initial_quantity   INT           NOT NULL,
  available_quantity INT           NOT NULL,
  acquisition_cost   DECIMAL(10,2) NOT NULL,
  entry_date         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  branch_id          CHAR(36)      NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE obd2_device_vehicle_registration
(
  id              CHAR(36)  NOT NULL,
  obd2_id         CHAR(36)  NOT NULL,
  vehicle_id      CHAR(36)  NOT NULL,
  registered_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unregistered_at TIMESTAMP NULL    ,
  branch_id       CHAR(36)  NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE obd2_devices
(
  id          CHAR(36)    NOT NULL,
  branch_id   CHAR(36)    NOT NULL,
  mac_address VARCHAR(17) NOT NULL,
  last_ping   DATETIME    NULL    ,
  status      VARCHAR(20) NOT NULL DEFAULT 'INACTIVE' COMMENT 'Enum: ACTIVE, INACTIVE',
  version     BIGINT      NOT NULL DEFAULT 0,
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP   NULL    ,
  deleted_at  TIMESTAMP   NULL    ,
  created_by  CHAR(36)    NOT NULL,
  updated_by  CHAR(36)    NULL    ,
  PRIMARY KEY (id)
);

ALTER TABLE obd2_devices
  ADD CONSTRAINT UQ_mac_address UNIQUE (mac_address);

CREATE TABLE owner_profiles
(
  id         CHAR(36)    NOT NULL,
  user_id    CHAR(36)    NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name  VARCHAR(50) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE password_recovery_tokens
(
  id         CHAR(36)     NOT NULL,
  user_id    CHAR(36)     NOT NULL,
  token      VARCHAR(100) NOT NULL,
  expires_at DATETIME     NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

ALTER TABLE password_recovery_tokens
  ADD CONSTRAINT UQ_token UNIQUE (token);

CREATE TABLE payments
(
  id         CHAR(36)      NOT NULL,
  voucher_id CHAR(36)      NOT NULL,
  amount     DECIMAL(10,2) NOT NULL,
  currency   VARCHAR(3)    NOT NULL DEFAULT 'PEN',
  method     VARCHAR(20)   NOT NULL COMMENT 'Enum: CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER',
  paid_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version    BIGINT        NOT NULL DEFAULT 0,
  branch_id  CHAR(36)      NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE products
(
  id                    CHAR(36)      NOT NULL,
  category_id           CHAR(36)      NOT NULL,
  branch_id             CHAR(36)      NOT NULL,
  product_name          VARCHAR(50)   NOT NULL,
  sku                   VARCHAR(50)   NOT NULL,
  description           TEXT          NULL    ,
  current_selling_price DECIMAL(10,2) NOT NULL,
  current_stock         INT           NOT NULL DEFAULT 0,
  minimum_stock         INT           NOT NULL,
  version               BIGINT        NOT NULL DEFAULT 0,
  created_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP     NULL    ,
  deleted_at            TIMESTAMP     NULL    ,
  created_by            CHAR(36)      NOT NULL,
  updated_by            CHAR(36)      NULL    ,
  PRIMARY KEY (id)
);

CREATE TABLE quotes
(
  id                  CHAR(36)      NOT NULL,
  work_order_id       CHAR(36)      NOT NULL,
  subtotal_amount     DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2)  NULL    ,
  total_amount        DECIMAL(10,2) NOT NULL,
  version             BIGINT        NOT NULL DEFAULT 0,
  status              VARCHAR(20)   NOT NULL DEFAULT 'DRAFT' COMMENT 'Enum: DRAFT, APPROVED, CANCELLED',
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     NULL    ,
  deleted_at          TIMESTAMP     NULL    ,
  created_by          CHAR(36)      NOT NULL,
  updated_by          CHAR(36)      NULL    ,
  branch_id           CHAR(36)      NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE services
(
  id            CHAR(36)      NOT NULL,
  service_name  VARCHAR(50)   NOT NULL,
  service_price DECIMAL(10,2) NOT NULL,
  branch_id     CHAR(36)      NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE specialties
(
  id             CHAR(36)    NOT NULL,
  specialty_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE telemetry_snapshots
(
  id                                  CHAR(36)  NOT NULL,
  obd2_device_vehicle_registration_id CHAR(36)  NOT NULL,
  branch_id                           CHAR(36)  NOT NULL,
  rpm                                 INT       NOT NULL,
  temp                                INT       NOT NULL,
  speed_kmh                           DOUBLE    NULL    ,
  odometer_km                         INT       NULL    ,
  fuel_level_percent                  DOUBLE    NULL    ,
  created_at                          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE users
(
  id              CHAR(36)     NOT NULL,
  email           VARCHAR(150) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  google_id       VARCHAR(255) NULL    ,
  document_type   VARCHAR(20)  NOT NULL COMMENT 'Enum: DNI, RUC, CE, PASSPORT',
  document_number VARCHAR(50)  NOT NULL,
  phone           CHAR(9)      NOT NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NULL    ,
  deleted_at      TIMESTAMP    NULL    ,
  version         BIGINT       NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

ALTER TABLE users
  ADD CONSTRAINT UQ_email UNIQUE (email);

ALTER TABLE users
  ADD CONSTRAINT UQ_password_hash UNIQUE (password_hash);

ALTER TABLE users
  ADD CONSTRAINT UQ_google_id UNIQUE (google_id);

ALTER TABLE users
  ADD CONSTRAINT UQ_document_number UNIQUE (document_number);

ALTER TABLE users
  ADD CONSTRAINT UQ_phone UNIQUE (phone);

CREATE TABLE vehicle_models
(
  id    CHAR(36)    NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE vehicles
(
  id               CHAR(36)    NOT NULL,
  user_id          CHAR(36)    NOT NULL,
  vehicle_model_id CHAR(36)    NOT NULL,
  plate_number     VARCHAR(20) NOT NULL,
  year             INT         NOT NULL,
  vin              VARCHAR(50) NOT NULL,
  current_mileage  INT         NOT NULL DEFAULT 0,
  created_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP   NULL     DEFAULT CURRENT_TIMESTAMP,
  deleted_at       TIMESTAMP   NULL    ,
  PRIMARY KEY (id)
);

ALTER TABLE vehicles
  ADD CONSTRAINT UQ_plate_number UNIQUE (plate_number);

CREATE TABLE vouchers
(
  id              CHAR(36)       NOT NULL,
  quote_id        CHAR(36)       NOT NULL,
  voucher_number  VARCHAR(50)    NOT NULL,
  subtotal_amount DECIMAL(10,2)  NOT NULL,
  total_amount    DECIMAL(10,2)  NOT NULL,
  type            VARCHAR(20)    NOT NULL COMMENT 'Enum: INVOICE, RECEIPT, CREDIT_NOTE',
  status          VARCHAR(20)    NOT NULL DEFAULT 'PENDING' COMMENT 'Enum: PENDING, PAID',
  version         BIGINT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP      NULL    ,
  deleted_at      TIMESTAMP      NULL    ,
  created_by      CHAR(36)       NOT NULL,
  updated_by      CHAR(36)       NULL    ,
  currency        CHAR(3)        NOT NULL DEFAULT 'PEN',
  branch_id       CHAR(36)       NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE work_order_task_products
(
  work_order_task_id CHAR(36)      NOT NULL,
  product_id         CHAR(36)      NOT NULL,
  quantity           INT           NOT NULL,
  unit_price         DECIMAL(10,2) NOT NULL,
  total_amount       DECIMAL(10,2) NOT NULL,
  created_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP     NULL    ,
  deleted_at         TIMESTAMP     NULL    ,
  branch_id          CHAR(36)      NOT NULL,
  PRIMARY KEY (work_order_task_id, product_id)
) COMMENT 'the products usage in the work order task';

CREATE TABLE work_order_tasks
(
  id            CHAR(36)      NOT NULL,
  work_order_id CHAR(36)      NOT NULL,
  service_id    CHAR(36)      NOT NULL,
  description   TEXT          NULL    ,
  mechanic_id   CHAR(36)      NOT NULL,
  total_price   DECIMAL(10,2) NOT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'PENDING' COMMENT 'Enum: PENDING, DOING, DONE',
  hours         DECIMAL(5,2)  NULL     COMMENT 'Real hours spent on the task',
  started_at    DATETIME      NULL    ,
  completed_at  DATETIME      NULL    ,
  version       BIGINT        NULL     DEFAULT 0,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NULL    ,
  deleted_at    TIMESTAMP     NULL    ,
  created_by    CHAR(36)      NOT NULL,
  updated_by    CHAR(36)      NULL    ,
  branch_id     CHAR(36)      NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE work_orders
(
  id              CHAR(36)    NOT NULL,
  workbay_id      CHAR(36)    NOT NULL,
  branch_id       CHAR(36)    NOT NULL,
  internal_number INT         NOT NULL,
  customer_id     CHAR(36)    NOT NULL,
  vehicle_id      CHAR(36)    NOT NULL,
  current_mileage INT         NOT NULL DEFAULT 0,
  diagnosis       TEXT        NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS' COMMENT 'Enum: IN_PROGRESS, COMPLETED, PAID',
  version         BIGINT      NOT NULL DEFAULT 0,
  created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP   NULL    ,
  closed_at       DATETIME    NULL    ,
  deleted_at      TIMESTAMP   NULL    ,
  created_by      CHAR(36)    NOT NULL,
  updated_by      CHAR(36)    NULL    ,
  PRIMARY KEY (id)
);

CREATE TABLE workbays
(
  id              CHAR(36)    NOT NULL,
  branch_id       CHAR(36)    NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'VACANT' COMMENT 'Enum: VACANT, OCCUPIED, NOT AVAILABLE',
  version         BIGINT      NOT NULL DEFAULT 0,
  internal_number INT         NOT NULL,
  created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP   NULL    ,
  deleted_at      TIMESTAMP   NULL    ,
  PRIMARY KEY (id)
);

CREATE TABLE workshops
(
  id                      CHAR(36)     NOT NULL,
  owner_id                CHAR(36)     NOT NULL,
  mileage_interval_config INT          NULL     DEFAULT 1,
  tax_id                  VARCHAR(50)  NOT NULL,
  workshop_name           VARCHAR(50)  NOT NULL COMMENT 'RUC',
  is_active               BOOLEAN      NOT NULL DEFAULT TRUE,
  version                 BIGINT       NOT NULL DEFAULT 0,
  created_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP    NULL    ,
  deleted_at              TIMESTAMP    NULL    ,
  PRIMARY KEY (id)
);

ALTER TABLE workshops
  ADD CONSTRAINT UQ_tax_id UNIQUE (tax_id);

ALTER TABLE branches
  ADD CONSTRAINT FK_workshops_TO_branches
    FOREIGN KEY (workshop_id)
    REFERENCES workshops (id);

ALTER TABLE password_recovery_tokens
  ADD CONSTRAINT FK_users_TO_password_recovery_tokens
    FOREIGN KEY (user_id)
    REFERENCES users (id);

ALTER TABLE workbays
  ADD CONSTRAINT FK_branches_TO_workbays
    FOREIGN KEY (branch_id)
    REFERENCES branches (id);

ALTER TABLE appointments
  ADD CONSTRAINT FK_branches_TO_appointments
    FOREIGN KEY (branch_id)
    REFERENCES branches (id);

ALTER TABLE obd2_devices
  ADD CONSTRAINT FK_branches_TO_obd2_devices
    FOREIGN KEY (branch_id)
    REFERENCES branches (id);

ALTER TABLE obd2_device_vehicle_registration
  ADD CONSTRAINT FK_obd2_devices_TO_obd2_device_vehicle_registration
    FOREIGN KEY (obd2_id)
    REFERENCES obd2_devices (id);

ALTER TABLE dtc_alerts
  ADD CONSTRAINT FK_telemetry_snapshots_TO_dtc_alerts
    FOREIGN KEY (telemetry_snapshot_id)
    REFERENCES telemetry_snapshots (id);

ALTER TABLE work_orders
  ADD CONSTRAINT FK_workbays_TO_work_orders
    FOREIGN KEY (workbay_id)
    REFERENCES workbays (id);

ALTER TABLE work_order_tasks
  ADD CONSTRAINT FK_work_orders_TO_work_order_tasks
    FOREIGN KEY (work_order_id)
    REFERENCES work_orders (id);

ALTER TABLE work_order_task_products
  ADD CONSTRAINT FK_work_order_tasks_TO_work_order_task_products
    FOREIGN KEY (work_order_task_id)
    REFERENCES work_order_tasks (id);

ALTER TABLE work_order_task_products
  ADD CONSTRAINT FK_products_TO_work_order_task_products
    FOREIGN KEY (product_id)
    REFERENCES products (id);

ALTER TABLE quotes
  ADD CONSTRAINT FK_work_orders_TO_quotes
    FOREIGN KEY (work_order_id)
    REFERENCES work_orders (id);

ALTER TABLE vouchers
  ADD CONSTRAINT FK_quotes_TO_vouchers
    FOREIGN KEY (quote_id)
    REFERENCES quotes (id);

ALTER TABLE payments
  ADD CONSTRAINT FK_vouchers_TO_payments
    FOREIGN KEY (voucher_id)
    REFERENCES vouchers (id);

ALTER TABLE work_order_tasks
  ADD CONSTRAINT FK_services_TO_work_order_tasks
    FOREIGN KEY (service_id)
    REFERENCES services (id);

ALTER TABLE vehicles
  ADD CONSTRAINT FK_users_TO_vehicles
    FOREIGN KEY (user_id)
    REFERENCES users (id);

ALTER TABLE products
  ADD CONSTRAINT FK_categories_TO_products
    FOREIGN KEY (category_id)
    REFERENCES categories (id);

ALTER TABLE inventory_batches
  ADD CONSTRAINT FK_products_TO_inventory_batches
    FOREIGN KEY (product_id)
    REFERENCES products (id);

ALTER TABLE products
  ADD CONSTRAINT FK_branches_TO_products
    FOREIGN KEY (branch_id)
    REFERENCES branches (id);

ALTER TABLE obd2_device_vehicle_registration
  ADD CONSTRAINT FK_vehicles_TO_obd2_device_vehicle_registration
    FOREIGN KEY (vehicle_id)
    REFERENCES vehicles (id);

ALTER TABLE telemetry_snapshots
  ADD CONSTRAINT FK_obd2_device_vehicle_registration_TO_telemetry_snapshots
    FOREIGN KEY (obd2_device_vehicle_registration_id)
    REFERENCES obd2_device_vehicle_registration (id);

ALTER TABLE customer_registration
  ADD CONSTRAINT FK_branches_TO_customer_registration
    FOREIGN KEY (branch_id)
    REFERENCES branches (id);

ALTER TABLE employee_registration
  ADD CONSTRAINT FK_branches_TO_employee_registration
    FOREIGN KEY (branch_id)
    REFERENCES branches (id);

ALTER TABLE customer_profiles
  ADD CONSTRAINT FK_users_TO_customer_profiles
    FOREIGN KEY (user_id)
    REFERENCES users (id);

ALTER TABLE employee_profiles
  ADD CONSTRAINT FK_users_TO_employee_profiles
    FOREIGN KEY (user_id)
    REFERENCES users (id);

ALTER TABLE owner_profiles
  ADD CONSTRAINT FK_users_TO_owner_profiles
    FOREIGN KEY (user_id)
    REFERENCES users (id);

ALTER TABLE workshops
  ADD CONSTRAINT FK_owner_profiles_TO_workshops
    FOREIGN KEY (owner_id)
    REFERENCES owner_profiles (id);

ALTER TABLE customer_registration
  ADD CONSTRAINT FK_customer_profiles_TO_customer_registration
    FOREIGN KEY (customer_id)
    REFERENCES customer_profiles (id);

ALTER TABLE employee_registration
  ADD CONSTRAINT FK_employee_profiles_TO_employee_registration
    FOREIGN KEY (employee_id)
    REFERENCES employee_profiles (id);

ALTER TABLE vehicles
  ADD CONSTRAINT FK_vehicle_models_TO_vehicles
    FOREIGN KEY (vehicle_model_id)
    REFERENCES vehicle_models (id);

ALTER TABLE employee_registration
  ADD CONSTRAINT FK_specialties_TO_employee_registration
    FOREIGN KEY (specialty_id)
    REFERENCES specialties (id);

ALTER TABLE work_orders
  ADD CONSTRAINT FK_customer_profiles_TO_work_orders
    FOREIGN KEY (customer_id)
    REFERENCES customer_profiles (id);

ALTER TABLE work_orders
  ADD CONSTRAINT FK_vehicles_TO_work_orders
    FOREIGN KEY (vehicle_id)
    REFERENCES vehicles (id);


-- =============================================================================
-- ATELIER WORKSHOP DATABASE - STANDALONE PROCEDURES, TRIGGERS & SEARCH FUNCTIONS
-- =============================================================================
-- This file defines database-level logic, triggers, stored procedures, 
-- and custom search functions.
-- Compatible with MySQL/MariaDB.
-- Optimized to match the modified schema including multi-tenancy (branch_id).
-- =============================================================================

DELIMITER //

-- =============================================================================
-- 1. DATABASE TRIGGERS (INTEGRITY, MULTI-TENANCY & AUTOMATION)
-- =============================================================================

-- Trigger: Check Branch Capacity Before Appointment
-- Prevents overbooking a branch beyond its designated hourly capacity.
DROP TRIGGER IF EXISTS tg_check_branch_capacity_before_appointment//
CREATE TRIGGER tg_check_branch_capacity_before_appointment
BEFORE INSERT ON appointments
FOR EACH ROW
BEGIN
    DECLARE v_capacity INT;
    DECLARE v_current_appointments INT;

    SELECT hourly_capacity INTO v_capacity
    FROM branches
    WHERE id = NEW.branch_id;

    SELECT COUNT(*) INTO v_current_appointments
    FROM appointments
    WHERE branch_id = NEW.branch_id
      AND DATE_FORMAT(appointment_date, '%Y-%m-%d %H') = DATE_FORMAT(NEW.appointment_date, '%Y-%m-%d %H')
      AND status = 'SCHEDULED';

    IF v_current_appointments >= v_capacity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Capacity limit reached for this branch at the selected hour.';
    END IF;
END//


-- Trigger: Update Product Stock on Batch Entry & Validate Tenant
-- Automatically increments product inventory counters when an inventory batch is created.
-- Enforces branch_id matching between batch and product to prevent cross-tenant errors.
DROP TRIGGER IF EXISTS tg_update_product_stock_on_batch_entry//
CREATE TRIGGER tg_update_product_stock_on_batch_entry
AFTER INSERT ON inventory_batches
FOR EACH ROW
BEGIN
    DECLARE v_product_branch CHAR(36);

    SELECT branch_id INTO v_product_branch
    FROM products
    WHERE id = NEW.product_id;

    IF v_product_branch != NEW.branch_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Product branch does not match inventory batch branch.';
    END IF;

    UPDATE products
    SET current_stock = current_stock + NEW.initial_quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
END//


-- Trigger: Update Voucher Status on Payment & Validate Tenant
-- Marks invoice/receipt as PAID when cumulative payments cover the total balance.
-- Enforces branch_id matching between payment and voucher to prevent cross-tenant errors.
DROP TRIGGER IF EXISTS tg_update_voucher_status_on_payment//
CREATE TRIGGER tg_update_voucher_status_on_payment
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_paid_amount DECIMAL(10,2);
    DECLARE v_voucher_branch CHAR(36);

    SELECT total_amount, branch_id INTO v_total_amount, v_voucher_branch
    FROM vouchers
    WHERE id = NEW.voucher_id;

    IF v_voucher_branch != NEW.branch_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Payment branch does not match voucher branch.';
    END IF;

    SELECT COALESCE(SUM(amount), 0) INTO v_paid_amount
    FROM payments
    WHERE voucher_id = NEW.voucher_id;

    IF v_paid_amount >= v_total_amount THEN
        UPDATE vouchers
        SET status = 'PAID',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.voucher_id;
    END IF;
END//


-- Trigger: Update Work Order Status on Tasks Done (NEW AUTOMATION)
-- When all tasks in a work order are marked as 'DONE', automatically marks the work order as 'COMPLETED'.
DROP TRIGGER IF EXISTS tg_update_work_order_status_on_tasks_done//
CREATE TRIGGER tg_update_work_order_status_on_tasks_done
AFTER UPDATE ON work_order_tasks
FOR EACH ROW
BEGIN
    DECLARE v_pending_tasks INT;

    IF NEW.status = 'DONE' AND OLD.status != 'DONE' THEN
        SELECT COUNT(*) INTO v_pending_tasks
        FROM work_order_tasks
        WHERE work_order_id = NEW.work_order_id
          AND status != 'DONE';

        IF v_pending_tasks = 0 THEN
            UPDATE work_orders
            SET status = 'COMPLETED',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.work_order_id;
        END IF;
    END IF;
END//


-- Trigger: Auto Release Workbay on Work Order Completion (NEW AUTOMATION)
-- Automatically marks the associated workbay as 'VACANT' when the work order is COMPLETED or PAID.
DROP TRIGGER IF EXISTS tg_auto_release_workbay_on_work_order_completion//
CREATE TRIGGER tg_auto_release_workbay_on_work_order_completion
AFTER UPDATE ON work_orders
FOR EACH ROW
BEGIN
    IF (NEW.status = 'COMPLETED' OR NEW.status = 'PAID') AND (OLD.status = 'IN_PROGRESS') THEN
        UPDATE workbays
        SET status = 'VACANT',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.workbay_id;
    END IF;
END//


-- =============================================================================
-- 2. CORE WORKFLOW PROCEDURES (ATOMIC TRANSACTIONS)
-- =============================================================================

-- Procedure: Create Work Order & Validate Tenant
-- Validates workbay status and branch alignment, creates the order, locks the bay, and updates vehicle mileage.
-- Sets status to 'IN_PROGRESS' in alignment with new work_orders status constraint.
DROP PROCEDURE IF EXISTS sp_create_work_order//
CREATE PROCEDURE sp_create_work_order(
    IN p_id CHAR(36),
    IN p_workbay_id CHAR(36),
    IN p_branch_id CHAR(36),
    IN p_internal_number INT,
    IN p_customer_id CHAR(36),
    IN p_vehicle_id CHAR(36),
    IN p_current_mileage INT,
    IN p_diagnosis TEXT,
    IN p_created_by CHAR(36)
)
BEGIN
    DECLARE v_workbay_status VARCHAR(20);
    DECLARE v_workbay_branch CHAR(36);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT status, branch_id INTO v_workbay_status, v_workbay_branch
    FROM workbays
    WHERE id = p_workbay_id FOR UPDATE;

    IF v_workbay_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Workbay does not exist.';
    ELSEIF v_workbay_branch != p_branch_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Workbay does not belong to the selected branch.';
    ELSEIF v_workbay_status != 'VACANT' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Workbay is occupied or unavailable.';
    END IF;

    -- Using status 'IN_PROGRESS' to match enum constraints (Enum: IN_PROGRESS, COMPLETED, PAID)
    INSERT INTO work_orders (
        id, workbay_id, branch_id, internal_number, customer_id, vehicle_id, 
        current_mileage, diagnosis, status, created_by, created_at, updated_at
    ) VALUES (
        p_id, p_workbay_id, p_branch_id, p_internal_number, p_customer_id, p_vehicle_id, 
        p_current_mileage, p_diagnosis, 'IN_PROGRESS', p_created_by, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );

    UPDATE workbays
    SET status = 'OCCUPIED',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_workbay_id;

    UPDATE vehicles
    SET current_mileage = p_current_mileage,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_vehicle_id;

    COMMIT;
END//


-- Procedure: Consume Product FIFO (Tenant Aware)
-- Chronologically deducts stock from available inventory batches of the specific branch to fulfill demand.
-- Inserts branch_id into work_order_task_products.
DROP PROCEDURE IF EXISTS sp_consume_product_fifo//
CREATE PROCEDURE sp_consume_product_fifo(
    IN p_work_order_task_id CHAR(36),
    IN p_product_id CHAR(36),
    IN p_quantity INT
)
BEGIN
    DECLARE v_current_stock INT;
    DECLARE v_selling_price DECIMAL(10,2);
    DECLARE v_remaining_qty_to_consume INT;
    DECLARE v_batch_id CHAR(36);
    DECLARE v_batch_available INT;
    DECLARE v_branch_id CHAR(36);
    DECLARE v_product_branch CHAR(36);
    
    DECLARE done INT DEFAULT FALSE;
    -- Cursor filtered by branch_id to ensure physical isolation
    DECLARE batch_cursor CURSOR FOR 
        SELECT id, available_quantity 
        FROM inventory_batches 
        WHERE product_id = p_product_id 
          AND branch_id = v_branch_id
          AND available_quantity > 0
        ORDER BY entry_date ASC;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT branch_id INTO v_branch_id
    FROM work_order_tasks
    WHERE id = p_work_order_task_id FOR UPDATE;

    IF v_branch_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Work order task not found.';
    END IF;

    SELECT current_stock, current_selling_price, branch_id 
    INTO v_current_stock, v_selling_price, v_product_branch
    FROM products
    WHERE id = p_product_id FOR UPDATE;

    IF v_current_stock IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Product not found.';
    ELSEIF v_product_branch != v_branch_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Product belongs to a different branch.';
    ELSEIF v_current_stock < p_quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Insufficient stock.';
    END IF;

    SET v_remaining_qty_to_consume = p_quantity;
    
    OPEN batch_cursor;
    
    read_loop: LOOP
        FETCH batch_cursor INTO v_batch_id, v_batch_available;
        IF done OR v_remaining_qty_to_consume <= 0 THEN
            LEAVE read_loop;
        END IF;

        IF v_batch_available >= v_remaining_qty_to_consume THEN
            UPDATE inventory_batches
            SET available_quantity = available_quantity - v_remaining_qty_to_consume
            WHERE id = v_batch_id;
            
            SET v_remaining_qty_to_consume = 0;
        ELSE
            UPDATE inventory_batches
            SET available_quantity = 0
            WHERE id = v_batch_id;
            
            SET v_remaining_qty_to_consume = v_remaining_qty_to_consume - v_batch_available;
        END IF;
    END LOOP;
    
    CLOSE batch_cursor;

    IF v_remaining_qty_to_consume > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Inventory batches inconsistency for this branch.';
    END IF;

    UPDATE products
    SET current_stock = current_stock - p_quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_product_id;

    IF EXISTS(SELECT 1 FROM work_order_task_products WHERE work_order_task_id = p_work_order_task_id AND product_id = p_product_id) THEN
        UPDATE work_order_task_products
        SET quantity = quantity + p_quantity,
            total_amount = (quantity + p_quantity) * unit_price,
            updated_at = CURRENT_TIMESTAMP
        WHERE work_order_task_id = p_work_order_task_id AND product_id = p_product_id;
    ELSE
        INSERT INTO work_order_task_products (
            work_order_task_id, product_id, quantity, unit_price, total_amount, created_at, updated_at, branch_id
        ) VALUES (
            p_work_order_task_id, p_product_id, p_quantity, v_selling_price, p_quantity * v_selling_price, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_branch_id
        );
    END IF;

    COMMIT;
END//


-- Procedure: Approve Quote and Generate Voucher (Tenant Aware)
-- Transitions a quote to APPROVED and generates the customer invoice/receipt including branch_id.
DROP PROCEDURE IF EXISTS sp_approve_quote_and_generate_voucher//
CREATE PROCEDURE sp_approve_quote_and_generate_voucher(
    IN p_quote_id CHAR(36),
    IN p_voucher_id CHAR(36),
    IN p_voucher_number VARCHAR(50),
    IN p_voucher_type VARCHAR(20), 
    IN p_created_by CHAR(36)
)
BEGIN
    DECLARE v_work_order_id CHAR(36);
    DECLARE v_subtotal_amount DECIMAL(10,2);
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_quote_status VARCHAR(20);
    DECLARE v_branch_id CHAR(36);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT work_order_id, subtotal_amount, total_amount, status, branch_id
    INTO v_work_order_id, v_subtotal_amount, v_total_amount, v_quote_status, v_branch_id
    FROM quotes
    WHERE id = p_quote_id FOR UPDATE;

    IF v_quote_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Quote not found.';
    ELSEIF v_quote_status != 'DRAFT' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Quote is not in DRAFT status.';
    END IF;

    UPDATE quotes
    SET status = 'APPROVED',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_quote_id;

    -- Defaults currency to 'PEN', populates branch_id
    INSERT INTO vouchers (
        id, quote_id, voucher_number, subtotal_amount, total_amount, 
        type, status, version, created_at, updated_at, created_by, currency, branch_id
    ) VALUES (
        p_voucher_id, p_quote_id, p_voucher_number, v_subtotal_amount, v_total_amount,
        p_voucher_type, 'PENDING', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, p_created_by, 'PEN', v_branch_id
    );

    -- Updates work order to 'IN_PROGRESS' to match enum constraints
    UPDATE work_orders
    SET status = 'IN_PROGRESS',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_work_order_id;

    COMMIT;
END//


-- Procedure: Create Quote from Work Order (NEW AUTOMATION)
-- Transactionally creates a DRAFT quote by summing up all tasks and consumed products.
DROP PROCEDURE IF EXISTS sp_create_quote_from_work_order//
CREATE PROCEDURE sp_create_quote_from_work_order(
    IN p_quote_id CHAR(36),
    IN p_work_order_id CHAR(36),
    IN p_discount_percentage DECIMAL(5,2),
    IN p_created_by CHAR(36)
)
BEGIN
    DECLARE v_subtotal DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_products_total DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_tasks_total DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_total DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_branch_id CHAR(36);
    DECLARE v_wo_status VARCHAR(50);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT branch_id, status INTO v_branch_id, v_wo_status
    FROM work_orders
    WHERE id = p_work_order_id FOR UPDATE;

    IF v_branch_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Work order not found.';
    END IF;

    SELECT COALESCE(SUM(total_price), 0.00) INTO v_tasks_total
    FROM work_order_tasks
    WHERE work_order_id = p_work_order_id;

    SELECT COALESCE(SUM(wtp.total_amount), 0.00) INTO v_products_total
    FROM work_order_task_products wtp
    INNER JOIN work_order_tasks wt ON wtp.work_order_task_id = wt.id
    WHERE wt.work_order_id = p_work_order_id;

    SET v_subtotal = v_tasks_total + v_products_total;

    IF p_discount_percentage IS NOT NULL AND p_discount_percentage > 0 THEN
        SET v_total = v_subtotal * (1.00 - (p_discount_percentage / 100.00));
    ELSE
        SET v_total = v_subtotal;
    END IF;

    INSERT INTO quotes (
        id, work_order_id, subtotal_amount, discount_percentage, total_amount,
        version, status, created_at, updated_at, created_by, branch_id
    ) VALUES (
        p_quote_id, p_work_order_id, v_subtotal, p_discount_percentage, v_total,
        0, 'DRAFT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, p_created_by, v_branch_id
    );

    COMMIT;
END//


-- =============================================================================
-- 3. CUSTOM DATABASE FUNCTIONS (UDFs FOR HELPER QUERIES)
-- =============================================================================

-- Function: Get Customer Name
-- Resolves either "First Last" or "Corporate Business Name" dynamically by customer ID.
DROP FUNCTION IF EXISTS fn_get_customer_name//
CREATE FUNCTION fn_get_customer_name(p_customer_id CHAR(36))
RETURNS VARCHAR(150)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_name VARCHAR(150);
    DECLARE v_is_corporate BOOLEAN;
    DECLARE v_first_name VARCHAR(50);
    DECLARE v_last_name VARCHAR(50);
    DECLARE v_business_name VARCHAR(50);

    SELECT is_corporate, first_name, last_name, business_name
    INTO v_is_corporate, v_first_name, v_last_name, v_business_name
    FROM customer_profiles
    WHERE id = p_customer_id;

    IF v_is_corporate THEN
        SET v_name = v_business_name;
    ELSE
        SET v_name = CONCAT(COALESCE(v_first_name, ''), ' ', CONALESCE(v_last_name, ''));
    END IF;

    RETURN TRIM(v_name);
END//


-- Function: Get Vehicle Name
-- Resolves full vehicle identity "Brand Model (Plate)" by vehicle ID.
DROP FUNCTION IF EXISTS fn_get_vehicle_name//
CREATE FUNCTION fn_get_vehicle_name(p_vehicle_id CHAR(36))
RETURNS VARCHAR(150)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_vehicle_desc VARCHAR(150);
    
    SELECT CONCAT(m.brand, ' ', m.model, ' (', v.plate_number, ')')
    INTO v_vehicle_desc
    FROM vehicles v
    INNER JOIN vehicle_models m ON v.vehicle_model_id = m.id
    WHERE v.id = p_vehicle_id;

    RETURN v_vehicle_desc;
END//


-- =============================================================================
-- 4. SEARCH ENGINES & INDEXING PROCEDURES (FOR QUICK BACKEND INTEGRATION)
-- =============================================================================

-- Procedure: Global Search Customers
-- Search customers in a branch by email, phone, document, or name strings.
DROP PROCEDURE IF EXISTS sp_global_search_customers//
CREATE PROCEDURE sp_global_search_customers(
    IN p_search_term VARCHAR(100),
    IN p_branch_id CHAR(36)
)
BEGIN
    SELECT 
        cp.id AS customer_id,
        u.id AS user_id,
        fn_get_customer_name(cp.id) AS full_name,
        u.email,
        u.phone,
        u.document_type,
        u.document_number,
        cp.is_corporate,
        cr.registered_at
    FROM customer_profiles cp
    INNER JOIN users u ON cp.user_id = u.id
    INNER JOIN customer_registration cr ON cp.id = cr.customer_id
    WHERE cr.branch_id = p_branch_id
      AND cr.unregistered_at IS NULL
      AND (
          u.email LIKE CONCAT('%', p_search_term, '%')
          OR u.phone LIKE CONCAT('%', p_search_term, '%')
          OR u.document_number LIKE CONCAT('%', p_search_term, '%')
          OR cp.first_name LIKE CONCAT('%', p_search_term, '%')
          OR cp.last_name LIKE CONCAT('%', p_search_term, '%')
          OR cp.business_name LIKE CONCAT('%', p_search_term, '%')
      );
END//


-- Procedure: Search Active Work Orders
-- Searches active work orders by Plate (ignoring dashes), VIN, Doc, Client name or internal number.
DROP PROCEDURE IF EXISTS sp_search_active_work_orders//
CREATE PROCEDURE sp_search_active_work_orders(
    IN p_search_term VARCHAR(100),
    IN p_branch_id CHAR(36)
)
BEGIN
    DECLARE v_clean_search VARCHAR(100);
    SET v_clean_search = REPLACE(REPLACE(p_search_term, '-', ''), ' ', '');

    SELECT 
        wo.id AS work_order_id,
        wo.internal_number,
        wo.status AS work_order_status,
        wo.current_mileage,
        wo.created_at,
        v.plate_number,
        fn_get_vehicle_name(v.id) AS vehicle_details,
        fn_get_customer_name(wo.customer_id) AS customer_name,
        wb.internal_number AS workbay_number
    FROM work_orders wo
    INNER JOIN vehicles v ON wo.vehicle_id = v.id
    INNER JOIN customer_profiles cp ON wo.customer_id = cp.id
    INNER JOIN users u ON cp.user_id = u.id
    INNER JOIN workbays wb ON wo.workbay_id = wb.id
    WHERE wo.branch_id = p_branch_id
      AND wo.deleted_at IS NULL
      AND (
          CAST(wo.internal_number AS CHAR) = p_search_term
          OR REPLACE(REPLACE(v.plate_number, '-', ''), ' ', '') LIKE CONCAT('%', v_clean_search, '%')
          OR v.vin LIKE CONCAT('%', p_search_term, '%')
          OR u.document_number LIKE CONCAT('%', p_search_term, '%')
          OR cp.first_name LIKE CONCAT('%', p_search_term, '%')
          OR cp.last_name LIKE CONCAT('%', p_search_term, '%')
          OR cp.business_name LIKE CONCAT('%', p_search_term, '%')
      )
    ORDER BY wo.created_at DESC;
END//


-- Procedure: Search Products
-- Search products in a branch by SKU, description, category, and flags low stock thresholds.
DROP PROCEDURE IF EXISTS sp_search_products//
CREATE PROCEDURE sp_search_products(
    IN p_search_term VARCHAR(100),
    IN p_branch_id CHAR(36)
)
BEGIN
    SELECT 
        p.id AS product_id,
        p.product_name,
        p.sku,
        p.description,
        p.current_selling_price,
        p.current_stock,
        p.minimum_stock,
        c.category_name,
        (p.current_stock <= p.minimum_stock) AS is_low_stock
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.branch_id = p_branch_id
      AND p.deleted_at IS NULL
      AND (
          p.sku LIKE CONCAT('%', p_search_term, '%')
          OR p.description LIKE CONCAT('%', p_search_term, '%')
          OR c.category_name LIKE CONCAT('%', p_search_term, '%')
      )
    ORDER BY p.sku ASC;
END//

DELIMITER ;