import { Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-left-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, CommonModule, RouterLink],
  templateUrl: './left-sidebar.html',
  styleUrl: './left-sidebar.css',
})
export class LeftSidebar {
  isExpanded = signal(false);

  toggleSidebar() {
    this.isExpanded.update(val => !val);
  }

  /**
   * Array of navbar options for the atelier's sidebar.
   */
  options = signal([
    { link: '/home', label: 'option.home', icon: 'pi pi-objects-column' },
    { link: '/work-orders', label: 'option.work-orders', icon: 'pi pi-wrench' },
    { link: '/telemetry', label: 'option.telemetry', icon: 'pi pi-chart-line' },
    { link: '/customers', label: 'option.customers', icon: 'pi pi-users' },
    { link: '/appointments', label: 'option.appointments', icon: 'pi pi-calendar' },
    { link: '/billing', label: 'option.billing', icon: 'pi pi-receipt' },
    { link: '/inventory', label: 'option.inventory', icon: 'pi pi-box' },
    { link: '/configuration', label: 'option.configuration', icon: 'pi pi-cog' },
  ]);
}
