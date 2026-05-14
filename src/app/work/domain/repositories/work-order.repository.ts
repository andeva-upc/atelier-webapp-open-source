import { Observable } from 'rxjs';
import { WorkOrder, WorkOrderTask } from '../models/work-order.entity';

/**
 * Abstract domain repository contract for Work Order management.
 */
export abstract class WorkOrderRepository {
  /**
   * Retrieves all work orders from the persistence layer.
   */
  abstract getAll(): Observable<WorkOrder[]>;

  /**
   * Retrieves tasks associated with a specific work order.
   * 
   * @param workOrderId - The ID of the work order.
   */
  abstract getTasksByWorkOrderId(workOrderId: string): Observable<WorkOrderTask[]>;

  /**
   * Saves a new work order to the persistence layer.
   * 
   * @param workOrder - The work order data to save.
   */
  abstract create(workOrder: Partial<WorkOrder>): Observable<WorkOrder>;
}
