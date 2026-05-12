# Arquitectura de Autenticación, Registro e Inicios de Sesión - Atelier

Este documento especifica de forma integral el diseño de la **Arquitectura de Autenticación, Registro e Inicios de Sesión** para el sistema multi-inquilino (multi-tenant) de **Atelier**, consolidando la lógica de los clientes del taller (propietarios de autos) y el personal interno (administradores, recepcionistas y mecánicos).

---

## 1. Visión General: Seguridad vs. Negocio (Desacoplamiento)

En la arquitectura de Atelier, existe una separación estricta entre la **Autenticación (Identidad)** y el **Negocio (Facturación/Operación)**. Esta división se modela en el esquema de base de datos relacional de la siguiente manera:

```
                  ┌────────────────────────────────────────┐
                  │          TABLA: users (Seguridad)      │
                  │   - email (Login)                      │
                  │   - password_hash (Contraseña Bcrypt)  │
                  │   - google_id (OAuth2)                 │
                  │   - role (ADMIN, MECHANIC, CUSTOMER)   │
                  └───────────────────┬────────────────────┘
                                      │
                                      │ (Vinculado por 'email')
                                      ▼
                  ┌────────────────────────────────────────┐
                  │       TABLA: customers (Negocio)       │
                  │   - document_number (DNI/RUC)          │
                  │   - full_name                          │
                  │   - phone                              │
                  │   - email (Negocio)                    │
                  └────────────────────────────────────────┘
```

### Tabla Comparativa de Responsabilidades

| Característica | Tabla `users` (Seguridad) | Tabla `customers` (Negocio) |
| :--- | :--- | :--- |
| **Rol en el sistema** | Gestionar la **Autenticación** (Login y permisos). | Gestionar la **Facturación y Operación** del taller. |
| **Campos principales** | `email`, `password_hash`, `google_id`, `role`, `workshop_id`. | `document_number` (DNI/RUC), `full_name`, `phone`, `email`. |
| **Modo de creación** | Autónomo (vía Google Sign-In para clientes) o por invitación (empleados). | Creado físicamente por el recepcionista del taller o desde la aprobación de citas. |

---

## 2. Flujo de Clientes del Taller (Citas Híbridas y Login Social)

El acceso de los clientes de los talleres mecánicos (dueños de los vehículos) funciona bajo un **modelo híbrido** que evita registros basura, spam y brechas de seguridad (como que un usuario intente registrar un vehículo ajeno).

