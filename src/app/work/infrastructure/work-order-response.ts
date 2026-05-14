import { BaseResource } from '../../shared/infrastructure/base-response';

export interface WorkOrderResponse extends BaseResource {
  id: string;
  workshop_id: string;
  branch_id: string;
  internal_number: number;
  customer_id: string;
  billing_customer_id: string | null;
  vehicle_id: string;
  assigned_mechanic_id: string;
  driver_name: string;
  driver_phone: string;
  current_mileage: number;
  license_plate: string;
  diagnosis: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface WorkOrdersListResponse {
  work_orders: WorkOrderResponse[];
}
