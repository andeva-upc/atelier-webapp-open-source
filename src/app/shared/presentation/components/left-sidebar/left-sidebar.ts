import { Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../layout/layout.service';

@Component({
  selector: 'app-left-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, CommonModule],
  templateUrl: './left-sidebar.html',
  styleUrl: './left-sidebar.css',
})
export class LeftSidebar {
  constructor(public layoutService: LayoutService) {}

  /**
   * Array of navbar options for the atelier's sidebar.
   */
  options = signal([
    { link: '/home', label: 'option.home', icon: 'pi pi-objects-column' },
    { link: '/work-orders', label: 'option.work-orders', icon: 'pi pi-wrench' },
    { link: '/inventory', label: 'option.inventory', icon: 'pi pi-box' },
    { link: '/customers', label: 'option.customers', icon: 'pi pi-users' },
    { link: '/staff', label: 'option.staff', icon: 'pi pi-briefcase' },
    { link: '/appointments', label: 'option.appointments', icon: 'pi pi-calendar' },
    { link: '/telemetry', label: 'option.telemetry', icon: 'pi pi-chart-line' },
    { link: '/billing', label: 'option.billing', icon: 'pi pi-receipt' },
    { link: '/vehicles', label: 'option.vehicles', icon: 'pi pi-car' },
    { link: '/configuration', label: 'option.configuration', icon: 'pi pi-cog' },
  ]);

}