### El Modelo Híbrido en 3 Fases
```
 ┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
 │   Fase 1: Pre-Registro  │      │  Fase 2: Aprobación     │      │   Fase 3: Activación    │
 │   (El Cliente Online)   ├─────►│  (El Receptor Físico)   ├─────►│    (El Cliente App)     │
 │ Crea borrador de datos  │      │ Valida y crea oficial   │      │ Inicia sesión con Google│
 └─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

### Los 3 Momentos del Ciclo de Vida:

#### Momento 1: El Pre-Registro (Acción Online del Cliente)
*   **¿Qué ocurre?** Un conductor ingresa a la landing page del taller para agendar una cita. Al ser cliente nuevo, escribe su nombre, teléfono, correo, y la placa de su carro.

##### ⚙️ Algoritmo de Cálculo de Horarios/Slots Disponibles (Landing Page)
Para garantizar una experiencia fluida sin sobreagenda (no-overbooking), la Landing Page de Atelier no muestra campos de hora abiertos, sino una grilla de **slots disponibles** calculados de manera dinámica por el backend según la capacidad física operativa de la sede.

1.  **Cálculo de Capacidad Operativa de la Sede ($C_{sede}$):**
    Representa el total de bahías de trabajo físicas (`work_bays`) de la sucursal seleccionada:
    ```sql
    SELECT COUNT(*) FROM work_bays WHERE branch_id = :branchId AND deleted_at IS NULL;
    ```
2.  **Cuentas de Citas Reservadas a esa Hora ($A_{slot}$):**
    El backend cuenta cuántas citas vigentes (no canceladas) coinciden con la fecha y hora consultada:
    ```sql
    SELECT COUNT(*) FROM appointments 
    WHERE branch_id = :branchId 
      AND appointment_date = :slotDateTime 
      AND status != 'CANCELLED' 
      AND deleted_at IS NULL;
    ```
3.  **Fórmula de Disponibilidad:**
    Un horario (slot) está **disponible** si y solo si:
    $$\text{Slots Disponibles} = C_{sede} - A_{slot} > 0$$

##### Ejemplo Práctico (Sede Miraflores - Capacidad: 3 Bahías):
*   **Caso A: Lunes 9:00 AM (Disponible):**
    *   $C_{sede} = 3$ bahías en total.
    *   $A_{slot} = 2$ citas ya reservadas (ej: cita de Aldo y cita de María Fe).
    *   *Resultado:* $3 - 2 = 1$ slot disponible. El botón **"09:00 AM"** se muestra de color **Verde (Habilitado)** en la web.
*   **Caso B: Lunes 11:00 AM (Lleno / Sold Out):**
    *   $C_{sede} = 3$ bahías en total.
    *   $A_{slot} = 3$ citas ya reservadas (ej: citas de Carlos, Juan y Pedro).
    *   *Resultado:* $3 - 3 = 0$ slots disponibles. El botón **"11:00 AM"** se muestra **Gris (Deshabilitado)**, impidiendo al usuario sobrecargar el taller.

*   **Comportamiento de la Base de Datos:**
    *   El sistema **no** crea registros oficiales en `customers` ni `vehicles` para evitar "contaminar" el inventario activo.
    *   Se inserta un registro en `appointments` con el estado `PENDING_APPROVAL`, dejando `customer_id` y `vehicle_id` como `NULL`.
    *   Los datos ingresados se guardan temporalmente en campos de texto prefijados con `pre_registered_` en la misma fila de la cita.

#### Momento 2: La Aprobación y Creación Oficial (Acción Física en el Taller)
*   **¿Qué ocurre?** El cliente llega físicamente al taller con su auto en la fecha agendada. El recepcionista o asistente del taller lo recibe y abre el panel de control de Atelier para procesar el ingreso de la cita. 

Para evitar duplicidad de perfiles de clientes (un error clásico en talleres donde un mismo cliente es creado varias veces bajo nombres ligeramente distintos), la interfaz del recepcionista cuenta con un **Buscador Inteligente y Motor de Pre-Coincidencia (Pre-Matching)**.

##### 🔍 El Buscador Inteligente y Motor de Coincidencias en el Panel del Recepcionista

Al hacer click sobre la cita pre-registrada, el sistema asiste dinámicamente al recepcionista mediante tres capas de validación:

###### 1. Detección Automática de Coincidencias (Pre-Matching Pasivo)
El backend de Atelier ejecuta una consulta asíncrona de fondo buscando coincidencias exactas del cliente en base a sus identificadores únicos.
*   **Consulta de fondo:**
    ```sql
    SELECT * FROM customers 
    WHERE (document_number = :preRegisteredDoc AND document_type = :preRegisteredDocType)
       OR email = :preRegisteredEmail
       OR phone = :preRegisteredPhone
       AND workshop_id = :workshopId;
    ```
*   **Comportamiento de la UI:** 
    *   **Si encuentra coincidencia:** La pantalla se tiñe de color de advertencia amigable e indica: *"⚠️ Encontramos un cliente existente con el mismo DNI/RUC (DNI 77889900 - Pedro Alcantara)"*. El recepcionista solo pulsa un botón de un click llamado **"Vincular Cita a Cliente Existente"**. El sistema reutiliza el `customer_id` existente y solo registra el vehículo si es nuevo, previniendo duplicados.
    *   **Si no encuentra coincidencia:** Se asume que es un cliente verdaderamente nuevo en el taller.

###### 2. Buscador Manual Unificado (Para Clientes sin Cita / "Walk-ins")
Si un cliente llega al taller de imprevisto (sin cita previa), el recepcionista tiene una **Barra de Búsqueda Universal** con autocompletado en tiempo real que filtra por:
*   **Número de Placa:** Escribe `"ABC"` y filtra los carros que coincidan con la placa.
*   **Número de Documento (DNI/RUC):** Escribe `"72"` y filtra por DNI.
*   **Nombres / Apellidos:** Escribe `"Aldo"` y filtra por texto aproximado.
*   **Teléfono o Correo.**

La API REST que da soporte a esta barra de búsqueda utiliza índices compuestos para responder en menos de 50 milisegundos:
```sql
SELECT * FROM customers 
WHERE workshop_id = :workshopId 
  AND (full_name LIKE CONCAT('%', :query, '%')
    OR document_number LIKE CONCAT(:query, '%')
    OR phone LIKE CONCAT(:query, '%'))
