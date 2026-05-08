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
  isLeftSidebarCollapsed = input.required<boolean>();
  changeIsLeftSidebarCollapsed = output<boolean>();

  toggleCollapsed() {
    this.changeIsLeftSidebarCollapsed.emit(!this.isLeftSidebarCollapsed());
  }
  /**
   * Array of navbar options for the atelier's sidebar.
   */
  options = signal([
    { link: '/home', label: 'option.home', icon: '/home-icon.svg' },
    { link: '/work-orders', label: 'option.work-orders', icon: '/order-icon.svg' },
    { link: '/appointments', label: 'option.appointments', icon: '/appointment-icon.svg' },
    { link: '/staff', label: 'option.staff', icon: '/staff-icon.svg' },
    { link: '/inventory', label: 'option.inventory', icon: '/inventory-icon.svg' },
    { link: '/billing', label: 'option.billing', icon: '/billing-icon.svg' },
    { link: '/customers', label: 'option.customers', icon: '/customers-icon.svg' },
  ]);
}
