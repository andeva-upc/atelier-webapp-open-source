import { BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Data Transfer Object (DTO) representing the raw Dashboard network model.
 *
 * Unlike transactional entities, this response is an aggregated Read Model
 * (CQRS View Model). Therefore, it extends BaseResponse instead of BaseResource,
 * as it does not possess a unique identity (id) or persistence fields (deleted_at).
 *
 * Contains embedded metrics and summaries aggregated by the backend.
 */
export interface DashboardResponse extends BaseResponse {
  kpis: {
    monthly_income: number;
    income_growth_percentage: number;
    active_work_orders: number;
    completed_today_work_orders: number;
    vehicles_in_workshop: number;
    vehicles_with_telemetry: number;
    pending_alerts: number;
    critical_alerts_count: number;
    medium_alerts_count: number;
  };

  /** Embedded revenue chart data mapped from backend aggregations */
  revenue_chart: Array<{
    month_name: string;
    revenue_amount: number;
  }>;

  /** Embedded recent vehicle alerts side-loaded from the IoT context */
  recent_alerts: Array<{
    id: string;
    dtc_code: string;
    plate_number: string;
    description: string;
    time: string;
    severity: 'CRITICAL' | 'MEDIUM';
  }>;

  /** Embedded recent work orders side-loaded from the Operations context */
  recent_orders: Array<{
    id: string;
    work_order_id: string;
    customer_name: string;
    vehicle_name: string;
    plate_number: string;
    mechanic_name: string;
    status: string;
    amount: number;
  }>;
}