LIMIT 10;
```

###### 3. Creación de Cliente Nuevo Optimizado (Fricción Cero y Costo Sero)
Para mantener la rentabilidad del SaaS y **evitar los altos costos de facturación por consulta** que cobran las APIs de identidad del Estado (RENIEC / SUNAT), Atelier implementa una transferencia directa de datos ingresados por el propio cliente:

*   **Durante el Pre-Registro Online:** El conductor ya se tomó el tiempo de escribir sus datos en la Landing Page (`pre_registered_full_name`, `pre_registered_document_number`, `pre_registered_email`, `pre_registered_phone`, etc.).
*   **En la Recepción del Taller:** El recepcionista ve estos datos ya precargados en el formulario de la cita. El sistema no hace ninguna llamada de cobro a APIs gubernamentales. El recepcionista simplemente realiza un control visual rápido frente al documento físico del cliente para asegurar que no haya errores de digitación y, de ser necesario, corrige un dígito a mano.
*   **Para Clientes "Walk-ins" (sin cita):** El recepcionista simplemente le solicita de manera directa su DNI, nombre, celular y correo, y los digita manualmente en un formulario HTML estándar. Esto asegura un **flujo 100% gratuito** y extremadamente eficiente sin incurrir en costos operativos de terceros.

##### Comportamiento de la Base de Datos al Aprobar:
Una vez que el recepcionista pulsa el botón definitivo de **"Ingresar Vehículo / Aprobar"**, el sistema ejecuta una transacción atómica que:
1.  **Crea o Vincula el Cliente:** Si es nuevo, inserta el registro oficial en `customers`. Si es coincidente, asocia el `customer_id` existente.
2.  **Crea el Vehículo:** Inserta el registro en `vehicles` asociado a ese cliente.
3.  **Actualiza la Cita:** Actualiza `appointments` enlazando el `customer_id` y `vehicle_id` definitivos, y cambia el estado de `status` a `SCHEDULED`.
4.  **Abre la Orden de Trabajo:** Crea automáticamente el borrador (`DRAFT`) de la `work_order` para que el mecánico inicie la inspección.

#### Momento 3: La Activación de la Cuenta Digital (Acción en la App del Cliente)
*   **¿Qué ocurre?** El cliente entra a la aplicación web o descarga la app móvil de Atelier. No necesita inventar ni recordar ninguna contraseña; se le presenta la invitación de **Google One-Tap** para ingresar con un solo toque.

##### 🚀 Integración Técnica y Flujo de Google One-Tap (Fricción Cero)

```
  CLIENTE (Frontend Web)            ATELIER API (Backend)             GOOGLE AUTH SERVER
           │                                 │                                 │
           │── 1. Carga SDK One-Tap ─────────┼────────────────────────────────►│ (Valida origen)
           │◄── 2. Muestra prompt ("Aldo...")┼─────────────────────────────────│
           │                                 │                                 │
 [ Click en "Aldo" ]                         │                                 │
           │── 3. Firma token ID (JWT) ──────┼────────────────────────────────►│ (Genera ID Token)
           │◄── 4. Devuelve token firmado ───┼─────────────────────────────────│
           │                                 │                                 │
           │── 5. POST /auth/google-onetap ─►│                                 │
           │      (Envía ID Token)           │── 6. Verifica firma y aud ─────►│ (Valida criptografía)
           │                                 │    (aud: ClientID)              │
           │                                 │                                 │
           │                                 │── 7. ¿Email en "customers"?     │
           │                                 │      SÍ -> Crea cuenta "users"  │
           │◄─ 8. Retorna JWT de Atelier ────│                                 │
```

##### A. Frontend (Carga Automática de la Tarjeta en la Landing Page)
Se inyecta el SDK oficial de Google Identity Services. Al cargarse la web, si el usuario tiene una cuenta Google activa en su dispositivo, se desliza la tarjeta de login instantáneo sin requerir clicks previos:

```html
<!-- Carga asíncrona del SDK -->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<script>
  window.onload = function () {
    google.accounts.id.initialize({
      client_id: "7788123456-example-google-client.apps.googleusercontent.com",
      callback: handleCredentialResponse, // Callback que recibe el ID Token
      cancel_on_tap_outside: false        // Evita que se cierre por clicks accidentales
    });

    // Dispara el prompt flotante One-Tap automáticamente
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        console.warn("One-Tap no mostrado:", notification.getNotDisplayedReason());
        // Fallback: Mostrar botón estándar "Iniciar Sesión con Google"
      }
    });
  };

  // Envía el token verificado al backend de Atelier
  function handleCredentialResponse(response) {
    fetch("/api/v1/auth/google-onetap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: response.credential })
    })
    .then(res => res.json())
    .then(data => {
      localStorage.setItem("atelier_token", data.jwtToken);
      window.location.href = "/dashboard"; // Redirección al panel
    });
  }
