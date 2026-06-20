import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IotApi } from '../infrastructure/iot-api';
import { forkJoin, Observable, tap, catchError, switchMap, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CustomerRegistrationsApiEndpoint } from '../../fleet/infrastructure/endpoints/customer-registrations.endpoint';

// Commands
import { CreateObd2DeviceCommand } from '../domain/model/commands/create-obd2-device.command';
import { UpdateObd2DeviceCommand } from '../domain/model/commands/update-obd2-device.command';
import { LinkObd2DeviceCommand } from '../domain/model/commands/link-obd2-device.command';
import { RegisterVehicleCommand } from '../domain/model/commands/register-vehicle.command';
import { UpdateVehicleCommand } from '../domain/model/commands/update-vehicle.command';
import { IngestTelemetryCommand } from '../domain/model/commands/ingest-telemetry.command';

// Resources
import { Obd2DeviceResource } from '../infrastructure/responses/obd2-device.response';
import { Obd2DeviceRegistrationResource } from '../infrastructure/responses/obd2-registration.response';
import { VehicleResource } from '../infrastructure/responses/vehicle.response';
import { TelemetrySnapshotResource } from '../infrastructure/responses/telemetry-snapshot.response';
import { DtcAlertResource } from '../infrastructure/responses/dtc-alert.response';
import { VehicleRegistrationResource } from '../infrastructure/responses/vehicle-registration.response';

@Injectable({ providedIn: 'root' })
export class IotStore {
  // --- Signals ---
  private readonly obd2DevicesSignal = signal<Obd2DeviceResource[]>([]);
  private readonly availableObd2DevicesSignal = signal<Obd2DeviceResource[]>([]);
  private readonly activeObd2DeviceSignal = signal<Obd2DeviceResource | null>(null);

  private readonly registrationsSignal = signal<Obd2DeviceRegistrationResource[]>([]);
  private readonly activeRegistrationSignal = signal<Obd2DeviceRegistrationResource | null>(null);

  private readonly vehiclesSignal = signal<VehicleResource[]>([]);
  private readonly availableVehiclesSignal = signal<VehicleResource[]>([]);
  private readonly activeVehicleSignal = signal<VehicleResource | null>(null);

  private readonly vehicleRegistrationsSignal = signal<VehicleRegistrationResource[]>([]);
  private readonly activeVehicleRegistrationSignal = signal<VehicleRegistrationResource | null>(null);

  private readonly telemetrySnapshotsSignal = signal<TelemetrySnapshotResource[]>([]);
  private readonly latestTelemetrySignal = signal<TelemetrySnapshotResource | null>(null);
  private readonly dtcAlertsSignal = signal<DtcAlertResource[]>([]);

  // --- Exposed Readonly Signals ---
  readonly obd2Devices = this.obd2DevicesSignal.asReadonly();
  readonly availableObd2Devices = this.availableObd2DevicesSignal.asReadonly();
  readonly activeObd2Device = this.activeObd2DeviceSignal.asReadonly();

  readonly registrations = this.registrationsSignal.asReadonly();
  readonly activeRegistration = this.activeRegistrationSignal.asReadonly();

  readonly vehicles = this.vehiclesSignal.asReadonly();
  readonly availableVehicles = this.availableVehiclesSignal.asReadonly();
  readonly activeVehicle = this.activeVehicleSignal.asReadonly();

  readonly vehicleRegistrations = this.vehicleRegistrationsSignal.asReadonly();
  readonly activeVehicleRegistration = this.activeVehicleRegistrationSignal.asReadonly();

  readonly telemetrySnapshots = this.telemetrySnapshotsSignal.asReadonly();
  readonly latestTelemetry = this.latestTelemetrySignal.asReadonly();
  readonly dtcAlerts = this.dtcAlertsSignal.asReadonly();

  private readonly branchVehiclesSignal = signal<VehicleResource[]>([]);
  readonly branchVehicles = this.branchVehiclesSignal.asReadonly();

  constructor(
    private api: IotApi,
    private router: Router,
    private customerRegsApi: CustomerRegistrationsApiEndpoint,
    private http: HttpClient
  ) {}

  // ==========================================
  // OBD2 DEVICES
  // ==========================================

  loadObd2Devices(branchId: string) {
    this.api.obd2Devices.getByBranchId(branchId).subscribe({
      next: (devices) => this.obd2DevicesSignal.set(devices),
      error: (err) => console.error('Failed to load OBD2 devices:', err)
    });
  }

