import { Injectable, computed, signal, inject } from '@angular/core';
import { Dashboard } from '../domain/model/dashboard.model';
import { DashboardRepository } from '../domain/repositories/dashboard.repository';

/**
 * Application service managing Dashboard domain state and orchestration.
 * 
 * Coordinates interactions with the infrastructure layer using the Domain Repository
 * contract, and provides reactive state queries via Angular signals.
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardStore {
  /**
   * Reference to the abstract domain repository contract (Dependency Inversion).
   * @private
   */
  private readonly repository = inject(DashboardRepository);

  /**
   * Signal containing the loaded dashboard metrics.
   * @private
   */
  private readonly metricsSignal = signal<Dashboard | null>(null);

  /**
   * Signal indicating whether data is currently loading.
   * @private
   */
  private readonly loadingSignal = signal<boolean>(false);

  /**
   * Signal containing the most recent error message, if any.
   * @private
   */
  private readonly errorSignal = signal<string | null>(null);

  /**
   * Readonly signal for accessing the dashboard metrics.
   */
  readonly metrics = this.metricsSignal.asReadonly();

  /**
   * Readonly signal for accessing the loading state.
   */
  readonly loading = this.loadingSignal.asReadonly();

  /**
   * Readonly signal for accessing the current error state.
   */
  readonly error = this.errorSignal.asReadonly();

  /**
   * Computed signals for quick access to specific dashboard parts in the UI without Optional Chaining logic in HTML.
   */
  readonly kpis = computed(() => this.metrics()?.kpis);
  readonly chartData = computed(() => this.metrics()?.chartData ?? []);
  readonly alerts = computed(() => this.metrics()?.alerts ?? []);
  readonly recentOrders = computed(() => this.metrics()?.recentWorkOrders ?? []);

  /**
   * Formats error messages for display.
   * @private
   */
  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message;
    }
    return fallback;
  }

  /**
   * Loads dashboard metrics from the remote API via the injected repository.
   */
  loadDashboardData(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.repository.getDashboardMetrics().subscribe({
      next: (data) => {
        this.metricsSignal.set(data);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(this.formatError(err, 'Failed to load dashboard data'));
      },
    });
  }
}