</script>
```

##### B. Backend: Lógica de Autenticación y Auto-Registro (Spring Boot / Java)
El backend actúa como el filtro de seguridad supremo. Al recibir el ID Token (JWT firmado por Google), el backend:
1.  **Valida Criptográficamente:** Descarga las llaves públicas de Google y verifica la firma, la audiencia (`aud` coincida con el Client ID del backend) y la fecha de expiración (`exp`).
2.  **Extrae Identidad:** Obtiene el correo verificado (`email`) y la identidad única de Google (`sub` que mapea a `google_id`).
3.  **Transacción de Registro Autónomo:**
    ```java
    @PostMapping("/google-onetap")
    @Transactional
    public ResponseEntity<AuthResponse> googleOneTap(@RequestBody OneTapRequest req) {
        // 1. Validar Token con Google API Library
        GoogleIdToken idToken = GoogleIdTokenVerifier.verify(req.getToken());
        Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String googleId = payload.getSubject(); // 'sub' claim

        // 2. Buscar si el usuario ya tiene credenciales de acceso creadas
        Optional<User> userOpt = userRepository.findByEmailAndWorkshopId(email, activeWorkshopId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Si existía el usuario pero no tenía el link de Google, lo enlazamos de por vida
            if (user.getGoogleId() == null) {
                user.linkGoogleId(googleId);
                userRepository.save(user);
            }
            return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(user)));
        }

        // 3. Si no existe usuario, verificar si es un cliente físico pre-aprobado en el taller
        Optional<Customer> customerOpt = customerRepository.findByEmailAndWorkshopId(email, activeWorkshopId);

        if (customerOpt.isPresent()) {
            // El cliente es real y aprobado. Auto-creamos su cuenta digital sin contraseñas
            User newUser = User.createCustomerUser(email, googleId, activeWorkshopId);
            userRepository.save(newUser);

            return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(newUser)));
        }

        // 4. Si no existe en "customers", bloquear el acceso (Evita registros fantasmas)
        throw new BadCredentialsException("Su correo no está registrado como cliente activo en el taller.");
    }
    ```

---

### Ejemplo Concreto en Base de Datos (Cliente)

#### Estado A: Solicitud de Cita Realizada (Pre-registro Online)
No existen filas para el cliente en `customers` ni en `vehicles`. La cita se guarda en `appointments` con valores de referencia nulos:
```json
{
  "id": "a5fa938d-ef12-42da-bebe-0f192bca80dd",
  "workshop_id": "e26b1580-b3b0-466d-8c10-ca7f62d1c9ef",
  "customer_id": null, // <--- Aún no existe cliente oficial
  "vehicle_id": null,  // <--- Aún no existe vehículo oficial
  "appointment_date": "2026-05-12T10:00:00Z",
  "status": "PENDING_APPROVAL",
  
  // Datos temporales ingresados por el cliente en la web:
  "pre_registered_full_name": "Pedro Alcantara",
  "pre_registered_document_type": "DNI",
  "pre_registered_document_number": "77889900",
  "pre_registered_email": "pedro.alcantara@gmail.com",
  "pre_registered_phone": "+51987654321",
  "pre_registered_vehicle_plate": "XYZ-789",
  "pre_registered_vehicle_brand_model": "Toyota Corolla 2024"
}
```

#### Estado B: Cita Aprobada por el Recepcionista (Registros Oficiales Creados)
Una vez validada la cita, se crean los registros de negocio y se enlaza el registro original de la cita:

**1. Nuevo registro en `customers`:**
```json
{
  "id": "c9a012de-f3ab-4c22-b9cf-ae08fbff88aa", // ID oficial
  "workshop_id": "e26b1580-b3b0-466d-8c10-ca7f62d1c9ef",
  "document_number": "77889900",
  "document_type": "DNI",
  "full_name": "Pedro Alcantara",
  "email": "pedro.alcantara@gmail.com",
  "phone": "+51987654321"
}
```

**2. Nuevo registro en `vehicles`:**
```json
{
  "id": "v9de2f75-2c64-4c4b-efdb-cf32da0199bb", // ID oficial
  "customer_id": "c9a012de-f3ab-4c22-b9cf-ae08fbff88aa",
  "plate_number": "XYZ-789",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2024,
  "vin": "9T1FJ12FS80988",
  "current_mileage": 12000,
  "usage_type": "PARTICULAR"
}
```

**3. Actualización de la cita en `appointments`:**
```json
{
  "id": "a5fa938d-ef12-42da-bebe-0f192bca80dd",
  "workshop_id": "e26b1580-b3b0-466d-8c10-ca7f62d1c9ef",
  "customer_id": "c9a012de-f3ab-4c22-b9cf-ae08fbff88aa", // Enlazado
  "vehicle_id": "v9de2f75-2c64-4c4b-efdb-cf32da0199bb",  // Enlazado
  "appointment_date": "2026-05-12T10:00:00Z",
  "status": "SCHEDULED"
}
```

#### Flujo Operativo de Validación y Resiliencia ante Inasistencias (No-Show)

Para garantizar la viabilidad financiera y la limpieza de datos bajo la modalidad de Pre-registro Híbrido, el flujo operativo y transaccional se gestiona bajo las siguientes políticas de diseño:

##### 1. Métodos de Validación de la Cita
El personal de recepción (ej: Ana Recepcionista) puede realizar la validación mediante dos canales operativos:
*   **Validación Telefónica/Digital (Pre-Cita):** La recepcionista filtra citas en estado `PENDING_APPROVAL`, llama al cliente para confirmar sus datos de pre-registro (DNI/RUC, placa, modelo), y presiona "Aprobar" en el dashboard desde la oficina.
*   **Validación Presencial (En Ventanilla):** El conductor asiste en el día y hora agendados. La recepcionista valida físicamente su documento de identidad y la placa física del automóvil, recopila el kilometraje actual, y oficializa el ingreso presionando "Aprobar" en tiempo real.

##### 2. Política de Resiliencia ante Inasistencias (No-Show) y Spam
Si un usuario reserva una cita por internet pero nunca se presenta al taller:
*   **Cero Polución en Base de Datos:** Como la cita nunca se aprobó, **jamás** se crearon registros comerciales en las tablas `customers` ni en `vehicles`. La base de datos de clientes activos se mantiene 100% limpia y libre de registros fantasmas.
*   **Cero Costos de Consultas a APIs de Identidad:** Al no oficializar el registro, no se ejecuta ninguna llamada a APIs externas del Estado (como RENIEC o SUNAT), evitando desperdiciar dinero en validar datos de personas que no asistieron.

##### 3. Mecanismos Concurrentes de Limpieza de Citas Pendientes
El sistema cuenta con dos mecanismos complementarios para gestionar y depurar citas que quedaron en el limbo:
*   **Cancelación Manual (Recepcionista):** Si un cliente llama para avisar que no asistirá o la recepcionista decide depurar la cola manualmente durante el día, presiona "Rechazar", lo que cambia el estado de la cita a `CANCELLED`.
*   **Expiración Automática en Background (Cron Job):** Un proceso automatizado en segundo plano (ej: tarea programada o cron) se ejecuta a medianoche para buscar todas las citas en estado `PENDING_APPROVAL` con fecha en el pasado y cambiarlas automáticamente al estado `EXPIRED`. Esto garantiza un inicio de jornada limpio al día siguiente para todo el personal de recepción.

---

### La ventaja de la Arquitectura Multi-Taller (SaaS Multi-tenant)
Este desacoplamiento permite que si un conductor lleva su auto a múltiples talleres mecánicos que usan la plataforma Atelier:
*   Mantiene **una sola cuenta de acceso** en la tabla `users` (con su cuenta de Google).
*   Tiene **múltiples registros comerciales** en la tabla `customers` (uno por cada taller).
*   Al iniciar sesión en la app, el backend cruza su correo y le despliega en una única pantalla integrada sus autos en reparación de todos los talleres afiliados, sin tener que crearse cuentas o claves distintas para cada local.

---

## 3. Flujo de Empleados del Taller (Acceso Cerrado)

Por razones de seguridad empresarial y auditoría, ningún empleado del taller puede auto-registrarse de forma pública en la web de Atelier. 

```
 ┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
 │   Fase 1: Creación      │      │ Fase 2: Clave Temporal  │      │ Fase 3: Inicio Diario   │
 │   (Por el Admin)        ├─────►│  (Primer Inicio de Ses) ├─────►│      (Sesión JWT)       │
 │ Define datos y rol      │      │ Fuerza cambio de clave  │      │ Aislamiento por tenant  │
 └─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

