# Descripción Textual de los Diagramas de Clases (UML) - Web Service

A continuación, se detalla formalmente el modelo de clases para el Backend (Web Service) del sistema **Atelier**, dividiéndolo por **Bounded Contexts** de acuerdo al enfoque Domain-Driven Design (DDD). Para cada contexto se listan las clases, enumeraciones e interfaces con sus miembros (atributos y métodos), incluyendo el *scope* (visibilidad): `-` (Private), `+` (Public), `#` (Protected). Finalmente, se describen las relaciones con su dirección, calificación y multiplicidad bidireccional.

---

## 1. Bounded Context: Core (Identity and Multi-Tenancy)

### 1.1 Clases, Enumeraciones e Interfaces

*   **Clase Abstracta: `AuditableEntity`** `<<MappedSuperclass>>`
    *   *Nota: Todas las entidades principales y raíces de agregados (Workshop, User, Customer, Vehicle, WorkBay, Appointment, OBD2Device, VehicleDTCAlert, WorkOrder, Quote, Product, Voucher) heredan implícitamente de esta clase para dar soporte nativo a Auditoría, Soft Delete y Optimistic Locking.*
    *   **Atributos:**
        *   `- version: Long`
        *   `- createdAt: LocalDateTime`
        *   `- updatedAt: LocalDateTime`
        *   `- deletedAt: LocalDateTime`
        *   `- createdBy: UUID`
        *   `- updatedBy: UUID`
    *   **Métodos:**
        *   `+ isDeleted(): boolean`
        *   `+ delete(by: UUID): void`
*   **Enumeración: `SubscriptionPlan`**
    *   **Valores:** `LITE`, `PRO`, `MAX`
*   **Enumeración: `RoleName`**
    *   **Valores:** `ADMIN`, `MECHANIC`, `CUSTOMER`, `RECEPTIONIST`
*   **Enumeración: `Specialty`**
    *   **Valores:** `GENERAL_MECHANIC`, `AUTOMOTIVE_ELECTRONIC`, `BODY_AND_PAINT`, `DIAGNOSTICIAN`
*   **Clase: `WorkshopId`** `<<ValueObject>>`
    *   **Atributos:** `- id: UUID`
    *   **Métodos:** `+ generate(): WorkshopId`, `+ get(): UUID`
*   **Clase: `BranchId`** `<<ValueObject>>`
    *   **Atributos:** `- id: UUID`
    *   **Métodos:** `+ generate(): BranchId`, `+ get(): UUID`
*   **Clase: `Email`** `<<ValueObject>>`
    *   **Atributos:** `- address: String`
    *   **Métodos:** `+ of(email: String): Email`, `+ get(): String`
*   **Clase: `HashedPassword`** `<<ValueObject>>`
    *   **Atributos:** `- hash: String`
    *   **Métodos:** `+ encode(raw: String): HashedPassword`, `+ verify(raw: String): boolean`
*   **Clase: `Workshop`** `<<AggregateRoot>>`
    *   **Atributos:**
    *       `- workshopId: WorkshopId`
    *       `- taxId: String`
    *       `- businessName: String`
    *       `- subscriptionPlan: SubscriptionPlan`
    *       `- isActive: Boolean`
    *   **Métodos:**
    *       `+ register(taxId: String, name: String, plan: SubscriptionPlan): void`
    *       `+ updateSubscription(newPlan: SubscriptionPlan): void`
    *       `+ activate(): void`
    *       `+ deactivate(): void`
*   **Clase: `Branch`** `<<Entity>>`
    *   **Atributos:**
        *   `- branchId: BranchId`
        *   `- workshopId: WorkshopId`
        *   `- name: String`
        *   `- address: String`
        *   `- phone: String`
        *   `- isActive: Boolean`
    *   **Métodos:**
        *   `+ create(workshopId: WorkshopId, name: String, address: String): void`
        *   `+ updateDetails(name: String, address: String, phone: String): void`
        *   `+ activate(): void`
        *   `+ deactivate(): void`
*   **Interface: `IBranchRepository`**
    *   **Métodos:** `+ findById(id: BranchId): Optional<Branch>`, `+ findByWorkshopId(id: WorkshopId): List<Branch>`, `+ save(branch: Branch): void`
*   **Clase: `User`** `<<Entity>>`
    *   **Atributos:**
        *   `- userId: UUID`
        *   `- workshopId: WorkshopId`
        *   `- branchId: BranchId` *(Nullable: solo para personal de sede)*
        *   `- email: Email`
        *   `- password: HashedPassword`
        *   `- googleId: String`
        *   `- role: RoleName`
        *   `- specialty: Specialty`
    *   **Métodos:**
        *   `+ registerEmployee(email: Email, password: HashedPassword, role: RoleName, branchId: BranchId): void`
        *   `+ updateProfile(email: Email, specialty: Specialty): void`
        *   `+ transferToBranch(newBranchId: BranchId): void` *(Soporte Caso 3)*
        *   `+ verifyPassword(password: HashedPassword): boolean`
*   **Interface: `IUserRepository`**
    *   **Métodos:** `+ findByEmail(email: Email): Optional<User>`, `+ findByBranchId(id: BranchId): List<User>`, `+ save(user: User): void`
*   **Clase: `PasswordRecoveryToken`** `<<Entity>>`
    *   **Atributos:**
        *   `- tokenId: UUID`
        *   `- userId: UUID`
        *   `- token: String`
        *   `- expiresAt: LocalDateTime`
    *   **Métodos:** `+ isExpired(): boolean`
*   **Interface: `IPasswordRecoveryTokenRepository`**
    *   **Métodos:** `+ findByToken(token: String): Optional<PasswordRecoveryToken>`, `+ save(token: PasswordRecoveryToken): void`
*   **Clase: `SecurityManagerService`** `<<Service>>`
    *   **Atributos:** `- userRepo: IUserRepository`, `- tokenRepo: IPasswordRecoveryTokenRepository`
    *   **Métodos:** `+ authenticate(email: Email, rawPassword: String): User`, `+ requestPasswordReset(email: Email): void`, `+ resetPassword(token: String, newPassword: HashedPassword): void`
*   **Clase: `SessionAPIController`** `<<RestController>>`
    *   **Atributos:** `- authService: SecurityManagerService`
    *   **Métodos:** `+ login(request: LoginDTO): ResponseEntity<TokenDTO>`, `+ logout(): ResponseEntity<Void>`
*   **Interface: `IWorkshopRepository`**
    *   **Métodos:** `+ findById(id: WorkshopId): Optional<Workshop>`, `+ findByTaxId(taxId: String): Optional<Workshop>`, `+ save(workshop: Workshop): void`
*   **Clase: `WorkshopApplicationService`** `<<Service>>`
    *   **Atributos:** `- workshopRepo: IWorkshopRepository`
    *   **Métodos:** `+ registerWorkshop(taxId: String, businessName: String, plan: SubscriptionPlan): Workshop`
*   **Clase: `WorkshopAPIController`** `<<RestController>>`
    *   **Atributos:** `- workshopService: WorkshopApplicationService`
    *   **Métodos:** `+ registerWorkshop(req: RegisterWorkshopDTO): ResponseEntity<WorkshopDTO>`
