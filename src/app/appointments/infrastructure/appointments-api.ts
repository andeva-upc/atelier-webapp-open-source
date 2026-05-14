import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Appointment, AppointmentStatus } from '../domain/models/appointments.entity';
import { AppointmentRepository } from '../domain/repositories/appointments.repository';
import { AppointmentsApiEndpoint } from './appointments-api-endpoint';

/**
 * Infrastructure facade for appointment API operations.
 */
@Injectable({ providedIn: 'root' })
export class AppointmentsApi extends BaseApi implements AppointmentRepository {
  private readonly appointmentsEndpoint = inject(AppointmentsApiEndpoint);

  getAll(): Observable<Appointment[]> {
    return this.appointmentsEndpoint.getAll();
  }

  search(query: string): Observable<Appointment[]> {
    return this.appointmentsEndpoint.search(query);
  }

  create(appointment: Appointment): Observable<Appointment> {
    return this.appointmentsEndpoint.create(appointment);
  }

  update(appointment: Appointment): Observable<Appointment> {
    return this.appointmentsEndpoint.update(appointment);
  }

  updateStatus(
    id: string | number,
    status: AppointmentStatus,
    version: number
  ): Observable<Appointment> {
    return this.appointmentsEndpoint.updateStatus(id, status, version);
  }
}