  loadAvailableObd2Devices(branchId: string) {
    this.api.obd2Devices.getAvailable(branchId).subscribe({
      next: (devices) => this.availableObd2DevicesSignal.set(devices),
      error: (err) => console.error('Failed to load available OBD2 devices:', err)
    });
  }

  loadObd2DeviceById(id: string) {
    this.api.obd2Devices.getById(id).subscribe({
      next: (device) => this.activeObd2DeviceSignal.set(device),
      error: (err) => console.error('Failed to load OBD2 device:', err)
    });
  }

  createObd2Device(command: CreateObd2DeviceCommand): Observable<Obd2DeviceResource> {
    return this.api.obd2Devices.create(command).pipe(
      tap({
        next: (device) => {
          const current = this.obd2DevicesSignal();
          this.obd2DevicesSignal.set([...current, device]);
          
          // Also refresh available list since new device is AVAILABLE by default
          const currentAvailable = this.availableObd2DevicesSignal();
          this.availableObd2DevicesSignal.set([...currentAvailable, device]);
        },
        error: (err) => console.error('Failed to create OBD2 device:', err)
      })
    );
  }

  updateObd2Device(id: string, command: UpdateObd2DeviceCommand): Observable<Obd2DeviceResource> {
    return this.api.obd2Devices.update(id, command).pipe(
      tap({
        next: (updatedDevice) => {
          // Update main devices list
          this.obd2DevicesSignal.update((list) =>
            list.map((d) => (d.id === updatedDevice.id ? updatedDevice : d))
          );
          // Update available list if present
          this.availableObd2DevicesSignal.update((list) =>
            list.map((d) => (d.id === updatedDevice.id ? updatedDevice : d))
          );
          // Update active device if open
          if (this.activeObd2DeviceSignal()?.id === id) {
            this.activeObd2DeviceSignal.set(updatedDevice);
          }
        },
        error: (err) => console.error('Failed to update OBD2 device:', err)
      })
    );
  }

  deleteObd2Device(id: string): Observable<void> {
    return this.api.obd2Devices.delete(id).pipe(
      tap({
        next: () => {
          this.obd2DevicesSignal.update((list) => list.filter((d) => d.id !== id));
          this.availableObd2DevicesSignal.update((list) => list.filter((d) => d.id !== id));
          if (this.activeObd2DeviceSignal()?.id === id) {
            this.activeObd2DeviceSignal.set(null);
          }
        },
        error: (err) => console.error('Failed to delete OBD2 device:', err)
      })
    );
  }

  // ==========================================
  // OBD2 REGISTRATIONS (COUPLINGS)
  // ==========================================

  loadRegistrations(branchId: string, status: string) {
    this.api.obd2Registrations.getByBranchIdAndStatus(branchId, status).subscribe({
      next: (regs) => this.registrationsSignal.set(regs),
      error: (err) => console.error('Failed to load OBD2 registrations:', err)
    });
  }

  linkObd2Device(command: LinkObd2DeviceCommand): Observable<Obd2DeviceRegistrationResource> {
    return this.api.obd2Registrations.linkObd2Device(command).pipe(
      tap({
        next: (reg) => {
          this.registrationsSignal.update((list) => [...list, reg]);
          this.activeRegistrationSignal.set(reg);

          // Remove linked OBD2 and Vehicle from available lists
          this.availableObd2DevicesSignal.update((list) =>
            list.filter((d) => d.id !== command.obd2DeviceId)
          );
          this.availableVehiclesSignal.update((list) =>
            list.filter((v) => v.id !== command.vehicleId)
          );

          // Refresh devices list states
          this.obd2DevicesSignal.update((list) =>
            list.map((d) => d.id === command.obd2DeviceId ? { ...d, status: 'LINKED' } : d)
          );
        },
        error: (err) => console.error('Failed to link OBD2 device to vehicle:', err)
      })
    );
  }