*   **Clase: `UserApplicationService`** `<<Service>>`
    *   **Atributos:** `- userRepo: IUserRepository`
    *   **Métodos:** `+ registerEmployee(workshopId: WorkshopId, email: Email, password: HashedPassword, role: RoleName, branchId: BranchId): User`, `+ transferEmployee(userId: UUID, targetBranchId: BranchId): void`, `+ updateProfile(userId: UUID, email: Email): void`
*   **Clase: `UserAPIController`** `<<RestController>>`
    *   **Atributos:** `- userService: UserApplicationService`
    *   **Métodos:** `+ registerEmployee(req: RegisterEmployeeDTO): ResponseEntity<UserDTO>`, `+ updateProfile(id: UUID, req: UpdateProfileDTO): ResponseEntity<UserDTO>`, `+ deleteEmployee(id: UUID): ResponseEntity<Void>`

### 1.2 Relaciones

1.  **De `Workshop` a `SubscriptionPlan`**
    *   **Tipo:** Composición
    *   **Dirección:** De Workshop hacia SubscriptionPlan
    *   **Calificación:** "has subscription plan"
    *   **Multiplicidad:** 1 (Workshop) a 1 (SubscriptionPlan)
2.  **De `Workshop` a `WorkshopId`**
    *   **Tipo:** Composición
    *   **Dirección:** De Workshop hacia WorkshopId
    *   **Calificación:** "identified by"
    *   **Multiplicidad:** 1 (Workshop) a 1 (WorkshopId)
3.  **De `User` a `Email`**
    *   **Tipo:** Composición
    *   **Dirección:** De User hacia Email
    *   **Calificación:** "has email"
    *   **Multiplicidad:** 1 (User) a 1 (Email)
4.  **De `User` a `HashedPassword`**
    *   **Tipo:** Composición
    *   **Dirección:** De User hacia HashedPassword
    *   **Calificación:** "has secure password"
    *   **Multiplicidad:** 1 (User) a 1 (HashedPassword)
5.  **De `User` a `RoleName`**
    *   **Tipo:** Composición
    *   **Dirección:** De User hacia RoleName
    *   **Calificación:** "has role"
    *   **Multiplicidad:** 1 (User) a 1 (RoleName)
6.  **De `User` a `WorkshopId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De User hacia WorkshopId
    *   **Calificación:** "belongs to workshop"
    *   **Multiplicidad:** Muchos (*) (User) a 1 (WorkshopId)
7.  **De `SecurityManagerService` a `IUserRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De SecurityManagerService hacia IUserRepository
    *   **Calificación:** "uses user repository"
    *   **Multiplicidad:** 1 (SecurityManagerService) a 1 (IUserRepository)
8.  **De `SessionAPIController` a `SecurityManagerService`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De SessionAPIController hacia SecurityManagerService
    *   **Calificación:** "delegates business logic to"
    *   **Multiplicidad:** 1 (SessionAPIController) a 1 (SecurityManagerService)
9.  **De `PasswordRecoveryToken` a `User`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De PasswordRecoveryToken hacia User
    *   **Calificación:** "associated with"
    *   **Multiplicidad:** Muchos (*) (PasswordRecoveryToken) a 1 (User)
10. **De `SecurityManagerService` a `IPasswordRecoveryTokenRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De SecurityManagerService hacia IPasswordRecoveryTokenRepository
    *   **Calificación:** "uses token repository"
    *   **Multiplicidad:** 1 (SecurityManagerService) a 1 (IPasswordRecoveryTokenRepository)
11. **De `WorkshopApplicationService` a `IWorkshopRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De WorkshopApplicationService hacia IWorkshopRepository
    *   **Calificación:** "uses workshop repository"
    *   **Multiplicidad:** 1 (WorkshopApplicationService) a 1 (IWorkshopRepository)
12. **De `WorkshopAPIController` a `WorkshopApplicationService`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De WorkshopAPIController hacia WorkshopApplicationService
    *   **Calificación:** "delegates registration to"
    *   **Multiplicidad:** 1 (WorkshopAPIController) a 1 (WorkshopApplicationService)
13. **De `UserApplicationService` a `IUserRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De UserApplicationService hacia IUserRepository
    *   **Calificación:** "uses user repository"
    *   **Multiplicidad:** 1 (UserApplicationService) a 1 (IUserRepository)
14. **De `UserAPIController` a `UserApplicationService`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De UserAPIController hacia UserApplicationService
    *   **Calificación:** "delegates operations to"
    *   **Multiplicidad:** 1 (UserAPIController) a 1 (UserApplicationService)
15. **De `User` a `BranchId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De User hacia BranchId
    *   **Calificación:** "assigned to physical branch"
    *   **Multiplicidad:** Muchos (*) (User) a 0..1 (BranchId)
16. **De `Branch` a `BranchId`**
    *   **Tipo:** Composición
    *   **Dirección:** De Branch hacia BranchId
    *   **Calificación:** "identified by"
    *   **Multiplicidad:** 1 (Branch) a 1 (BranchId)
17. **De `Branch` a `WorkshopId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De Branch hacia WorkshopId
    *   **Calificación:** "belongs to company tenant"
    *   **Multiplicidad:** Muchos (*) (Branch) a 1 (WorkshopId)
18. **De `UserApplicationService` a `IBranchRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De UserApplicationService hacia IBranchRepository
    *   **Calificación:** "validates branches using"
    *   **Multiplicidad:** 1 (UserApplicationService) a 1 (IBranchRepository)

---

## 2. Bounded Context: IoT (Hardware y Telemetría)

### 2.1 Clases, Enumeraciones e Interfaces

*   **Enumeración: `DeviceStatus`**
    *   **Valores:** `ACTIVE`, `INACTIVE`
*   **Enumeración: `Severity`**
    *   **Valores:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
*   **Clase: `MacAddress`** `<<ValueObject>>`
    *   **Atributos:** `- address: String`
    *   **Métodos:** `+ of(rawAddress: String): MacAddress`, `+ get(): String`, `+ isValid(): boolean`
*   **Clase: `OBD2Device`** `<<Entity>>`
    *   **Atributos:** `- deviceId: UUID`, `- mac: MacAddress`, `- vehicleId: UUID`, `- lastPing: LocalDateTime`, `- status: DeviceStatus`
    *   **Métodos:** `+ assignToVehicle(vehicleId: UUID): void`, `+ deactivate(): void`
*   **Clase: `DTCCode`** `<<ValueObject>>`
    *   **Atributos:** `- code: String`, `- description: String`, `- severity: Severity`
*   **Clase: `VehicleDTCAlert`** `<<AggregateRoot>>`
    *   **Atributos:** `- alertId: UUID`, `- vehicleId: UUID`, `- dtcCode: DTCCode`, `- isActive: Boolean`
    *   **Métodos:** `+ resolve(): void`
*   **Clase: `TelemetrySnapshot`** `<<DataStructure>>`
    *   **Atributos:** 
        *   `- deviceId: UUID`
        *   `- timestamp: LocalDateTime`
        *   `- rpm: Integer`
        *   `- temp: Double`
    *   **Métodos:**
        *   `{static} + create(deviceId: UUID, rpm: Integer, temp: Double): TelemetrySnapshot`
        *   `+ getDeviceId(): UUID`
        *   `+ getRpm(): Integer`
        *   `+ getTemp(): Double`