### Paso a Paso Lógico y Técnico:

#### Paso 1: Registro en el Panel de Administración (Por el Admin)
El Administrador (`ADMIN`) del taller da de alta de forma manual al empleado ingresando su nombre, rol (`RECEPTIONIST`, `MECHANIC`), especialidades, correo corporativo y una contraseña temporal de acceso.

#### Paso 2: Procesamiento y Encriptación en el Backend
El backend recibe la información y ejecuta las siguientes acciones:
1.  **Hereda Tenant:** Asocia de forma automática el `workshop_id` del nuevo empleado heredando el del administrador que lo está creando.
2.  **Hashea la Contraseña:** Toma la contraseña temporal, la encripta con **Bcrypt** (`password_hash`) y destruye el texto plano de la memoria.
3.  **Auditoría:** Rellena el campo `created_by` con el ID del administrador creador.

#### Paso 3: Primer Login y Cambio Obligatorio de Clave
El empleado inicia sesión en el portal de Atelier ingresando su correo y contraseña temporal. 
1. El backend valida el hash bcrypt.
2. Al detectar que la cuenta está recién creada (clave temporal), la interfaz web bloquea el sistema y le despliega de forma obligatoria un formulario para **"Configurar Contraseña Personal Definitiva"**.
3. El backend calcula el nuevo hash definitivo, actualiza su contraseña definitiva en la tabla `users` y activa la cuenta para el trabajo ordinario.

