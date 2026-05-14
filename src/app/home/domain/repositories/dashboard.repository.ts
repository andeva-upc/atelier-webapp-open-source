import { Observable } from 'rxjs';
import { Dashboard } from '../model/dashboard.model';

export abstract class DashboardRepository {
  abstract getDashboardMetrics(): Observable<Dashboard>;
}