*   **Interface: `IDeviceRepository`**
    *   **Métodos:** `+ findByMac(mac: MacAddress): Optional<OBD2Device>`, `+ save(device: OBD2Device): void`
*   **Interface: `ITelemetryIngestionPort`**
    *   **Métodos:** `+ bulkInsert(snapshots: List<TelemetrySnapshot>): void`, `+ findLatestByDeviceId(deviceId: UUID): Optional<TelemetrySnapshot>`, `+ findByDeviceIdAndDateRange(deviceId: UUID, start: LocalDateTime, end: LocalDateTime): List<TelemetrySnapshot>`
*   **Interface: `IVehicleDTCAlertRepository`**
    *   **Métodos:** `+ save(alert: VehicleDTCAlert): void`, `+ findActiveByVehicleId(vehicleId: UUID): List<VehicleDTCAlert>`, `+ findAllActive(): List<VehicleDTCAlert>`
*   **Clase: `OBD2EngineService`** `<<Service>>`
    *   **Atributos:** `- deviceRepo: IDeviceRepository`, `- ingestionPort: ITelemetryIngestionPort`, `- alertRepo: IVehicleDTCAlertRepository`, `- jdbcTemplateHandler: JdbcTemplateHandler`
    *   **Métodos:** `+ processBatch(batch: List<TelemetrySnapshot>): void`, `+ linkDeviceToVehicle(mac: MacAddress, vehicleId: UUID): void`, `+ unlinkDevice(mac: MacAddress): void`, `+ getLatestTelemetry(deviceId: UUID): TelemetrySnapshot`, `+ getTelemetryHistory(deviceId: UUID, start: LocalDateTime, end: LocalDateTime): List<TelemetrySnapshot>`, `+ getActiveAlerts(): List<VehicleDTCAlert>`
*   **Clase: `TelemetryAPIController`** `<<RestController>>`
    *   **Atributos:** `- obd2Service: OBD2EngineService`
    *   **Métodos:** `+ receiveTelemetry(payload: List<TelemetrySnapshotDTO>): ResponseEntity<Void>`, `+ linkDevice(vehicleId: UUID, req: LinkDeviceDTO): ResponseEntity<Void>`, `+ unlinkDevice(vehicleId: UUID): ResponseEntity<Void>`, `+ getTelemetry(vehicleId: UUID): ResponseEntity<VehicleTelemetryDTO>`
*   **Clase: `JdbcTemplateHandler`** `<<Component>>`
    *   **Atributos:** `- jdbcTemplate: JdbcTemplate`
    *   **Métodos:** `+ bulkInsertSnapshots(snapshots: List<TelemetrySnapshot>): void`, `+ callStoredProcedure(procName: String, params: Map<String, Object>): Map<String, Object>`

### 2.2 Relaciones

1.  **De `OBD2Device` a `MacAddress`**
    *   **Tipo:** Composición
    *   **Dirección:** De OBD2Device hacia MacAddress
    *   **Calificación:** "has MAC address"
    *   **Multiplicidad:** 1 (OBD2Device) a 1 (MacAddress)
2.  **De `OBD2Device` a `DeviceStatus`**
    *   **Tipo:** Composición
    *   **Dirección:** De OBD2Device hacia DeviceStatus
    *   **Calificación:** "has status"
    *   **Multiplicidad:** 1 (OBD2Device) a 1 (DeviceStatus)
3.  **De `VehicleDTCAlert` a `DTCCode`**
    *   **Tipo:** Composición
    *   **Dirección:** De VehicleDTCAlert hacia DTCCode
    *   **Calificación:** "contains DTC code"
    *   **Multiplicidad:** Muchos (*) (VehicleDTCAlert) a 1 (DTCCode)
4.  **De `DTCCode` a `Severity`**
    *   **Tipo:** Composición
    *   **Dirección:** De DTCCode hacia Severity
    *   **Calificación:** "has severity level"
    *   **Multiplicidad:** 1 (DTCCode) a 1 (Severity)
5.  **De `OBD2EngineService` a `IDeviceRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De OBD2EngineService hacia IDeviceRepository
    *   **Calificación:** "uses repository"
    *   **Multiplicidad:** 1 (OBD2EngineService) a 1 (IDeviceRepository)
6.  **De `OBD2EngineService` a `ITelemetryIngestionPort`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De OBD2EngineService hacia ITelemetryIngestionPort
    *   **Calificación:** "uses ingestion port"
    *   **Multiplicidad:** 1 (OBD2EngineService) a 1 (ITelemetryIngestionPort)
7.  **De `TelemetryAPIController` a `OBD2EngineService`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De TelemetryAPIController hacia OBD2EngineService
    *   **Calificación:** "delegates processing to"
    *   **Multiplicidad:** 1 (TelemetryAPIController) a 1 (OBD2EngineService)
8.  **De `OBD2EngineService` a `TelemetrySnapshot`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De OBD2EngineService hacia TelemetrySnapshot
    *   **Calificación:** "processes batch of"
    *   **Multiplicidad:** 1 (OBD2EngineService) a Muchos (*) (TelemetrySnapshot)
9.  **De `ITelemetryIngestionPort` a `TelemetrySnapshot`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De ITelemetryIngestionPort hacia TelemetrySnapshot
    *   **Calificación:** "ingests records of"
    *   **Multiplicidad:** 1 (ITelemetryIngestionPort) a Muchos (*) (TelemetrySnapshot)
10. **De `OBD2EngineService` a `IVehicleDTCAlertRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De OBD2EngineService hacia IVehicleDTCAlertRepository
    *   **Calificación:** "uses alerts repository"
    *   **Multiplicidad:** 1 (OBD2EngineService) a 1 (IVehicleDTCAlertRepository)
11. **De `OBD2EngineService` a `JdbcTemplateHandler`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De OBD2EngineService hacia JdbcTemplateHandler
    *   **Calificación:** "delegates bulk inserts/procedures to"
    *   **Multiplicidad:** 1 (OBD2EngineService) a 1 (JdbcTemplateHandler)

---

## 3. Bounded Context: Operations (Work Orders)

### 3.1 Clases, Enumeraciones e Interfaces

*   **Enumeración: `WorkOrderStatus`**
    *   **Valores:** `DRAFT`, `DIAGNOSING`, `IN_PROGRESS`, `COMPLETED`, `INVOICED`
*   **Enumeración: `TaskStatus`**
    *   **Valores:** `PENDING`, `DOING`, `DONE`
*   **Clase: `InternalNumber`** `<<ValueObject>>`
    *   **Atributos:** `- number: Integer`
    *   **Métodos:** `+ of(num: Integer): InternalNumber`
*   **Clase: `WorkOrderTask`** `<<Entity>>`
    *   **Atributos:** `- taskId: UUID`, `- description: String`, `- estimatedHours: BigDecimal`, `- status: TaskStatus`
    *   **Métodos:** `+ startTask(): void`, `+ completeTask(realHours: BigDecimal): void`
