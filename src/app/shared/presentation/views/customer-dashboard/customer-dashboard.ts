import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { VehiclesListComponent } from '../../../../iot/presentation/views/vehicles-list/vehicles-list';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    VehiclesListComponent
  ],
  templateUrl: './customer-dashboard.html',
  styleUrls: ['./customer-dashboard.css']
})
export class CustomerDashboardComponent {
  // Acts as a shell/container. The VehiclesListComponent handles its own data loading and display.
}
