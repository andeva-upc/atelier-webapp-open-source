import { Observable } from 'rxjs';
import { WorkOrder } from '../models/work-order.entity';

export abstract class WorkOrderRepository {
  abstract getAll(): Observable<WorkOrder[]>;
  abstract getById(id: string): Observable<WorkOrder>;
  abstract create(workOrder: Partial<WorkOrder>): Observable<WorkOrder>;
  abstract updateStatus(id: string, status: string): Observable<WorkOrder>;
}