*   **Clase: `WorkOrder`** `<<AggregateRoot>>`
    *   **Atributos:** `- workOrderId: UUID`, `- workshopId: WorkshopId`, `- branchId: BranchId`, `- internalNumber: InternalNumber`, `- customerId: UUID`, `- billingCustomerId: UUID` *(Nullable, Caso Especial F)*, `- vehicleId: UUID`, `- assignedMechanicId: UUID`, `- driverName: String`, `- driverPhone: String`, `- diagnosis: String`, `- status: WorkOrderStatus`, `- tasks: List<WorkOrderTask>`
    *   **Métodos:** `+ createDraft(branchId: BranchId, customerId: UUID, vehicleId: UUID, assignedMechanicId: UUID): WorkOrder`, `+ setBillingCustomer(billingCustomerId: UUID): void`, `+ addDriverDetails(name: String, phone: String): void`, `+ advanceStatus(newStatus: WorkOrderStatus): void`, `+ addTask(desc: String, estHours: Integer): void`, `+ assignMechanic(assignedMechanicId: UUID): void`, `+ addDiagnosis(diagnosis: String): void`
*   **Interface: `IWorkOrderRepository`**
    *   **Métodos:** `+ findById(id: UUID): Optional<WorkOrder>`, `+ findByBranchId(branchId: BranchId): List<WorkOrder>`, `+ findByVehicleId(vehicleId: UUID): List<WorkOrder>`, `+ save(workOrder: WorkOrder): void`
*   **Clase: `WorkOrderApplicationService`** `<<Service>>`
    *   **Atributos:** `- otRepo: IWorkOrderRepository`
    *   **Métodos:** `+ createNewDraft(branchId: BranchId, customerId: UUID, vehicleId: UUID, assignedMechanicId: UUID, driverName: String, driverPhone: String, billingCustomerId: UUID): WorkOrder`, `+ changeStatus(otId: UUID, status: WorkOrderStatus): void`, `+ assignMechanic(otId: UUID, assignedMechanicId: UUID): void`, `+ addDiagnosis(otId: UUID, diagnosis: String): void`, `+ getVehicleHistory(vehicleId: UUID): List<WorkOrder>`
*   **Clase: `WorkOrderAPIController`** `<<RestController>>`
    *   **Atributos:** `- otService: WorkOrderApplicationService`, `- quoteService: QuoteApplicationService`
    *   **Métodos:** `+ createWorkOrder(req: CreateWODTO): ResponseEntity<WorkOrderDTO>`, `+ getWorkOrders(vehicleId: UUID, branchId: UUID): ResponseEntity<List<WorkOrderDTO>>`, `+ updateWorkOrder(id: UUID, req: UpdateWODTO): ResponseEntity<WorkOrderDTO>`, `+ generateQuote(id: UUID, req: CreateQuoteDTO): ResponseEntity<QuoteDTO>`, `+ exportQuote(id: UUID): ResponseEntity<byte[]>`
*   **Clase: `Quote`** `<<AggregateRoot>>`
    *   **Atributos:**
        *   `- quoteId: UUID`
        *   `- workshopId: WorkshopId`
        *   `- customerId: UUID`
        *   `- vehicleId: UUID`
        *   `- description: String`
        *   `- subtotal: Money`
        *   `- tax: TaxRate`
        *   `- total: Money`
    *   **Métodos:** `+ createQuote(subtotal: Money, tax: TaxRate): Quote`
*   **Interface: `IQuoteRepository`**
    *   **Métodos:** `+ findById(id: UUID): Optional<Quote>`, `+ save(quote: Quote): void`
*   **Clase: `QuoteApplicationService`** `<<Service>>`
    *   **Atributos:** `- quoteRepo: IQuoteRepository`
    *   **Métodos:** `+ createNewQuote(customerId: UUID, vehicleId: UUID, description: String, subtotal: Money, tax: TaxRate): Quote`, `+ exportQuote(quoteId: UUID): byte[]`


### 3.2 Relaciones

1.  **De `WorkOrder` a `WorkOrderTask`**
    *   **Tipo:** Composición (Relación Padre-Hijo en el Agregado)
    *   **Dirección:** De WorkOrder hacia WorkOrderTask
    *   **Calificación:** "contains task list"
    *   **Multiplicidad:** 1 (WorkOrder) a Muchos (*) (WorkOrderTask)
2.  **De `WorkOrder` a `WorkOrderStatus`**
    *   **Tipo:** Composición
    *   **Dirección:** De WorkOrder hacia WorkOrderStatus
    *   **Calificación:** "has current status"
    *   **Multiplicidad:** 1 (WorkOrder) a 1 (WorkOrderStatus)
3.  **De `WorkOrder` a `InternalNumber`**
    *   **Tipo:** Composición
    *   **Dirección:** De WorkOrder hacia InternalNumber
    *   **Calificación:** "internally identified by"
    *   **Multiplicidad:** 1 (WorkOrder) a 1 (InternalNumber)
4.  **De `WorkOrder` a `WorkshopId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De WorkOrder hacia WorkshopId
    *   **Calificación:** "belongs to workshop (tenant)"
    *   **Multiplicidad:** Muchos (*) (WorkOrder) a 1 (WorkshopId)
5.  **De `WorkOrder` a `Vehicle`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De WorkOrder hacia Vehicle
    *   **Calificación:** "associated with vehicle"
    *   **Multiplicidad:** Muchos (*) (WorkOrder) a 1 (Vehicle)
6.  **De `WorkOrder` a `User`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De WorkOrder hacia User
    *   **Calificación:** "assigned to mechanic"
    *   **Multiplicidad:** Muchos (*) (WorkOrder) a 1 (User)
7.  **De `WorkOrder` a `BranchId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De WorkOrder hacia BranchId
    *   **Calificación:** "registered at physical branch"
    *   **Multiplicidad:** Muchos (*) (WorkOrder) a 1 (BranchId)
8.  **De `WorkOrder` a `Customer` (Dueño)**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De WorkOrder hacia Customer
    *   **Calificación:** "authorized by owner"
    *   **Multiplicidad:** Muchos (*) (WorkOrder) a 1 (Customer)
9.  **De `WorkOrder` a `Customer` (Tercero Pagador)**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De WorkOrder hacia Customer
    *   **Calificación:** "billed to third-party payer (Caso Especial F)"
    *   **Multiplicidad:** Muchos (*) (WorkOrder) a 0..1 (Customer)
10. **De `WorkOrderTask` a `TaskStatus`**
    *   **Tipo:** Composición
    *   **Dirección:** De WorkOrderTask hacia TaskStatus
    *   **Calificación:** "has execution status"
    *   **Multiplicidad:** 1 (WorkOrderTask) a 1 (TaskStatus)
11. **De `WorkOrderApplicationService` a `IWorkOrderRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De WorkOrderApplicationService hacia IWorkOrderRepository
    *   **Calificación:** "uses repository to persist"
    *   **Multiplicidad:** 1 (WorkOrderApplicationService) a 1 (IWorkOrderRepository)
12. **De `WorkOrderAPIController` a `WorkOrderApplicationService`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De WorkOrderAPIController hacia WorkOrderApplicationService
    *   **Calificación:** "invokes use case in"
    *   **Multiplicidad:** 1 (WorkOrderAPIController) a 1 (WorkOrderApplicationService)
13. **De `Quote` a `WorkshopId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De Quote hacia WorkshopId
    *   **Calificación:** "belongs to workshop"
    *   **Multiplicidad:** Muchos (*) (Quote) a 1 (WorkshopId)
