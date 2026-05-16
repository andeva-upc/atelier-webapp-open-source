import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { DashboardRepository } from '../domain/repositories/dashboard.repository';
import { Dashboard } from '../domain/model/dashboard.model';
import { DashboardApiEndpoint } from './dashboard-api-endpoint';
import { DashboardAssembler } from './dashboard-assembler';

/**
 * Infrastructure service facade for Dashboard external API operations.
 * 
 * Acts as the infrastructure layer facade coordinating access to Dashboard
 * API resources. It orchestrates interactions between the application layer 
 * and the infrastructure layer using the Anti-Corruption Layer (Assembler).
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardApi extends BaseApi implements DashboardRepository {
  /**
   * Endpoint client for fetching raw aggregated data.
   * @private
   */
  private readonly dashboardEndpoint = inject(DashboardApiEndpoint);

  /**
   * Assembler to map raw DTOs into Domain models.
   * @private
   */
  private readonly assembler = inject(DashboardAssembler);

  /**
   * Retrieves dashboard metrics from persistence through the underlying API endpoint.
   * Uses the assembler to map the raw response into a clean Domain model.
   * 
   * @returns An {@link Observable} emitting the {@link Dashboard} model.
   */
  getDashboardMetrics(): Observable<Dashboard> {
    return this.dashboardEndpoint.getMetrics().pipe(
      map(response => this.assembler.toModelFromResource(response))
    );
  }
}