  deactivateRegistration(id: string): Observable<Obd2DeviceRegistrationResource> {
    return this.api.obd2Registrations.deactivate(id).pipe(
      tap({
        next: (updatedReg) => {
          this.registrationsSignal.update((list) =>
            list.map((r) => (r.id === updatedReg.id ? updatedReg : r))
          );
          if (this.activeRegistrationSignal()?.id === id) {
            this.activeRegistrationSignal.set(updatedReg);
          }

          // Trigger updates to reload available device/vehicle state lists in UI
          this.loadAvailableObd2Devices(updatedReg.branchId);
          this.loadAvailableVehicles(updatedReg.branchId);
          this.loadObd2Devices(updatedReg.branchId);
        },
        error: (err) => console.error('Failed to deactivate registration:', err)
      })
    );
  }

  loadTelemetrySnapshotsForRegistration(registrationId: string) {
    this.api.obd2Registrations.getTelemetrySnapshots(registrationId).subscribe({
      next: (snapshots) => this.telemetrySnapshotsSignal.set(snapshots),
      error: (err) => console.error('Failed to load registration telemetry snapshots:', err)
    });
  }

  loadDtcAlertsForRegistration(registrationId: string) {
    this.api.obd2Registrations.getDtcAlerts(registrationId).subscribe({
      next: (alerts) => this.dtcAlertsSignal.set(alerts),
      error: (err) => console.error('Failed to load registration DTC alerts:', err)
    });
  }

  // ==========================================
  // VEHICLES
  // ==========================================

  loadAvailableVehicles(branchId: string) {
    this.api.vehicles.getAvailableForLinking(branchId).subscribe({
      next: (vehicles) => this.availableVehiclesSignal.set(vehicles),
      error: (err) => console.error('Failed to load available vehicles:', err)
    });
  }

  loadBranchVehicles(branchId: string) {
    this.customerRegsApi.getByBranchId(branchId).subscribe({
      next: (regs) => {
        const vehicleRequests = regs.map(reg => this.api.vehicles.getByCustomerId(reg.customerId));
        if (vehicleRequests.length === 0) {
          this.branchVehiclesSignal.set([]);
          return;
        }
        
        forkJoin(vehicleRequests).subscribe({
          next: (vehiclesLists) => {
            const allVehicles = vehiclesLists.flat();
            const uniqueVehicles = allVehicles.filter((v, index, self) =>
              self.findIndex(t => t.id === v.id) === index
            );
            this.branchVehiclesSignal.set(uniqueVehicles);
          },
          error: (err) => console.error('Failed to load branch vehicles:', err)
        });
      },
      error: (err) => console.error('Failed to load branch customer registrations:', err)
    });
  }

  loadVehiclesByCustomerId(customerId: string) {
    this.api.vehicles.getByCustomerId(customerId).subscribe({
      next: (vehicles) => this.vehiclesSignal.set(vehicles),
      error: (err) => console.error('Failed to load customer vehicles:', err)
    });
  }

  registerVehicle(command: RegisterVehicleCommand, customerId: string) {
    this.api.vehicles.register(command).subscribe({
      next: (registration) => {
        this.vehicleRegistrationsSignal.update((list) => [...list, registration]);
        this.activeVehicleRegistrationSignal.set(registration);

        // Reload the customer's vehicles list so the UI gets the updated list including the new vehicle with its full details
        this.loadVehiclesByCustomerId(customerId);
      },
      error: (err) => console.error('Failed to register vehicle:', err)
    });
  }

  updateVehicle(id: string, command: UpdateVehicleCommand) {
    this.api.vehicles.update(id, command).subscribe({
      next: (updatedVehicle) => {
        this.vehiclesSignal.update((list) =>
          list.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
        );
        this.availableVehiclesSignal.update((list) =>
          list.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
        );
        if (this.activeVehicleSignal()?.id === id) {
          this.activeVehicleSignal.set(updatedVehicle);
        }
      },
      error: (err) => console.error('Failed to update vehicle details:', err)
    });
  }

  deleteVehicle(id: string) {
    this.api.vehicles.delete(id).subscribe({
      next: () => {
        this.vehiclesSignal.update((list) => list.filter((v) => v.id !== id));
        this.availableVehiclesSignal.update((list) => list.filter((v) => v.id !== id));
        if (this.activeVehicleSignal()?.id === id) {
          this.activeVehicleSignal.set(null);
        }
      },
      error: (err) => console.error('Failed to delete vehicle:', err)
    });
  }

  loadVehicleTelemetryHistory(vehicleId: string) {
    this.api.vehicles.getTelemetrySnapshotHistory(vehicleId).subscribe({
      next: (snapshots) => this.telemetrySnapshotsSignal.set(snapshots),
      error: (err) => console.error('Failed to load vehicle telemetry history:', err)
    });
  }

