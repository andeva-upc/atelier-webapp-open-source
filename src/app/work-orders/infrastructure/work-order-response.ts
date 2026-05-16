import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface WorkOrderResponse extends BaseResource {
  id: string;
  internal_number: number;
  customer_id: string;
  billing_customer_id: string | null;
  vehicle_id: string;
  assigned_mechanic_id: string;
  driver_name: string;
  driver_phone: string;
  current_mileage: number;
  diagnosis: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderListResponse extends BaseResponse {
  work_orders: WorkOrderResponse[];
}

export interface WorkOrderTaskResponse extends BaseResource {
  id: string;
  work_order_id: string;
  description: string;
  estimated_hours: number;
  unit_price: number;
  status: string;
}

export interface WorkOrderTaskListResponse extends BaseResponse {
  work_order_tasks: WorkOrderTaskResponse[];
}
