# Dashboards (Cliente y Administrador)

Este documento describe la arquitectura, el diseño y las conexiones de datos implementadas en los componentes de dashboard dentro del módulo `shared`.

## 1. Diseño Visual y UI
Ambos dashboards (`customer-dashboard` y `admin-dashboard`) han sido refactorizados para mantener consistencia con el diseño *premium* e interfaz moderna implementada en el módulo de facturación (Billing).

- **Estética Plana**: Se eliminaron las sombras predeterminadas de Angular Material (`mat-elevation-z8`) en las tarjetas y tablas. Ahora se utilizan bordes tenues (`1px solid #E5E7EB`) y esquinas redondeadas para dar una apariencia limpia.
- **Tipografía**: Se estandarizó el uso de la fuente global mediante variables CSS (`var(--font-body)` y `var(--font-display)` para `Inter`). Los encabezados de KPIs y tablas utilizan texto en mayúsculas pequeñas, con color gris (`#6B7280`) y un *letter-spacing* sutil.
- **Gráficos (Chart.js)**:
  - Cuadrículas del gráfico (`grid`) muy tenues (`#F3F4F6`) para el eje Y, mientras que las del eje X se ocultan para reducir ruido visual.
  - Paleta de colores estandarizada: Azul primario (`#0071EB`), Verde (`#10B981`), Naranja (`#F59E0B`), Rojo (`#EF4444`).
  - Bordes redondeados en las barras del gráfico de ingresos.

## 2. Internacionalización (i18n)
Toda la capa de presentación tiene soporte para cambio de idioma en tiempo real (Inglés/Español) usando `ngx-translate` y `TranslateModule`.

- **Mapeo JSON**: Todos los textos estáticos se trasladaron a los diccionarios `public/i18n/en/shared.json` y `public/i18n/es/shared.json`.
- **Manejo Reactivo en Signals**: Para garantizar que el texto cambie inmediatamente en pantalla sin recargar, se evitó guardar traducciones procesadas por `TranslateService.instant()` en el estado. En su lugar, el HTML utiliza directamente el *pipe* `| translate`.
- **Patrón Fallback para variables**: Si un *Signal* computado puede carecer de datos (ej. no hay próximas citas), este devuelve `null`, delegando la traducción del estado vacío a la vista:
  ```html
  <h2>{{ nextAppointmentDate() ? nextAppointmentDate() : ('customer-dashboard.kpi.next_appointment.none' | translate) }}</h2>
  ```

## 3. Conexiones y Flujo de Datos

### Dashboard del Cliente (`CustomerDashboardComponent`)
Los datos se enlazan de forma reactiva al estado global de la aplicación utilizando `Signals` provistos por los *Stores* de la arquitectura.

- **IoT Store (`IotStore`)**: Proporciona el arreglo reactivo `vehicles()`. Se encarga de alimentar el contador total y rellenar la tabla principal ("Mis Vehículos").
- **Fleet Store (`FleetStore`)**: Expone las `appointments()` (citas) del usuario. Se computa para encontrar la "Próxima Cita" filtrando por estados `SCHEDULED` o `CONFIRMED`.

**Flujo de inicialización:**
```typescript
ngOnInit(): void {
  const customerId = localStorage.getItem('customerId');
  if (customerId) {
    this.iotStore.loadVehiclesByCustomerId(customerId);
    this.fleetStore.loadAppointmentsByCustomerId(customerId);
  }
}
```

### Dashboard del Administrador (`AdminDashboardComponent`)
El diseño y los gráficos del administrador (Staff/Owner) están listos, pero la capa de datos opera de manera estática (**mock data**) a la espera de integración.

Para finalizarlo, se deberán inyectar los siguientes Stores:
1. **`OperationsStore` (Órdenes de Trabajo)**: 
   - Proporcionará la lista para "Órdenes Recientes".
   - Computará el total de órdenes "En Progreso" o "Pendientes" para el KPI superior.
   - Alimentará la segmentación del gráfico de dona (Estado de Órdenes).
2. **`IamStore` (Identidad y Accesos)**: 
   - Devolverá el conteo de personal (mecánicos/staff) activos.
3. **`BillingStore` (Facturación)**: 
   - Suministrará los datos para agrupar ingresos financieros pasados mes a mes en el gráfico de barras.
   - Alimentará el KPI total de "Ingresos del mes actual".