  loadVehicleDtcAlertHistory(vehicleId: string) {
    this.api.vehicles.getDtcAlertHistory(vehicleId).subscribe({
      next: (alerts) => this.dtcAlertsSignal.set(alerts),
      error: (err) => console.error('Failed to load vehicle DTC alerts history:', err)
    });
  }

  createTestVehicleForBranch(branchId: string): Observable<any> {
    const userId = localStorage.getItem('userId') || '';
    
    // Generate a random 8-digit document number and a random 9-digit phone number
    const randomDoc = Math.floor(10000000 + Math.random() * 90000000).toString();
    const randomPhone = '9' + Math.floor(10000000 + Math.random() * 89999999).toString();
    
    // 1. Create customer profile (ignore 409 Conflict if already exists)
    const customerPayload = {
      userId: userId,
      isCorporate: false,
      firstName: 'Cliente',
      lastName: 'Taller',
      businessName: '',
      documentType: 'DNI',
      documentNumber: randomDoc,
      phone: randomPhone
    };
    
    console.log('[IotStore] Creating customer profile:', customerPayload);
    
    return this.http.post<any>(`${environment.apiBaseUrl}${environment.endpoints.core.customers}`, customerPayload).pipe(
      catchError(err => {
        console.warn('[IotStore] Customer creation error:', err);
        // If 409, it already exists, so we proceed by fetching the customer by userId
        if (err.status === 409 || (err.error && err.error.message && err.error.message.includes('already exists'))) {
          return this.http.get<any>(`${environment.apiBaseUrl}${environment.endpoints.core.customers}/user/${userId}`);
        }
        throw err;
      }),
      switchMap((customer: any) => {
        const customerId = customer.id;
        console.log('[IotStore] Customer resolved:', customerId);
        // Save customerId in localStorage for convenience
        localStorage.setItem('customerId', customerId);
        
        // 2. Register customer in branch
        const regPayload = {
          customerId: customerId,
          branchId: branchId
        };
        console.log('[IotStore] Registering customer in branch:', regPayload);
        return this.http.post(`${environment.apiBaseUrl}${environment.endpoints.fleet.customerRegistrations}`, regPayload).pipe(
          catchError(err => {
            console.warn('[IotStore] Customer branch registration error:', err);
            if (err.status === 409) return of(null); // Already registered
            throw err;
          }),
          map(() => customerId)
        );
      }),
      switchMap((customerId: string) => {
        // 3. Register vehicle for this user
        const vehiclePayload = {
          brand: 'Toyota',
          model: 'Corolla',
          plateNumber: 'ABC-' + Math.floor(100 + Math.random() * 900),
          vin: '1HGBH41JXMN' + Math.random().toString().substring(2, 9),
          year: 2020
        };
        console.log('[IotStore] Registering vehicle:', vehiclePayload);
        return this.http.post<any>(`${environment.apiBaseUrl}${environment.endpoints.iot.vehicles}`, vehiclePayload).pipe(
          tap({
            next: (res) => {
              console.log('[IotStore] Vehicle registered successfully:', res);
              // Reload list states
              this.loadAvailableVehicles(branchId);
              this.loadBranchVehicles(branchId);
            },
            error: (err) => console.error('[IotStore] Vehicle registration failed:', err)
          })
        );
      })
    );
  }

  // ==========================================
  // TELEMETRY BATCHES
  // ==========================================

  ingestTelemetry(command: IngestTelemetryCommand) {
    this.api.telemetry.ingest(command).subscribe({
      next: () => {
        // If ingest was successful, we reload latest telemetry if activeDevice matches
        this.loadLatestTelemetry(command.obd2DeviceId);
      },
      error: (err) => console.error('Failed to ingest telemetry batch:', err)
    });
  }

  loadLatestTelemetry(deviceId: string) {
    this.api.telemetry.getLatest(deviceId).subscribe({
      next: (snapshot) => this.latestTelemetrySignal.set(snapshot),
      error: (err) => console.error('Failed to load latest telemetry snapshot:', err)
    });
  }

  loadTelemetryHistory(deviceId: string) {
    this.api.telemetry.getHistory(deviceId).subscribe({
      next: (snapshots) => this.telemetrySnapshotsSignal.set(snapshots),
      error: (err) => console.error('Failed to load device telemetry history:', err)
    });
  }
}
