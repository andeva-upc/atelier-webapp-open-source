import { BaseResource } from '../../shared/infrastructure/base-response';
import { AppointmentStatus } from '../domain/models/appointments.entity';

/**
 * DTO representing the raw appointment network model.
 */
export interface AppointmentResponse extends BaseResource {
  id: string;
  workshop_id: string;
  branch_id: string;
  customer_id?: string;
  vehicle_id?: string;
  appointment_date?: string;
  status: AppointmentStatus;
  service_type?: string;
  mechanic_name?: string;
  notes?: string;
  version: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;

  pre_registered_full_name?: string;
  pre_registered_email?: string;
  pre_registered_phone?: string;
  pre_registered_vehicle_plate?: string;
  pre_registered_vehicle_brand_model?: string;
}