#### Paso 4: Inicio de Sesión Diario
En la operación cotidiana, el empleado inicia sesión de forma clásica (correo corporativo y contraseña). El backend valida las credenciales y le entrega un **Token JWT** firmado digitalmente que incluye:
*   `role`: Los permisos de acceso (Mecánico o Recepcionista).
*   `workshop_id`: Utilizado para filtrar automáticamente todas las consultas de la base de datos de manera que **ningún empleado de un taller pueda visualizar información de otro taller mecánico**.

---

### Ejemplo Concreto en Base de Datos (Mecánico)

```json
{
  "id": "0bd36128-4c8d-4aee-b204-765f04ef31aa",
  "workshop_id": "e26b1580-b3b0-466d-8c10-ca7f62d1c9ef", // Taller EuroMotors
  "email": "mario.mechanic@euromotors.com",
  "password_hash": "$2a$10$Y1r7L6nN7aO4w.G3aZ56OeM2u.e6V8A1jP/99vQ1sZf.rE2Tv9K2M", // Clave encriptada en Bcrypt
  "google_id": null, // No utiliza Google Login
  "role": "MECHANIC",
  "specialty": "GENERAL_MECHANIC",
  "created_by": "7ac2e9bc-1b32-4f11-9a99-dc0aef48721c" // Creado por el ADMIN
}
```

---

---

## 4. Gestión de Vehículos y Soporte Multi-Sede (Branches)

Para responder al crecimiento de los talleres y permitir una gestión de flota flexible, Atelier implementa un modelo de datos avanzado que soporta dos casos críticos de negocio:

### Caso 1: El mismo vehículo visita dos talleres mecánicos distintos (Competidores)
Cuando el taller competidor "SolarAutomotriz" intenta registrar el vehículo con la placa `XYZ-789` que ya estaba registrado en el taller "EuroMotors", el sistema **no debe generar colisiones de clave duplicada**.
*   **Solución Técnica:** La tabla `vehicles` cuenta con el campo `workshop_id` y claves únicas compuestas.
*   **Restricción de Integridad:** Se define una clave única combinada:
    ```sql
    CONSTRAINT uq_vehicles_plate UNIQUE (workshop_id, plate_number)
    CONSTRAINT uq_vehicles_vin UNIQUE (workshop_id, vin)
    ```
    Esto permite que la placa `XYZ-789` exista independientemente para cada tenant sin interferencias lógicas ni colisiones de llaves primarias, cumpliendo al 100% con el aislamiento multi-inquilino.

### Caso 2: El mismo vehículo visita otra Sede del mismo taller mecánico (Multi-Branch)
Si el cliente asiste hoy a la *Sede Miraflores* de "EuroMotors" y mañana a la *Sede San Isidro* de la misma empresa, ambos locales **deben poder ver el historial clínico y la telemetría unificada del carro**.
*   **Solución Técnica:** Las entidades comerciales están desacopladas de las operativas.
*   **Esquema de Distribución Jerárquica:**