14. **De `Quote` a `Money`**
    *   **Tipo:** Composición
    *   **Dirección:** De Quote hacia Money
    *   **Calificación:** "composed of monetary amounts"
    *   **Multiplicidad:** 1 (Quote) a 1 (Money)
15. **De `Quote` a `TaxRate`**
    *   **Tipo:** Composición
    *   **Dirección:** De Quote hacia TaxRate
    *   **Calificación:** "applies tax rate"
    *   **Multiplicidad:** 1 (Quote) a 1 (TaxRate)
16. **De `QuoteApplicationService` a `IQuoteRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De QuoteApplicationService hacia IQuoteRepository
    *   **Calificación:** "uses repository to persist"
    *   **Multiplicidad:** 1 (QuoteApplicationService) a 1 (IQuoteRepository)
17. **De `WorkOrderAPIController` a `QuoteApplicationService`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De WorkOrderAPIController hacia QuoteApplicationService
    *   **Calificación:** "invokes use case in"
    *   **Multiplicidad:** 1 (WorkOrderAPIController) a 1 (QuoteApplicationService)

---

## 4. Bounded Context: Fleet (Fleet Management)

### 4.1 Clases, Enumeraciones e Interfaces

*   **Enumeración: `DocumentType`**
    *   **Valores:** `DNI`, `RUC`, `CE`, `PASSPORT`
*   **Clase: `LicensePlate`** `<<ValueObject>>`
    *   **Atributos:** `- plate: String`
    *   **Métodos:** `+ of(plate: String): LicensePlate`
*   **Clase: `DocumentNumber`** `<<ValueObject>>`
    *   **Atributos:** `- number: String`, `- type: DocumentType`
    *   **Métodos:** `+ of(num: String, type: DocumentType): DocumentNumber`, `+ get(): String`
*   **Enumeración: `VehicleUsageType`**
    *   **Valores:** `PARTICULAR`, `TAXI_UBER`, `HEAVY_DUTY`
*   **Enumeración: `AssociationType`**
    *   **Valores:** `OWNER`, `AUTHORIZED_DRIVER`, `FAMILY_MEMBER`
*   **Clase: `CustomerVehicle`** `<<Entity>>`
    *   **Atributos:** `- customerId: UUID`, `- vehicleId: UUID`, `- associationType: AssociationType`
*   **Clase: `Vehicle`** `<<Entity>>`
    *   **Atributos:** `- vehicleId: UUID`, `- workshopId: WorkshopId`, `- customerId: UUID` *(Nullable, primary owner)*, `- plateNumber: LicensePlate`, `- brand: String`, `- model: String`, `- year: Integer`, `- vin: String`, `- currentMileage: Integer`, `- usageType: VehicleUsageType`
    *   **Métodos:** `+ updateMileage(newMileage: Integer): void`, `+ updateUsageType(type: VehicleUsageType): void`
*   **Clase: `Customer`** `<<AggregateRoot>>`
    *   **Atributos:** `- customerId: UUID`, `- workshopId: WorkshopId`, `- document: DocumentNumber`, `- fullName: String`, `- email: Email`, `- phone: String`
    *   **Métodos:** `+ register(document: DocumentNumber, fullName: String, email: Email, phone: String): Customer`
*   **Interface: `IFleetRepository`**
    *   **Métodos:** `+ findByPlate(plate: LicensePlate): Optional<Vehicle>`, `+ save(customer: Customer): void`, `+ saveAssociation(association: CustomerVehicle): void`
*   **Enumeración: `AppointmentStatus`**
    *   **Valores:** `SCHEDULED`, `COMPLETED`, `CANCELLED`
*   **Clase: `Appointment`** `<<AggregateRoot>>`
    *   **Atributos:**
        *   `- appointmentId: UUID`
        *   `- workshopId: WorkshopId`
        *   `- branchId: BranchId`
        *   `- customerId: UUID` *(Nullable for Hybrid Pre-Registration)*
        *   `- vehicleId: UUID` *(Nullable for Hybrid Pre-Registration)*
        *   `- appointmentDate: LocalDateTime`
        *   `- status: AppointmentStatus`
        *   `- preRegisteredFullName: String` *(Nullable, used in hybrid flow)*
        *   `- preRegisteredEmail: Email` *(Nullable, used in hybrid flow)*
        *   `- preRegisteredPhone: String` *(Nullable, used in hybrid flow)*
        *   `- preRegisteredVehiclePlate: LicensePlate` *(Nullable, used in hybrid flow)*
    *   **Métodos:** 
        *   `+ schedule(branchId: BranchId, customerId: UUID, vehicleId: UUID, date: LocalDateTime): void`
        *   `+ preRegister(branchId: BranchId, name: String, email: Email, phone: String, plate: LicensePlate, date: LocalDateTime): void` *(Cita híbrida)*
        *   `+ promoteToCustomer(customerId: UUID, vehicleId: UUID): void` *(Convierte pre-registro en cita real)*
        *   `+ reschedule(newDate: LocalDateTime): void`
        *   `+ cancel(): void`
        *   `+ complete(): void`
*   **Interface: `IAppointmentRepository`**
    *   **Métodos:** `+ findById(id: UUID): Optional<Appointment>`, `+ findByBranchId(id: BranchId): List<Appointment>`, `+ save(appointment: Appointment): void`
*   **Enumeración: `BayStatus`**
    *   **Valores:** `VACANT`, `OCCUPIED`
*   **Clase: `WorkBay`** `<<Entity>>`
    *   **Atributos:**
        *   `- bayId: UUID`
        *   `- workshopId: WorkshopId`
        *   `- branchId: BranchId`
        *   `- name: String`
        *   `- status: BayStatus`
        *   `- vehicleId: UUID`
    *   **Métodos:** `+ occupy(vehicleId: UUID): void`, `+ vacate(): void`
*   **Interface: `IWorkBayRepository`**
    *   **Métodos:** `+ findById(id: UUID): Optional<WorkBay>`, `+ findByBranchId(id: BranchId): List<WorkBay>`, `+ save(bay: WorkBay): void`
*   **Clase: `FleetManagementService`** `<<Service>>`
    *   **Atributos:** `- fleetRepo: IFleetRepository`, `- appointmentRepo: IAppointmentRepository`, `- bayRepo: IWorkBayRepository`
    *   **Métodos:**
        *   `+ registerNewCustomer(cmd: RegisterCustomerCommand): Customer`
        *   `+ scheduleAppointment(branchId: BranchId, customerId: UUID, vehicleId: UUID, date: LocalDateTime): Appointment`
        *   `+ preRegisterHybridAppointment(branchId: BranchId, name: String, email: Email, phone: String, plate: LicensePlate, date: LocalDateTime): Appointment`
        *   `+ promotePreRegistration(appointmentId: UUID, customerId: UUID, vehicleId: UUID): void`
        *   `+ rescheduleAppointment(appointmentId: UUID, newDate: LocalDateTime): void`
        *   `+ assignVehicleToBay(bayId: UUID, vehicleId: UUID): void`
*   **Clase: `AppointmentAPIController`** `<<RestController>>`
    *   **Atributos:** `- fleetService: FleetManagementService`
    *   **Métodos:**
        *   `+ createAppointment(req: CreateAppointmentDTO): ResponseEntity<AppointmentDTO>`
        *   `+ getAppointments(status: AppointmentStatus, branchId: UUID): ResponseEntity<List<AppointmentDTO>>`
        *   `+ updateAppointment(id: UUID, req: UpdateAppointmentDTO): ResponseEntity<AppointmentDTO>`
*   **Clase: `CustomerAPIController`** `<<RestController>>`
    *   **Atributos:** `- fleetService: FleetManagementService`
    *   **Métodos:**
        *   `+ createCustomer(req: CustomerDTO): ResponseEntity<CustomerDTO>`
*   **Clase: `WorkBayAPIController`** `<<RestController>>`
    *   **Atributos:** `- fleetService: FleetManagementService`
    *   **Métodos:**
        *   `+ updateBay(id: UUID, req: UpdateBayDTO): ResponseEntity<Void>`

### 4.2 Relaciones

1.  **De `Customer` a `DocumentNumber`**
    *   **Tipo:** Composición
    *   **Dirección:** De Customer hacia DocumentNumber
    *   **Calificación:** "legally identified by"
    *   **Multiplicidad:** 1 (Customer) a 1 (DocumentNumber)
2.  **De `DocumentNumber` a `DocumentType`**
    *   **Tipo:** Composición
    *   **Dirección:** De DocumentNumber hacia DocumentType
    *   **Calificación:** "is of type"
    *   **Multiplicidad:** 1 (DocumentNumber) a 1 (DocumentType)
3.  **De `Vehicle` a `LicensePlate`**
    *   **Tipo:** Composición
    *   **Dirección:** De Vehicle hacia LicensePlate
    *   **Calificación:** "carries license plate"
    *   **Multiplicidad:** 1 (Vehicle) a 1 (LicensePlate)
4.  **De `FleetManagementService` a `IFleetRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De FleetManagementService hacia IFleetRepository
    *   **Calificación:** "uses fleet repository"
    *   **Multiplicidad:** 1 (FleetManagementService) a 1 (IFleetRepository)
