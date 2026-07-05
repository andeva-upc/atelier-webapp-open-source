# Documentación Frontend: Bounded Context `iot`

Este documento describe la estructura visual, tipografía, colores, botones y paneles exclusivos del Bounded Context de **IoT (Internet of Things & Telemetry)** en la aplicación frontend de Atelier. 

Este módulo se centra en la experiencia "Hardware-Software", por lo que su interfaz de usuario está altamente orientada a dashboards en tiempo real, tablas de datos y estados de conexión.

---

## Tipografía y Colores Base

El módulo hereda la tipografía global (probablemente Inter o Roboto), pero hace un uso intensivo de elementos visuales específicos:

*   **Color Primario (Acciones principales):** Gradientes azules (`#3b82f6` a `#2563eb`).
*   **Color de Éxito / Conectado:** Verde esmeralda (`#10b981`).
*   **Color de Peligro / Alertas:** Rojo (`#ef4444` / `#dc2626`).
*   **Color de Advertencia:** Naranja/Amarillo (`#f59e0b`).
*   **Fondos y Superficies:** Se usa mucho el fondo claro `var(--bg-surface, #f9fafb)` contrastando con tarjetas blancas (`#ffffff`) para resaltar los paneles de datos.
*   **Glassmorphism:** En barras de control superiores (como en el dashboard), se utiliza un efecto de vidrio esmerilado (`background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px);`) para dar un aspecto muy tecnológico y moderno.

---

## Detalle de Vistas, Paneles y Botones (UI)

### 1. Vista de Vehículos (`vehicles-list`)
Pantalla principal para ver el catálogo de vehículos.
*   **Panel Superior (Header) & Búsqueda:**
    *   Título con icono (usando la librería `PrimeIcons` - `pi pi-car`).
    *   **Botón "Registrar Vehículo" (btn-primary):** Botón azul con gradiente y efecto de elevación al hacer hover.
    *   Barra de búsqueda limpia con icono integrado, cuenta la cantidad de resultados encontrados dinámicamente.
*   **Panel Principal (Grid / Tabla):**
    *   Tabla (`vehicles-table`) con un diseño muy limpio. Los encabezados son grises y en mayúsculas (`text-transform: uppercase`).
    *   **Celda de Marca:** Incluye un "Avatar" circular con la inicial de la marca, con fondo de gradiente azul.
    *   **Celda de Placa:** Usa un diseño de placa (`plate-badge`) con fondo azul claro y borde azul.
    *   **Fila Clicable:** Al hacer clic en una fila (`clickable-row`), se abre un modal de detalles laterales o superpuestos.
*   **Modal de Detalles de Vehículo:**
    *   Un overlay oscuro (`rgba(15, 23, 42, 0.4)`) con difuminado (`backdrop-filter: blur(2px)`).
    *   Contiene botones secundarios rápidos: Editar, Eliminar (rojo), y accesos directos (links con iconos) para ir al Historial de Alertas DTC o al Dashboard de Telemetría del vehículo seleccionado.

### 2. Dashboard de Telemetría (`telemetry-dashboard`)
Es la pantalla más compleja y "viva" del módulo, diseñada para simular o ver datos en tiempo real.
*   **Barra de Control Superior (Control Bar):**
    *   Panel con diseño *Glassmorphism*.
    *   **Selector de Vehículo:** Un `<select>` estilizado para cambiar rápidamente de contexto.
    *   **Indicador de Conexión (Status Indicator):** Un componente visual clave. Si el vehículo tiene un OBD2 conectado, muestra un **punto verde con animación de pulso** (`pulse-dot`) y la MAC address. Si no, muestra un punto gris estático.
    *   **Botones de Acción:** Botón para "Vincular" (azul suave), "Desvincular" (rojo suave) y "Simular Telemetría" (verde).
*   **Grid de Métricas (Metric Cards):**
    *   4 tarjetas principales (RPM, Temperatura, Velocidad, Nivel de Combustible).
    *   Cada tarjeta tiene un título sutil, un icono, un número grande (valor actual) y una **Barra de Progreso** inferior.
    *   **Barras de Progreso Dinámicas:** Cambian de color según el valor (Normal = gradiente azul, Warning = gradiente amarillo, Danger = gradiente rojo). Ej: Si las RPM superan los 5500, la barra se pone roja.
