import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreStore } from '../../../application/core.store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-core-user-info',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './user-profile-button.html',
  styleUrl: './user-profile-button.css'
})
export class CoreUserInfoComponent implements OnInit {
  private coreStore = inject(CoreStore);
  activeRole = signal<string>('');

  ngOnInit() {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('activeRole') || '';
    this.activeRole.set(role);
    if (userId) {
      if (role.includes('OWNER')) {
        this.coreStore.loadOwnerByUserId(userId);
      } else if (role.includes('EMPLOYEE')) {
        this.coreStore.loadEmployeeByUserId(userId);
      } else if (role.includes('CUSTOMER')) {
        this.coreStore.loadCustomerByUserId(userId);
      }
    }
  }

  userName = computed(() => {
    const role = this.activeRole();
    let name = '';
    if (role.includes('OWNER')) {
      const owner = this.coreStore.currentOwner();
      if (owner) name = `${owner.firstName} ${owner.lastName}`;
    } else if (role.includes('EMPLOYEE')) {
      const employee = this.coreStore.currentEmployee();
      if (employee) name = `${employee.firstName} ${employee.lastName}`;
    } else if (role.includes('CUSTOMER')) {
      const customer = this.coreStore.currentCustomer();
      if (customer) name = `${customer.firstName} ${customer.lastName}`;
    }
    return name;
  });

  userInitials = computed(() => {
    const name = this.userName() || 'U';
    return name.split(' ').map(w => w.charAt(0).toUpperCase()).join('').slice(0, 2);
  });
}
