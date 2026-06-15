import { Component, OnInit, signal } from '@angular/core';
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

  options = signal<{link: string, label: string, icon: string}[]>([]);

  ngOnInit() {
    const activeRole = localStorage.getItem('activeRole') || '';
    
    if (activeRole.includes('CUSTOMER')) {
      this.options.set([
        { link: '/home', label: 'option.home', icon: 'pi pi-objects-column' },
        { link: '/vehicles', label: 'option.vehicles', icon: 'pi pi-car' },
        { link: '/configuration', label: 'option.configuration', icon: 'pi pi-cog' },
      ]);
    } else {
      // Owner or Employee
      this.options.set([
        { link: '/home', label: 'option.home', icon: 'pi pi-objects-column' },
        { link: '/work-orders', label: 'option.work-orders', icon: 'pi pi-wrench' },
        { link: '/inventory', label: 'option.inventory', icon: 'pi pi-box' },
        { link: '/customers', label: 'option.customers', icon: 'pi pi-users' },
        { link: '/staff', label: 'option.staff', icon: 'pi pi-briefcase' },
        { link: '/appointments', label: 'option.appointments', icon: 'pi pi-calendar' },
        { link: '/telemetry', label: 'option.telemetry', icon: 'pi pi-chart-line' },
        { link: '/billing', label: 'option.billing', icon: 'pi pi-receipt' },
        { link: '/configuration', label: 'option.configuration', icon: 'pi pi-cog' },
      ]);
    }
  }

}
