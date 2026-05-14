import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Interface representing the structure of a work order resource as returned by the API.
 */
export interface WorkOrderResponse extends BaseResource {
  branch_id: string;
  internal_number: number;
  customer_id: string;
  billing_customer_id: string | null;
  vehicle_id: string;
  assigned_mechanic_id: string;
  driver_name: string;
  driver_phone: string;
  current_mileage: number;
  diagnosis: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  version: number;
  created_at: string;
  updated_at: string;
}

/**
 * Interface representing the structure of a work order task resource as returned by the API.
 */
export interface WorkOrderTaskResponse extends BaseResource {
  work_order_id: string;
  description: string;
  estimated_hours: number;
  unit_price: number;
  status: 'PENDING' | 'DOING' | 'COMPLETED';
}

/**
 * Interface representing a list of work order resources.
 */
export interface WorkOrdersListResponse extends BaseResponse {
  workOrders: WorkOrderResponse[];
}
