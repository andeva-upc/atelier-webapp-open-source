import { Component, Input, OnInit, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreStore } from '../../../application/core.store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-customer-name',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './customer-name.html'
})
export class CustomerNameComponent implements OnInit, OnChanges {
  @Input({ required: true }) customerId!: string;
  private coreStore = inject(CoreStore);

  name = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<boolean>(false);

  ngOnInit() {
    this.fetchCustomer();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['customerId'] && !changes['customerId'].isFirstChange()) {
      this.fetchCustomer();
    }
  }

  private fetchCustomer() {
    if (!this.customerId) return;
    
    this.loading.set(true);
    this.error.set(false);
    
    this.coreStore.getCustomerByIdObservable(this.customerId).subscribe({
      next: (customer) => {
        this.name.set(customer.isCorporate ? customer.businessName : `${customer.firstName} ${customer.lastName}`);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }
}