```
                            ┌───────────────────────────────────┐
                            │      EMPRESA: workshops (Tenant)  │
                            └─────────────────┬─────────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
       ┌───────────────────────────┐                       ┌───────────────────────────┐
       │   NEGOCIO (Corporativo)   │                       │   OPERACIÓN (Sucursal)    │
       │   - customers             │                       │   - branches              │
       │   - vehicles              │                       │   - users (Empleados)     │
       └───────────────────────────┘                       │   - work_bays (Bahías)    │
                                                           │   - appointments (Citas)  │
                                                           │   - work_orders (Órdenes) │
                                                           └───────────────────────────┘
```

1.  **Compartición Transparente:** Al estar los clientes (`customers`) y vehículos (`vehicles`) amarrados directamente al ID de la corporación (`workshop_id`), todas las sedes de la empresa acceden instantáneamente al mismo registro del vehículo y su historial.
2.  **Aislamiento Operativo:** Las bahías físicas de trabajo (`work_bays`), la agenda de citas (`appointments`), los empleados locales (`users`) y las órdenes de trabajo (`work_orders`) se asocian a un `branch_id` específico, manteniendo la agenda y el espacio físico de cada sucursal 100% independiente.

### Caso 3: Traslado o Rotación de Personal entre Sedes
Cuando la empresa reasigna a un mecánico o recepcionista de una sede a otra (ej. de *Sede Miraflores* a *Sede San Isidro*), el sistema maneja el movimiento de forma dinámica y sin pérdida de datos.
*   **Actualización Dinámica:** Se realiza un simple `UPDATE` del campo `branch_id` en la tabla `users`. El cambio es inmediato y el nuevo token JWT refleja la nueva sede de trabajo.
*   **Preservación de Historial:** Las órdenes de trabajo pasadas guardan de forma inmutable el ID de la sede donde se realizaron (`work_orders.branch_id`). Esto asegura que el historial financiero de cada local y la productividad del empleado no se alteren por el traslado.
*   **Regla de Negocio (Backend):** El sistema exige que el colaborador no tenga órdenes activas en curso (`IN_PROGRESS`) en su sede actual antes de que el administrador autorice su traspaso, obligando a realizar una entrega de tareas o reasignación de órdenes a compañeros locales.

---

## 5. Casos Especiales de Negocio y Reglas de Borde

Para garantizar el funcionamiento de Atelier como un sistema SaaS Enterprise maduro, se implementan patrones específicos para resolver la complejidad física y legal del mundo real de los talleres mecánicos:

### A. Venta de Vehículo (Cambio de Propietario)
*   **Problema:** Si el auto con placa `ABC-123` cambia de dueño (Aldo vende su auto a María Fe dentro del mismo taller), María Fe no debe poder visualizar el historial de facturación de Aldo por confidencialidad.
*   **Solución:** No se edita la relación del auto existente. En su lugar, el registro de vehículo antiguo de Aldo se desactiva/archiva (soportando auditoría del historial de Aldo) y se inserta un **nuevo registro** para María Fe en `vehicles` con la misma placa y VIN pero asociado a su `customer_id` y su propia cuenta digital.

### B. Clientes Corporativos y de Flotas (Conductores vs. Pagador)
*   **Problema:** Empresas logísticas llevan múltiples camiones a reparación. La factura va a la empresa de compras, pero el contacto operativo en el taller es el chófer del camión asignado ese día.
*   **Solución:** La tabla `customers` se mantiene como el cliente legal y pagador. Adicionalmente, las tablas `appointments` y `work_orders` cuentan con columnas opcionales `driver_full_name` y `driver_phone`. Las alertas e instrucciones operativas en tiempo real se envían por WhatsApp al chofer, mientras que cotizaciones y facturas se canalizan al portal de compras corporativo.

### C. Administradores Multisede (Supervisor o Auditor Corporativo)
*   **Problema:** Gerentes generales o auditores de calidad de la franquicia necesitan auditar todas las sedes de la empresa de manera unificada sin estar atados a una sucursal física.
*   **Solución:** En la tabla `users`, el campo `branch_id` es **nullable (`NULL`)**. Si el rol es `ADMIN` o `MANAGER` y `branch_id` es `NULL`, el backend le concede acceso a todo el universo de datos del inquilino (`workshop_id`). El frontend despliega un selector dinámico de sedes en la cabecera para permitirle "cambiar de vista" de local o ver reportes consolidados corporativos.