5.  **De los Controladores (`AppointmentAPIController`, `CustomerAPIController`, `WorkBayAPIController`) a `FleetManagementService`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De los controladores hacia FleetManagementService
    *   **Calificación:** "delegates operations to"
    *   **Multiplicidad:** 1 a 1
6.  **De `Appointment` a `AppointmentStatus`**
    *   **Tipo:** Composición
    *   **Dirección:** De Appointment hacia AppointmentStatus
    *   **Calificación:** "has status"
    *   **Multiplicidad:** 1 (Appointment) a 1 (AppointmentStatus)
7.  **De `Appointment` a `WorkshopId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De Appointment hacia WorkshopId
    *   **Calificación:** "belongs to workshop"
    *   **Multiplicidad:** Muchos (*) (Appointment) a 1 (WorkshopId)
8.  **De `WorkBay` a `BayStatus`**
    *   **Tipo:** Composición
    *   **Dirección:** De WorkBay hacia BayStatus
    *   **Calificación:** "has status"
    *   **Multiplicidad:** 1 (WorkBay) a 1 (BayStatus)
9.  **De `WorkBay` a `WorkshopId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De WorkBay hacia WorkshopId
    *   **Calificación:** "belongs to workshop"
    *   **Multiplicidad:** Muchos (*) (WorkBay) a 1 (WorkshopId)
10. **De `FleetManagementService` a `IAppointmentRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De FleetManagementService hacia IAppointmentRepository
    *   **Calificación:** "uses appointments repository"
    *   **Multiplicidad:** 1 (FleetManagementService) a 1 (IAppointmentRepository)
11. **De `FleetManagementService` a `IWorkBayRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De FleetManagementService hacia IWorkBayRepository
    *   **Calificación:** "uses bays repository"
    *   **Multiplicidad:** 1 (FleetManagementService) a 1 (IWorkBayRepository)
12. **De `Vehicle` a `Customer`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De Vehicle hacia Customer
    *   **Calificación:** "belongs to"
    *   **Multiplicidad:** Muchos (*) (Vehicle) a 1 (Customer)
13. **De `Customer` a `WorkshopId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De Customer hacia WorkshopId
    *   **Calificación:** "belongs to workshop (tenant)"
    *   **Multiplicidad:** Muchos (*) (Customer) a 1 (WorkshopId)
14. **De `Vehicle` a `VehicleUsageType`**
    *   **Tipo:** Composición
    *   **Dirección:** De Vehicle hacia VehicleUsageType
    *   **Calificación:** "characterized by usage"
    *   **Multiplicidad:** 1 (Vehicle) a 1 (VehicleUsageType)
15. **De `Vehicle` a `WorkshopId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De Vehicle hacia WorkshopId
    *   **Calificación:** "isolated by company tenant"
    *   **Multiplicidad:** Muchos (*) (Vehicle) a 1 (WorkshopId)
16. **De `Appointment` a `BranchId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De Appointment hacia BranchId
    *   **Calificación:** "scheduled at branch"
    *   **Multiplicidad:** Muchos (*) (Appointment) a 1 (BranchId)
17. **De `WorkBay` a `BranchId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De WorkBay hacia BranchId
    *   **Calificación:** "physically located in branch"
    *   **Multiplicidad:** Muchos (*) (WorkBay) a 1 (BranchId)
18. **De `CustomerVehicle` a `Customer`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De CustomerVehicle hacia Customer
    *   **Calificación:** "references customer"
    *   **Multiplicidad:** Muchos (*) (CustomerVehicle) a 1 (Customer)
19. **De `CustomerVehicle` a `Vehicle`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De CustomerVehicle hacia Vehicle
    *   **Calificación:** "references vehicle"
    *   **Multiplicidad:** Muchos (*) (CustomerVehicle) a 1 (Vehicle)
20. **De `CustomerVehicle` a `AssociationType`**
    *   **Tipo:** Composición
    *   **Dirección:** De CustomerVehicle hacia AssociationType
    *   **Calificación:** "has association type"
    *   **Multiplicidad:** 1 (CustomerVehicle) a 1 (AssociationType)

---

## 5. Bounded Context: Inventory (Warehouse)

### 5.1 Clases, Enumeraciones e Interfaces

*   **Enumeración: `MovementType`**
    *   **Valores:** `INBOUND`, `OUTBOUND`, `ADJUSTMENT`
*   **Clase: `StockQuantity`** `<<ValueObject>>`
    *   **Atributos:** `- quantity: Integer`
    *   **Métodos:** `+ of(qty: Integer): StockQuantity`, `+ subtract(other: StockQuantity): StockQuantity`, `+ add(other: StockQuantity): StockQuantity`
*   **Clase: `Product`** `<<AggregateRoot>>`
    *   **Atributos:** `- productId: UUID`, `- workshopId: WorkshopId`, `- sku: String`, `- name: String`, `- category: String`, `- description: String`, `- currentStock: StockQuantity`, `- minimumStock: StockQuantity`
    *   **Métodos:** `+ create(sku: String, name: String, category: String, description: String, minStock: StockQuantity): Product`, `+ registerMovement(type: MovementType, quantity: Integer): void`, `+ isStockBelowMinimum(): boolean`
