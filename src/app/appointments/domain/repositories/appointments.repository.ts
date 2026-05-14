import { Observable } from 'rxjs';
import { Appointment, AppointmentStatus } from '../models/appointments.entity';

/**
 * Domain Repository Contract defining the boundary for appointment operations.
 */
export abstract class AppointmentRepository {
  abstract getAll(): Observable<Appointment[]>;

  abstract search(query: string): Observable<Appointment[]>;

  abstract create(appointment: Appointment): Observable<Appointment>;

  abstract update(appointment: Appointment): Observable<Appointment>;

  abstract updateStatus(
    id: string | number,
    status: AppointmentStatus,
    version: number
  ): Observable<Appointment>;
}
