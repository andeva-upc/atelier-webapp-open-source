import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardResponse } from './dashboard-response';

/**
 * Infrastructure endpoint service for the Dashboard.
 *
 * Performs client-side relational aggregation in memory, fetching data
 * from multiple json-server endpoints to build an aggregated backend
 * Dashboard response dynamically, strictly without hardcoded fallback data.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardApiEndpoint {
  private readonly http = inject(HttpClient);


  private readonly rootBaseUrl = environment.platformProviderApiBaseUrl.replace('/api/v1', '');

  /**
   * Performs parallel requests to fetch all necessary relational tables.
   *
   * @returns An {@link Observable} emitting the aggregated {@link DashboardResponse} DTO.
   */
  getMetrics(): Observable<DashboardResponse> {
    const workOrdersUrl = `${this.rootBaseUrl}${environment.platformProviderWorkOrdersEndpointPath}`;
    const vehiclesUrl = `${this.rootBaseUrl}${environment.platformProviderVehiclesEndpointPath}`;
    const dtcAlertsUrl = `${this.rootBaseUrl}${environment.platformProviderVehicleDtcAlertsEndpointPath}`;
    const customersUrl = `${this.rootBaseUrl}${environment.platformProviderCustomersEndpointPath}`;
    const usersUrl = `${this.rootBaseUrl}${environment.platformProviderUsersEndpointPath}`;
    const quotesUrl = `${this.rootBaseUrl}${environment.platformProviderQuotesEndpointPath}`;
    const obd2DevicesUrl = `${this.rootBaseUrl}${environment.platformProviderObd2DevicesEndpointPath}`;
    const workOrderTasksUrl = `${this.rootBaseUrl}${environment.platformProviderWorkOrdersTasksEndpointPath}`;
    const paymentsUrl = `${this.rootBaseUrl}${environment.platformProviderPaymentsEndpointPath}`;

    return forkJoin({
      workOrders: this.http.get<any[]>(workOrdersUrl),
      vehicles: this.http.get<any[]>(vehiclesUrl),
      alerts: this.http.get<any[]>(dtcAlertsUrl),
      customers: this.http.get<any[]>(customersUrl),
      users: this.http.get<any[]>(usersUrl),
      quotes: this.http.get<any[]>(quotesUrl),
      obd2Devices: this.http.get<any[]>(obd2DevicesUrl),
      workOrderTasks: this.http.get<any[]>(workOrderTasksUrl),
      payments: this.http.get<any[]>(paymentsUrl)
    }).pipe(
      map(({ workOrders, vehicles, alerts, customers, users, quotes, obd2Devices, workOrderTasks, payments }) =>
        this.aggregateDashboardData(workOrders, vehicles, alerts, customers, users, quotes, obd2Devices, workOrderTasks, payments)
      )
    );
  }

  /**
   * Relationally aggregates raw backend records to build the Dashboard DTO dynamically.
   */
  private aggregateDashboardData(
    workOrders: any[], vehicles: any[], alerts: any[], 
    customers: any[], users: any[], quotes: any[], obd2Devices: any[], workOrderTasks: any[], payments: any[]
  ): DashboardResponse {

    const activeWorkOrders = workOrders.filter(wo => wo.status === 'IN_PROGRESS' || wo.status === 'DIAGNOSING').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const completedToday = workOrders.filter(wo => wo.status === 'COMPLETED' && wo.updated_at && wo.updated_at.startsWith(todayStr)).length;

    const vehiclesInWorkshop = workOrders.filter(wo => wo.status !== 'COMPLETED' && wo.status !== 'INVOICED').length;
    const vehiclesWithTelemetry = obd2Devices.filter(device => device.status === 'ACTIVE').length;


    const pendingAlertsList = alerts.filter(a => a.is_active !== false && a.is_resolved !== true);
    const criticalAlertsCount = pendingAlertsList.filter(a => a.severity === 'CRITICAL').length;
    const mediumAlertsCount = pendingAlertsList.filter(a => a.severity === 'MEDIUM').length;


    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const monthlyRevenueMap = new Map<string, number>();
    payments.forEach(p => {
      // Use paid_at to determine the month of the payment
      const date = new Date(p.paid_at);
      if (!isNaN(date.getTime())) {
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        monthlyRevenueMap.set(key, (monthlyRevenueMap.get(key) || 0) + Number(p.amount));
      }
    });

    const revenueChart = [];
    let currentMonthIncome = 0;
    let lastMonthIncome = 0;

    for (let i = 4; i >= 0; i--) {

      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const amount = monthlyRevenueMap.get(key) || 0;

      revenueChart.push({
        month_name: monthNames[d.getMonth()],
        revenue_amount: amount
      });

      if (i === 0) currentMonthIncome = amount;
      if (i === 1) lastMonthIncome = amount;
    }

    let incomeGrowth = 0;
    if (lastMonthIncome > 0) {
      incomeGrowth = Math.round(((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100);
    } else if (currentMonthIncome > 0) {
      incomeGrowth = 100;
    }

    // 5. Alertas Recientes
    // Filter to only include CRITICAL and MEDIUM severity
    const relevantAlerts = pendingAlertsList.filter(a => a.severity === 'CRITICAL' || a.severity === 'MEDIUM');
    const recentAlerts = relevantAlerts.map(alert => {
      const vehicle = vehicles.find(v => v.id === alert.vehicle_id);
      return {
        id: alert.id,
        dtc_code: alert.dtc_code,
        plate_number: vehicle ? vehicle.plate_number : 'Desconocido',
        description: alert.description,
        time: alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Reciente',
        severity: alert.severity
      };
    });

    // 6. Órdenes Recientes
    // Sort by updated_at descending if it exists
    const sortedOrders = [...workOrders].sort((a, b) => {
      const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return timeB - timeA;
    });

    const recentOrders = sortedOrders.slice(0, 4).map(wo => {
      const customer = customers.find(c => c.id === wo.customer_id);
      const vehicle = vehicles.find(v => v.id === wo.vehicle_id);
      const mechanic = users.find(u => u.id === wo.assigned_mechanic_id);
      
      // Look up tasks for this work order to calculate total amount
      const tasks = workOrderTasks.filter(t => t.work_order_id === wo.id);
      const amount = tasks.reduce((sum, task) => sum + Number(task.unit_price), 0);

      return {
        id: wo.id,
        work_order_id: wo.internal_number ? `OT-${String(wo.internal_number).padStart(3, '0')}` : wo.id.substring(0, 8),
        customer_name: customer ? customer.full_name : 'Cliente Anónimo',
        vehicle_name: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo Desconocido',
        plate_number: vehicle ? vehicle.plate_number : 'Desconocido',
        mechanic_name: mechanic ? mechanic.full_name : 'No asignado',
        status: wo.status,
        amount: amount
      };
    });

    return {
      kpis: {
        monthly_income: currentMonthIncome,
        income_growth_percentage: incomeGrowth,
        active_work_orders: activeWorkOrders,
        completed_today_work_orders: completedToday,
        vehicles_in_workshop: vehiclesInWorkshop,
        vehicles_with_telemetry: vehiclesWithTelemetry,
        pending_alerts: pendingAlertsList.length,
        critical_alerts_count: criticalAlertsCount,
        medium_alerts_count: mediumAlertsCount
      },
      revenue_chart: revenueChart,
      recent_alerts: recentAlerts,
      recent_orders: recentOrders
    };
  }
}
