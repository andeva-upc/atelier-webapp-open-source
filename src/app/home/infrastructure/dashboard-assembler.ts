import { Injectable } from '@angular/core';
import { Dashboard } from '../domain/model/dashboard.model';
import { DashboardResponse } from './dashboard-response';

/**
 * Data mapper and assembler for the Dashboard read model.
 *
 * Acts as an Anti-Corruption Layer (ACL) translating infrastructure-level representation DTO {@link DashboardResponse}
 * to the pure Domain {@link Dashboard} model.
 *
 * Note: It does not implement BaseAssembler because Dashboard is an aggregated view (CQRS Read Model),
 * not a transactional BaseEntity.
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardAssembler {

  /**
   * Converts an infrastructure-level DTO resource into a pure Domain model.
   * Resolves snake_case fields from the backend into strongly-typed camelCase domain properties.
   *
   * @param resource - The input DTO resource {@link DashboardResponse}.
   * @returns A new instance of the {@link Dashboard} Domain model.
   */
  toModelFromResource(resource: DashboardResponse): Dashboard {
    return new Dashboard(
      {
        monthlyIncome: resource.kpis.monthly_income,
        incomeGrowthPercentage: resource.kpis.income_growth_percentage,
        activeWorkOrders: resource.kpis.active_work_orders,
        completedTodayWorkOrders: resource.kpis.completed_today_work_orders,
        vehiclesInWorkshop: resource.kpis.vehicles_in_workshop,
        vehiclesWithTelemetry: resource.kpis.vehicles_with_telemetry,
        pendingAlerts: resource.kpis.pending_alerts,
        criticalAlertsCount: resource.kpis.critical_alerts_count,
        mediumAlertsCount: resource.kpis.medium_alerts_count,
      },
      resource.revenue_chart.map(chart => ({
        month: chart.month_name,
        revenue: chart.revenue_amount
      })),
      resource.recent_alerts.map(alert => ({
        id: alert.id,
        dtcCode: alert.dtc_code,
        plateNumber: alert.plate_number,
        description: alert.description,
        time: alert.time,
        severity: alert.severity
      })),
      resource.recent_orders.map(order => ({
        id: order.id,
        workOrderId: order.work_order_id,
        customerName: order.customer_name,
        vehicleName: order.vehicle_name,
        plateNumber: order.plate_number,
        mechanicName: order.mechanic_name,
        status: order.status,
        amount: order.amount
      }))
    );
  }
}