*   **Historial de Telemetría y Alertas (Tablas Inferiores):**
    *   Dividido en dos secciones (`telemetry-history` y `dtc-alerts`).
    *   La tabla de Alertas DTC contiene "Badges" especiales de severidad (Bajo, Medio, Alto, Crítico). El badge **Crítico** (`critical`) tiene una animación de respiración (`animation: breathing 2s infinite`) en rojo oscuro y naranja para llamar la atención del mecánico.
*   **Modal de Ingreso de Telemetría (`ingest-modal`):**
    *   Se abre mediante el botón verde. Permite mandar "Snapshots" manuales (RPM, Temperatura, etc.). Contiene validaciones visuales y un banner verde de éxito tras mandar un dato correcto.

### 3. Lista de Dispositivos OBD2 (`obd2-devices-list`)
Pantalla administrativa para gestionar el hardware físico (los escáneres OBD2).
*   **Panel Superior (Header):**
    *   Botón de retroceso simple (`btn-back`).
    *   Botón "Agregar OBD2" (`btn-primary-gradient`).
*   **Panel Principal (Tabla `styled-table`):**
    *   Muestra la MAC del dispositivo en una celda formateada como código fuente (`<code/>`).
    *   **Etiquetas de Estado (`status-badge`):** Verdes si está `AVAILABLE` (Disponible), azules si está `LINKED` (Vinculado a un vehículo) y rojas si está `NOT_AVAILABLE`.
    *   **Columna de Acciones (Botones icono):** Botones compactos (`btn-action-link`, `btn-action-edit`, `btn-action-delete`) que actúan como accesos directos para vincular el hardware al vehículo, editar su MAC o darlo de baja. Tienen hover effects que cambian ligeramente su fondo y sombra.

### Reglas de Vinculación (Vehículos y dispositivos OBD2)
El proceso para asociar un dispositivo físico a un vehículo se puede iniciar desde dos puntos principales de la interfaz:
1.  **Desde el Dashboard (Selected Vehicle):** Cuando se selecciona un vehículo que no tiene conexión, aparece el botón *Vincular* que redirige al formulario pasándole el ID del vehículo.
2.  **Desde OBD2 Device Management:** Administrando la lista general, haciendo clic en el botón *Vincular* de un dispositivo con estado `AVAILABLE`.

**Reglas de negocio aplicadas en la UI al vincular:**
*   **Disponibilidad Cruzada:** En el formulario de vinculación (`obd2-device-registration-create`), los selectores (`<select>`) se alimentan exclusivamente de listas filtradas (`store.availableVehicles()` y `store.availableObd2Devices()`). 
    *   Un vehículo solo se puede seleccionar si actualmente **no tiene** otro OBD2 activo.
    *   Un OBD2 solo se puede seleccionar si su estado es estrictamente `AVAILABLE`.
*   **Ámbito por Sede (Branch):** Tanto el vehículo como el OBD2 deben pertenecer a la sede activa (`branchId` en el LocalStorage). No se pueden cruzar dispositivos de diferentes sedes.
*   **Manejo de Conflictos:** Si dos administradores intentan vincular el mismo dispositivo al mismo tiempo y el servidor rechaza uno de ellos (Error 409 Conflict), la UI captura el error y muestra un mensaje de alerta rojo (`alert-box error`) indicando que el recurso ya fue asignado.

---

## Integración Externa (Shared / Dashboards)

El Bounded Context de IoT expone sus interfaces al resto del sistema bajo el patrón de **Micro-Frontends / Composición de Componentes**. 

Actualmente, el componente `VehiclesListComponent` (`<app-vehicles-list>`) es consumido directamente por el **Customer Dashboard** global (ubicado en `src/app/shared`). Esto permite que los clientes vean y gestionen sus vehículos apenas inician sesión, sin necesidad de navegar explícitamente a la ruta del módulo IoT, manteniendo al mismo tiempo la lógica de negocio y estilos estrictamente delegados a la capa de IoT.