*   **Clase: `InventoryMovement`** `<<Entity>>`
    *   **Atributos:**
        *   `- movementId: Long`
        *   `- productId: UUID`
        *   `- type: MovementType`
        *   `- quantity: Integer`
        *   `- createdAt: LocalDateTime`
        *   `- createdBy: UUID`
    *   **Métodos:** `+ create(productId: UUID, type: MovementType, quantity: Integer, userId: UUID): InventoryMovement`
*   **Interface: `IInventoryRepository`**
    *   **Métodos:** `+ findBySku(sku: String): Optional<Product>`, `+ findByCategory(category: String): List<Product>`, `+ searchByName(query: String): List<Product>`, `+ save(product: Product): void`
*   **Clase: `InventoryManagerService`** `<<Service>>`
    *   **Atributos:** `- inventoryRepo: IInventoryRepository`
    *   **Métodos:** `+ registerProduct(sku: String, name: String, category: String, description: String, minStock: Integer): Product`, `+ adjustStock(sku: String, qty: Integer, type: MovementType): void COMMENT 'Invoca directamente SP_REGISTRAR_MOVIMIENTO_STOCK para control de concurrencia ACID'`
*   **Clase: `ProductAPIController`** `<<RestController>>`
    *   **Atributos:** `- inventoryService: InventoryManagerService`
    *   **Métodos:** `+ createProduct(req: CreateProductDTO): ResponseEntity<ProductDTO>`, `+ getProducts(category: String, query: String): ResponseEntity<List<ProductDTO>>`, `+ createMovement(id: UUID, req: CreateMovementDTO): ResponseEntity<Void>`, `+ deleteProduct(id: UUID): ResponseEntity<Void>`

### 5.2 Relaciones

1.  **De `Product` a `StockQuantity`**
    *   **Tipo:** Composición
    *   **Dirección:** De Product hacia StockQuantity
    *   **Calificación:** "has current stock"
    *   **Multiplicidad:** 1 (Product) a 1 (StockQuantity)
2.  **De `InventoryManagerService` a `MovementType`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De InventoryManagerService hacia MovementType
    *   **Calificación:** "defines movement type"
    *   **Multiplicidad:** 1 (InventoryManagerService) a 1 (MovementType)
3.  **De `InventoryManagerService` a `IInventoryRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De InventoryManagerService hacia IInventoryRepository
    *   **Calificación:** "uses inventory repository"
    *   **Multiplicidad:** 1 (InventoryManagerService) a 1 (IInventoryRepository)
4.  **De `ProductAPIController` a `InventoryManagerService`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De ProductAPIController hacia InventoryManagerService
    *   **Calificación:** "delegates stock management to"
    *   **Multiplicidad:** 1 (ProductAPIController) a 1 (InventoryManagerService)
5.  **De `Product` a `InventoryMovement`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De Product hacia InventoryMovement
    *   **Calificación:** "registers"
    *   **Multiplicidad:** 1 (Product) a Muchos (*) (InventoryMovement)
6.  **De `InventoryMovement` a `MovementType`**
    *   **Tipo:** Composición
    *   **Dirección:** De InventoryMovement hacia MovementType
    *   **Calificación:** "is of type"
    *   **Multiplicidad:** Muchos (*) (InventoryMovement) a 1 (MovementType)
7.  **De `Product` a `WorkshopId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De Product hacia WorkshopId
    *   **Calificación:** "belongs to workshop (tenant)"
    *   **Multiplicidad:** Muchos (*) (Product) a 1 (WorkshopId)

---

## 6. Bounded Context: Billing (Invoicing and Payments)

### 6.1 Clases, Enumeraciones e Interfaces

*   **Enumeración: `VoucherType`**
    *   **Valores:** `INVOICE`, `RECEIPT`, `CREDIT_NOTE`
*   **Enumeración: `SunatStatus`**
    *   **Valores:** `PENDING`, `ACCEPTED`, `REJECTED`
*   **Clase: `Money`** `<<ValueObject>>`
    *   **Atributos:** `- amount: BigDecimal`, `- currency: String`
    *   **Métodos:** `+ of(amt: BigDecimal): Money`, `+ add(m: Money): Money`, `+ multiply(factor: BigDecimal): Money`
*   **Clase: `TaxRate`** `<<ValueObject>>`
    *   **Atributos:** `- percentage: BigDecimal`
    *   **Métodos:** `+ of(pct: BigDecimal): TaxRate`, `+ calculateTax(base: Money): Money`
*   **Clase: `VoucherId`** `<<ValueObject>>`
    *   **Atributos:** `- value: UUID`
    *   **Métodos:** `+ generate(): VoucherId`
*   **Interface: `DomainEvent`**
    *   **Métodos:** `+ occurredOn(): LocalDateTime`
*   **Clase: `VoucherCreatedEvent`** `<<Event>>`
    *   **Atributos:** `- voucherId: VoucherId`, `- occurredOn: LocalDateTime`
*   **Clase: `Voucher`** `<<AggregateRoot>>`
    *   **Atributos:**
        *   `- id: VoucherId`
        *   `- workshopId: WorkshopId`
        *   `- workOrderId: UUID`
        *   `- type: VoucherType`
        *   `- subtotal: Money`
        *   `- tax: TaxRate`
        *   `- total: Money`
        *   `- sunatStatus: SunatStatus`
    *   **Métodos:** `+ createInvoice(subtotal: Money, tax: TaxRate): Voucher`, `+ updateSunatStatus(status: SunatStatus): void`
*   **Interface: `IVoucherRepository`**
    *   **Métodos:** `+ findById(id: VoucherId): Optional<Voucher>`, `+ save(voucher: Voucher): void`
*   **Enumeración: `PaymentMethod`**
    *   **Valores:** `CASH`, `CREDIT_CARD`, `DEBIT_CARD`, `BANK_TRANSFER`
*   **Clase: `Payment`** `<<Entity>>`
    *   **Atributos:** `- paymentId: UUID`, `- voucherId: VoucherId`, `- amount: Money`, `- method: PaymentMethod`, `- paidAt: LocalDateTime`
    *   **Métodos:** `+ pay(voucherId: VoucherId, amount: Money, method: PaymentMethod): Payment`
*   **Interface: `IPaymentRepository`**
    *   **Métodos:** `+ save(payment: Payment): void`
*   **Clase: `OutboxMessage`** `<<Entity>>`
    *   **Atributos:** `- id: UUID`, `- eventType: String`, `- payload: String`, `- status: String`, `- createdAt: LocalDateTime`, `- processedAt: LocalDateTime`
    *   **Métodos:** `+ markAsProcessed(): void`
*   **Interface: `IOutboxRepository`**
    *   **Métodos:** `+ save(message: OutboxMessage): void`, `+ findPending(): List<OutboxMessage>`