### D. Tipo de Uso del Vehículo y Mantenimiento Predictivo
*   **Problema:** El desgaste físico de un auto de uso particular es drásticamente menor al de un auto de trabajo (Uber/Taxi), por lo que las pautas de alertas y estimaciones preventivas varían.
*   **Solución:** La tabla `vehicles` incluye el atributo `usage_type` (Enum: `PARTICULAR`, `TAXI_UBER`, `HEAVY_DUTY`). El algoritmo predictivo del taller utiliza el kilometraje actual (`current_mileage`) y este tipo de uso para calcular matemáticamente cuándo le tocará al auto su próximo servicio y disparar campañas automáticas de marketing por WhatsApp.

### E. Movilidad de Clientes entre Diferentes Talleres (SSO Global)
*   **Problema:** Un cliente asiste con un vehículo al Taller A (EuroMotors) y con otro vehículo al Taller B (SolarAutomotriz). No debe verse forzado a crear dos cuentas digitales separadas ni a cerrar sesión para cambiar de taller.
*   **Solución:** La autenticación es global en la tabla de seguridad (`users`). El cliente inicia sesión de forma unificada (Single Sign-On). El backend toma su correo electrónico verificado para consultar y mapear dinámicamente sus perfiles en la tabla `customers` de ambos talleres. El cliente visualiza todos sus vehículos y agendas unificadas en su app móvil, mientras que la base de datos mantiene las consultas de los empleados de cada taller estrictamente aisladas mediante el filtro JWT del `workshop_id`.

### F. Compañías de Seguros y Terceros Pagadores (Siniestros)
*   **Problema:** Un auto ingresa al taller tras un choque por cobertura de seguro. El dueño del auto es un particular (Aldo), pero quien aprueba y paga el presupuesto/factura es la aseguradora (ej. Rímac Seguros con su propio RUC). Aldo debe poder ver el avance de la reparación física en su app móvil, pero el flujo comercial/facturación debe dirigirse estrictamente a la aseguradora.
*   **Solución:** La tabla `work_orders` cuenta con un campo opcional `billing_customer_id` (que apunta al registro comercial de la aseguradora en `customers`). Si está configurado, el motor de cotizaciones y facturas genera los documentos tributarios a nombre de la aseguradora, mientras que el campo `customer_id` original (Aldo) garantiza que el dueño conserve la visibilidad del avance de los trabajos técnicos en su aplicación.

### G. Vehículos Familiares Compartidos (Múltiples Conductores)
*   **Problema:** Un vehículo de placa `ABC-123` pertenece a una unidad familiar y es conducido de forma compartida por el padre (Aldo) y la hija (María Fe). Ambos desean descargar la aplicación y poder monitorear la salud del motor y el avance de los servicios de forma simultánea desde sus propios teléfonos.
*   **Solución:** A nivel de base de datos se implementa una tabla intermedia de mapeo $M:N$ llamada `customer_vehicles` en lugar de una restricción rígida de $1:N$. Esto permite que múltiples clientes asocien la misma placa a sus cuentas de usuario (bajo roles de `PROPIETARIO` o `CONDUCTOR AUTORIZADO` mediante flujo de invitación/código QR), dándoles visibilidad compartida y simultánea de la telemetría OBD2.

---

## 6. Beneficios Técnicos y de Negocio de la Arquitectura

1.  **Seguridad Anti-Spoofing:** Evita que clientes malintencionados registren placas de autos de terceros y espíen telemetría privada.
2.  **Calidad del Dato Comercial:** Asegura que los datos de facturación con el Estado (DNI/RUC) sean ingresados de forma correcta o verificada físicamente por un recepcionista antes de procesar órdenes.
3.  **Auditoría Estricta:** Almacena registros detallados de quién creó a qué colaborador y qué empleado aprobó qué cita.
4.  **Aislamiento Estricto Multi-Tenant:** El uso del JWT y el claim de `workshop_id` asegura que los datos comerciales de talleres competidores se mantengan 100% aislados a nivel lógico.
5.  **Multi-Sede Listo para el Crecimiento:** La separación física a nivel de sucursales combinada con la consolidación a nivel de cliente corporativo permite un crecimiento ilimitado de franquicias y redes de talleres bajo la misma cuenta.
