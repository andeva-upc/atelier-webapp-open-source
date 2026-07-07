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
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const role = localStorage.getItem('activeRole') || sessionStorage.getItem('activeRole') || '';
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
      if (owner) name = `${owner.firstName || ''} ${owner.lastName || ''}`.trim();
    } else if (role.includes('EMPLOYEE')) {
      const employee = this.coreStore.currentEmployee();
      if (employee) name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    } else if (role.includes('CUSTOMER')) {
      const customer = this.coreStore.currentCustomer();
      if (customer) {
        if (customer.isCorporate && customer.businessName) {
          name = customer.businessName;
        } else {
          name = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
        }
      }
    }
    return name || 'Usuario';
  });

  userInitials = computed(() => {
    const name = this.userName();
    const words = name.split(' ').filter(w => w.length > 0);
    if (words.length === 0) return 'U';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  });
}
