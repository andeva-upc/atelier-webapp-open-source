import { HomeKpis } from './home-kpi.model';
import { HomeDtcAlert } from './home-dtc-alert.model';
import { HomeRecentWorkorder } from './home-recent-workorder.model';

export interface RevenueChartData {
  month: string;
  revenue: number;
}

export class Dashboard {
  constructor(
    public readonly kpis: HomeKpis,
    public readonly chartData: RevenueChartData[],
    public readonly alerts: HomeDtcAlert[],
    public readonly recentWorkOrders: HomeRecentWorkorder[]
  ) {}
}