*   **Clase: `BillingManagerService`** `<<Service>>`
    *   **Atributos:** `- voucherRepo: IVoucherRepository`, `- paymentRepo: IPaymentRepository`, `- outboxRepo: IOutboxRepository`
    *   **Métodos:** 
        *   `+ generateVoucher(workOrderId: UUID, type: VoucherType): Voucher`
        *   `+ registerPayment(voucherId: VoucherId, amount: Money, method: PaymentMethod): Payment`
        *   `+ getMonthlyRevenueDashboard(workshopId: WorkshopId): DashboardDTO`
        *   `+ exportAccountingReport(workshopId: WorkshopId, month: YearMonth): byte[]`
*   **Clase: `CheckoutOrchestratorService`** `<<Service>>`
    *   **Atributos:** `- billingService: BillingManagerService`, `- inventoryService: InventoryManagerService`, `- eventPublisher: EventPublisherService`, `- outboxRepo: IOutboxRepository`
    *   **Métodos:** `+ checkout(workOrderId: UUID, paymentMethod: PaymentMethod): Voucher COMMENT 'Anotado con @Transactional para consistencia ACID de base de datos'`
*   **Clase: `EventPublisherService`** `<<Component>>`
    *   **Atributos:** `- rabbitTemplate: RabbitTemplate`
    *   **Métodos:** `+ publishInvoiceCreated(event: VoucherCreatedEvent): void COMMENT 'Publica comprobante.pendiente en RabbitMQ'`, `+ publishDtcAlertDetected(alert: VehicleDtcAlertEvent): void COMMENT 'Publica falla_dtc.detectada en RabbitMQ'`
*   **Clase: `VoucherAPIController`** `<<RestController>>`
    *   **Atributos:** `- billingService: BillingManagerService`, `- checkoutOrchestrator: CheckoutOrchestratorService`
    *   **Métodos:** `+ createVoucher(req: CreateVoucherDTO): ResponseEntity<VoucherDTO>`, `+ getVoucher(id: UUID): ResponseEntity<VoucherDTO>`, `+ getReport(month: String): ResponseEntity<byte[]>`

### 6.2 Relaciones

1.  **De `Voucher` a `VoucherId`**
    *   **Tipo:** Composición
    *   **Dirección:** De Voucher hacia VoucherId
    *   **Calificación:** "identified by"
    *   **Multiplicidad:** 1 (Voucher) a 1 (VoucherId)
2.  **De `Voucher` a `Money`**
    *   **Tipo:** Composición
    *   **Dirección:** De Voucher hacia Money
    *   **Calificación:** "composed of monetary amounts"
    *   **Multiplicidad:** 1 (Voucher) a Muchos (*) (Money)
3.  **De `Voucher` a `TaxRate`**
    *   **Tipo:** Composición
    *   **Dirección:** De Voucher hacia TaxRate
    *   **Calificación:** "applies tax rate"
    *   **Multiplicidad:** 1 (Voucher) a 1 (TaxRate)
4.  **De `Voucher` a `VoucherType`**
    *   **Tipo:** Composición
    *   **Dirección:** De Voucher hacia VoucherType
    *   **Calificación:** "is of legal type"
    *   **Multiplicidad:** 1 (Voucher) a 1 (VoucherType)
5.  **De `Voucher` a `SunatStatus`**
    *   **Tipo:** Composición
    *   **Dirección:** De Voucher hacia SunatStatus
    *   **Calificación:** "has status with SUNAT"
    *   **Multiplicidad:** 1 (Voucher) a 1 (SunatStatus)
6.  **De `VoucherCreatedEvent` a `DomainEvent`**
    *   **Tipo:** Realización (Implementación)
    *   **Dirección:** De VoucherCreatedEvent hacia DomainEvent
    *   **Calificación:** "implements"
    *   **Multiplicidad:** (Relación de realización sin cardinalidad de instancia)
7.  **De `BillingManagerService` a `IVoucherRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De BillingManagerService hacia IVoucherRepository
    *   **Calificación:** "uses vouchers repository"
    *   **Multiplicidad:** 1 (BillingManagerService) a 1 (IVoucherRepository)
8.  **De `VoucherAPIController` a `CheckoutOrchestratorService`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De VoucherAPIController hacia CheckoutOrchestratorService
    *   **Calificación:** "orchestrates checkout transactions through"
    *   **Multiplicidad:** 1 (VoucherAPIController) a 1 (CheckoutOrchestratorService)
9.  **De `Payment` a `PaymentMethod`**
    *   **Tipo:** Composición
    *   **Dirección:** De Payment hacia PaymentMethod
    *   **Calificación:** "uses"
    *   **Multiplicidad:** Muchos (*) (Payment) a 1 (PaymentMethod)
10. **De `Payment` a `VoucherId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De Payment hacia VoucherId
    *   **Calificación:** "pays voucher"
    *   **Multiplicidad:** Muchos (*) (Payment) a 1 (VoucherId)
11. **De `Payment` a `Money`**
    *   **Tipo:** Composición
    *   **Dirección:** De Payment hacia Money
    *   **Calificación:** "has amount"
    *   **Multiplicidad:** 1 (Payment) a 1 (Money)
12. **De `BillingManagerService` a `IPaymentRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De BillingManagerService hacia IPaymentRepository
    *   **Calificación:** "uses payments repository"
    *   **Multiplicidad:** 1 (BillingManagerService) a 1 (IPaymentRepository)
13. **De `BillingManagerService` a `IOutboxRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De BillingManagerService hacia IOutboxRepository
    *   **Calificación:** "uses outbox repository"
    *   **Multiplicidad:** 1 (BillingManagerService) a 1 (IOutboxRepository)
14. **De `Voucher` a `WorkshopId`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De Voucher hacia WorkshopId
    *   **Calificación:** "belongs to workshop (tenant)"
    *   **Multiplicidad:** Muchos (*) (Voucher) a 1 (WorkshopId)
15. **De `Voucher` a `WorkOrder`**
    *   **Tipo:** Asociación Unidireccional
    *   **Dirección:** De Voucher hacia WorkOrder
    *   **Calificación:** "associated with work order"
    *   **Multiplicidad:** Cero o uno (0..1) (Voucher) a Una (1) (WorkOrder)
16. **De `CheckoutOrchestratorService` a `BillingManagerService`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De CheckoutOrchestratorService hacia BillingManagerService
    *   **Calificación:** "delegates billing and voucher creation to"
    *   **Multiplicidad:** 1 (CheckoutOrchestratorService) a 1 (BillingManagerService)
17. **De `CheckoutOrchestratorService` a `InventoryManagerService`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De CheckoutOrchestratorService hacia InventoryManagerService
    *   **Calificación:** "deducts inventory stock during checkout through"
    *   **Multiplicidad:** 1 (CheckoutOrchestratorService) a 1 (InventoryManagerService)
18. **De `CheckoutOrchestratorService` a `EventPublisherService`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De CheckoutOrchestratorService hacia EventPublisherService
    *   **Calificación:** "publishes events to message broker via"
    *   **Multiplicidad:** 1 (CheckoutOrchestratorService) a 1 (EventPublisherService)
19. **De `CheckoutOrchestratorService` a `IOutboxRepository`**
    *   **Tipo:** Dependencia (Uso)
    *   **Dirección:** De CheckoutOrchestratorService hacia IOutboxRepository
    *   **Calificación:** "writes transactional outbox records through"
    *   **Multiplicidad:** 1 (CheckoutOrchestratorService) a 1 (IOutboxRepository)
