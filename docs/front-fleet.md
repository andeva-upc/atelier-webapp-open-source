# Documentación Frontend: Bounded Context `fleet`

Este documento describe la estructura, componentes y flujo de datos exclusivos del Bounded Context de **Fleet** (Flota / Gestión Administrativa) en la aplicación frontend de Atelier.

Este módulo está estructurado de manera robusta utilizando patrones de **Clean Architecture**, **Command Query Responsibility Segregation (CQRS)** a nivel lógico, y manejo de estado moderno con **Angular Signals**.

## Estructura de Capas (Domain-Driven Design)

El módulo se divide en las siguientes cuatro capas principales:

### 1. Gestión de Estado y Lógica de Negocio (`application`)

El núcleo de la lógica en la aplicación cliente reside en `fleet.store.ts`.

*   **Manejo de Estado (Signals):** Utiliza la reactividad moderna de Angular (Signals) para mantener el estado de la aplicación. Declara `signals` privados (ej: `appointmentsSignal`, `customerRegistrationsSignal`) y expone versiones de solo lectura (`asReadonly()`) para que los componentes visuales se suscriban a los datos sin poder mutarlos accidentalmente.
*   **Orquestación:** El `FleetStore` expone métodos como `loadAppointmentsByBranchId` y `createAppointment`. Estos métodos se encargan de comunicarse con la API y, una vez resuelta la petición, actualizan directamente los Signals para que toda la interfaz se entere del cambio reactivamente.

### 2. Infraestructura y Conexión de Datos (`infrastructure`)

Las peticiones al backend no se hacen de forma dispersa, sino mediante patrones *Facade* y *Assembler*.

*   **Endpoints HTTP:** Existen clases dedicadas por cada recurso (ej. `appointments.endpoint.ts`). Usan el `HttpClient` de Angular para comunicarse con el servidor, obteniendo la URL base de los archivos de entorno (`environment.apiBaseUrl`) y realizando las operaciones CRUD.
*   **Facade (API):** La clase `FleetApi` agrupa los endpoints del dominio (`appointments`, `customerRegistrations`, `employeeRegistrations`) para ser inyectados fácilmente en el store.
*   **Patrón Assembler:** Al crear o actualizar datos, los endpoints utilizan un *Assembler* (ej. `CreateAppointmentRequestAssembler`) para transformar el modelo de dominio interno (*Command*) en el formato exacto que el backend espera recibir (*Request JSON*).
*   **Modelos de Respuesta:** Las respuestas del servidor están tipadas mediante interfaces ubicadas en `infrastructure/responses` (como `AppointmentResource`).

### 3. Modelo de Dominio (`domain/model`)

Define "el qué" del sistema, declarando las reglas e intenciones de la interfaz.

*   **Commands:** Para las mutaciones (POST, PUT), el sistema usa "Comandos" (ej: `CreateAppointmentCommand`). La interfaz de usuario crea este comando y se lo envía al `FleetStore` indicando la intención de realizar una acción.

### 4. Interfaz de Usuario y Vistas (`presentation`)

Las pantallas finales y componentes visuales, enrutados a través de `fleet.routes.ts`.

*   **Rutas y Vistas Principales:**
    *   `/appointments`: Lista de Citas (`AppointmentsListComponent`).
    *   `/appointments/new` y `/appointments/:id/edit`: Formulario de Citas (`AppointmentFormComponent`).
    *   `/staff`: Lista del Personal / Mecánicos (`StaffListComponent`).
    *   `/customers`: Vista de Clientes (`CustomersViewComponent`).
*   **Componentes Reutilizables:** Dentro de `presentation/components`, el módulo tiene piezas atómicas de interfaz, como `mechanic-selector` o `customer-selector`. Estos componentes se conectan al `FleetStore` para obtener datos estandarizados.

---

## Flujo de Datos: Ejemplo (Crear una Cita)

El ciclo de vida completo de un dato, tomando como ejemplo la creación de una nueva cita, funciona de la siguiente manera:

1.  **Interacción UI:** El usuario completa los datos y presiona "Guardar" en el componente `AppointmentFormComponent`.
2.  **Dispatch de Comando:** El componente crea un objeto `CreateAppointmentCommand` y llama al método `createAppointment(comando)` del `FleetStore`.
3.  **Llamada a API:** El `FleetStore` invoca a la fachada `FleetApi`, que a su vez llama a `AppointmentsApiEndpoint`.
4.  **Ensamblado (Assembler):** El Endpoint pasa el comando por `CreateAppointmentRequestAssembler` para convertirlo a JSON, y hace la petición HTTP POST hacia el backend.
5.  **Actualización Reactiva (Signal):** Cuando el backend responde con éxito, la suscripción en el `FleetStore` recibe el dato y actualiza su Signal interno (`appointmentsSignal.update(...)`).
6.  **Renderizado Automático:** Automáticamente, cualquier lista o vista suscrita al Signal de citas detecta el cambio y se vuelve a renderizar para mostrar la cita recién agregada.

---

## Detalle de Vistas, Paneles y Botones (UI)

A continuación, se detalla el funcionamiento interno, los paneles y los botones disponibles en cada una de las pantallas principales del módulo Fleet:

### 1. Vista de Citas (`appointments-list`)
Esta pantalla muestra el calendario y las citas programadas.
*   **Panel Superior (Header):**
    *   **Barra de Búsqueda:** Filtra las citas en tiempo real escribiendo el nombre del cliente, placa del vehículo o ID.
    *   **Filtro por Estado:** Un menú desplegable (Select) para ver todas las citas o filtrar por `PENDING`, `COMPLETED` o `CANCELED`.
    *   **Botón "Agregar Cita" (Add Appointment):** Redirige al formulario de creación (`/fleet/appointments/new`).
*   **Panel Principal (Grid de Citas):**
    *   Muestra tarjetas (cards) individuales por cita indicando su estado, fecha/hora, cliente y vehículo.
    *   **Botón "Editar" (Edit):** Ubicado en el pie de cada tarjeta, redirige al formulario en modo edición (`/fleet/appointments/:id/edit`).
*   **Estado Vacío (Empty State):** Si no hay citas, se muestra un panel central amigable con un botón rápido para "Agregar Cita".

### 2. Formulario de Citas (`appointment-form`)
Pantalla de creación/edición de una cita.
*   **Botón "Volver a la lista" (Back):** Regresa a la vista anterior. Si hay cambios no guardados, lanza una alerta de confirmación para evitar pérdida de datos.
*   **Panel de Formulario:**
    *   **Buscador Autocompletado de Cliente:** Permite buscar y seleccionar un cliente de la lista.
    *   **Buscador Autocompletado de Vehículo:** Se activa y filtra los vehículos basándose en el cliente seleccionado previamente.
    *   **Selector de Fecha y Hora:** Utiliza `MatDatepicker` de Angular Material.
    *   **Selector de Estado:** (Solo visible si se está editando una cita existente).
*   **Panel de Acciones (Footer):**
    *   **Botón "Cancelar":** Cancela la operación y vuelve a la lista.
    *   **Botón "Agendar/Guardar Cambios" (Submit):** Valida los datos y dispara el comando (`CreateAppointmentCommand` o `UpdateAppointmentCommand`) hacia el store, mostrando un spinner de carga (`fa-spinner`) mientras procesa.

### 3. Vista de Personal / Mecánicos (`staff-list`)
Pantalla para administrar a los empleados (mecánicos, etc.) de la sucursal.
*   **Panel Superior (Header):**
    *   **Botón "Agregar Empleado" (Add Employee):** Abre una ventana modal emergente (`StaffFormDialogComponent`) para registrar un nuevo empleado.
*   **Panel Principal (Grid de Personal):**
    *   Tarjetas con información del rol, nombre, estado (Activo/Inactivo) y salario base.
    *   **Botón "Editar" (Lápiz):** Abre el modal de empleado en modo edición para actualizar su rol, estado o salario.
    *   **Botón "Eliminar" (Papelera):** Solicita confirmación en pantalla y, si se acepta, elimina el registro permanentemente llamando al store (`deleteEmployeeRegistration`).

### 4. Vista de Clientes (`customers`)
Pantalla para administrar los clientes de la sucursal y vincularlos.
*   **Panel Superior (Header):**
    *   **Barra de Búsqueda:** Filtra la lista de clientes por nombre, documento o teléfono.
    *   **Botón "Agregar Cliente":** Abre la ventana modal de registro de clientes (`openAddModal()`).
*   **Panel Principal (Grid de Clientes):**
    *   Tarjetas con información de contacto y una etiqueta visual que distingue si es un cliente Corporativo (`business`) o Personal (`person`).
    *   **Botón de Opciones (Tres puntos):** Despliega un menú contextual flotante (Dropdown).
    *   **Acción "Desvincular" (Deregister):** Ubicada dentro del menú flotante, abre una ventana modal de confirmación. Al confirmar, ejecuta un *"Soft Delete"* (cambia el estado a inactivo) ya que no se elimina físicamente al cliente de la plataforma.
*   **Modal Agregar Cliente (Add Modal):**
    *   **Panel de Búsqueda Global:** Permite ingresar un correo electrónico y presionar "Buscar". Realiza consultas a los microservicios IAM y Core para encontrar al usuario en toda la plataforma.
    *   **Sub-formulario de Creación:** Si el usuario existe pero no tiene perfil de cliente, se despliega dinámicamente un formulario dentro del modal para pedir su Nombre, Apellidos, Tipo/Número de Documento, y Teléfono.
    *   **Botón "Registrar":** Vincula al cliente con la sucursal actual (envía un `CreateCustomerRegistrationCommand`).

---

## Integración Externa (Shared / Dashboards)

Bajo la nueva arquitectura de UI por composición, los datos de `fleet` (como las Próximas Citas) están diseñados para integrarse en el **Customer Dashboard** (módulo `shared`) mediante componentes encapsulados. Actualmente, el acoplamiento directo de estado (`FleetStore`) en el dashboard ha sido removido temporalmente hasta que se finalice el desarrollo de un componente equivalente a una "Lista de Citas Resumida" que pueda ser importado limpiamente como un *Web Component* o *Standalone Component*.
