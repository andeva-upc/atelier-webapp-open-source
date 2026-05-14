import { Observable } from 'rxjs';
import { WorkOrder } from '../models/work-order.entity';

export abstract class WorkOrderRepository {
  /**
   * Retrieves all work orders for the current workshop.
   * @returns Observable of WorkOrder array.
   */
  abstract getAll(): Observable<WorkOrder[]>;

  /**
   * Retrieves a single work order by its ID.
   * @param id - The unique identifier of the work order.
   * @returns Observable of the found WorkOrder.
   */
  abstract getById(id: string): Observable<WorkOrder>;

  /**
   * Creates a new work order.
   * @param workOrder - The work order entity to create.
   * @returns Observable of the created WorkOrder.
   */
  abstract create(workOrder: Partial<WorkOrder>): Observable<WorkOrder>;

  /**
   * Updates an existing work order.
   * @param id - The ID of the work order to update.
   * @param workOrder - The partial data to update.
   * @returns Observable of the updated WorkOrder.
   */
  abstract update(id: string, workOrder: Partial<WorkOrder>): Observable<WorkOrder>;
}
