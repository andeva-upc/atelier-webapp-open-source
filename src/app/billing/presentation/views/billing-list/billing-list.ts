import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BillingStore } from '../../../application/billing.store';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


/**
 * Main presentation component for the Billing bounded context.
 *
 * @remarks
 * Renders financial KPI summary cards, a monthly income/expense chart area,
 * a detailed vouchers table and a quotations table in a tabbed layout.
 * All state is consumed reactively via {@link BillingStore} Angular Signals.
 */
@Component({
  selector: 'app-billing-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  templateUrl: './billing-list.html',
  styleUrl: './billing-list.css',
})
export class BillingList implements OnInit {
  private readonly store = inject(BillingStore);
  private readonly dialog = inject(MatDialog);

  /** Computed total income from store */
  readonly totalIncomeValue = this.store.totalIncome;

  /** Signal to control the visibility of the new quote modal */
  readonly isQuoteModalOpen = signal(false);

  /** Signal to control the visibility of the payment modal */
  readonly isPaymentModalOpen = signal(false);

  /** Currently selected voucher for payment */
  readonly selectedVoucher = signal<any | null>(null);

  readonly availableCustomers = this.store.customers;
  private customerNameValue!: any;
  filteredCustomers!: any;

  /** Form group for the new quote */
  quoteForm!: FormGroup;

  /** Form group for payment registration */
  paymentForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initForms();
    
    this.customerNameValue = toSignal(
      this.quoteForm.get('customerName')!.valueChanges,
      { initialValue: '' }
    );

    this.filteredCustomers = computed(() => {
      const query = this.customerNameValue();
      const all = this.availableCustomers();
      
      if (!query || typeof query !== 'string') return all.slice(0, 5);
      
      const lowQuery = query.toLowerCase();
      return all.filter(c => 
        c.fullName.toLowerCase().includes(lowQuery) || 
        c.documentNumber.includes(lowQuery)
      );
    });
  }

  private initForms(): void {
    this.quoteForm = this.fb.group({
      customerId: ['', Validators.required],
      customerName: ['', Validators.required],
      vehicle: [''],
      discountAmount: [0, [Validators.min(0)]],
      items: this.fb.array([])
    });

    this.paymentForm = this.fb.group({
      amount: [0, [Validators.required]], // This is the total to pay
      receivedAmount: [0, [Validators.required, Validators.min(0.01)]],
      method: ['CASH', Validators.required]
    });
  }

  get items(): FormArray {
    return this.quoteForm.get('items') as FormArray;
  }

  openQuoteModal(template: any): void {
    this.quoteForm.reset();
    this.items.clear();
    this.addItem();
    this.dialog.open(template, {
      width: '950px',
      panelClass: 'custom-dialog-container'
    });
  }

  closeQuoteModal(): void {
    this.dialog.closeAll();
    this.isQuoteModalOpen.set(false);
  }

  openPaymentModal(voucher: any, template: any): void {
    this.selectedVoucher.set(voucher);
    this.paymentForm.patchValue({
      amount: voucher.totalAmount,
      receivedAmount: voucher.totalAmount,
      method: 'CASH'
    });
    this.dialog.open(template, {
      width: '450px',
      panelClass: 'custom-dialog-container'
    });
  }

  closePaymentModal(): void {
    this.isPaymentModalOpen.set(false);
    this.selectedVoucher.set(null);
  }

  onRegisterPayment(): void {
    if (this.paymentForm.valid && this.selectedVoucher()) {
      const { amount, receivedAmount, method } = this.paymentForm.value;
      const entity = this.selectedVoucher();
      const entityTotal = entity.totalAmount;

      // US028: Reject if received amount is less than total due
      if (receivedAmount < entityTotal) {
        return;
      }

      // Check if it's a Quote or a Voucher
      const isQuote = !!entity.quoteNumber;

      if (isQuote) {
        // US028: If it's a quote, "paying" it means approving it
        this.store.approveQuote(entity.id, entity.version || 0, () => {
          this.dialog.closeAll();
          this.selectedTab.set(1); // Stay/Switch to quotes to see "APPROVED"
        });
      } else {
        // If it's a voucher, register the financial movement
        this.store.registerPayment(entity.id, entityTotal, method);
        this.dialog.closeAll();
      }
    }
  }

  /**
   * US028: Calculates change (vuelto) for the payment.
   */
  calculateChange(): number {
    const received = this.paymentForm.get('receivedAmount')?.value || 0;
    const total = this.paymentForm.get('amount')?.value || 0;
    return Math.max(0, received - total);
  }

  /**
   * US028: Checks if the received amount is sufficient.
   */
  isAmountSufficient(): boolean {
    const received = this.paymentForm.get('receivedAmount')?.value || 0;
    const total = this.paymentForm.get('amount')?.value || 0;
    return received >= total;
  }

  addItem(): void {
    if (this.items.length >= 10) {
      alert('Límite alcanzado: No puedes agregar más de 10 ítems por cotización.');
      return;
    }
    const itemForm = this.fb.group({
      type: ['SERVICE', Validators.required],
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
    this.items.push(itemForm);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onCustomerSelected(event: any): void {
    const customer = event.option.value;
    this._fillCustomerData(customer);
  }

  private _fillCustomerData(customer: any): void {
    this.quoteForm.patchValue({
      customerId: customer.id,
      customerName: customer.fullName,
      vehicle: customer.vehiclesSummary !== 'Sin vehículos registrados' ? customer.vehiclesSummary.split(', ')[0] : ''
    });
  }

  onSubmitQuote(): void {
    // If no customerId, try to find an exact match by name
    if (!this.quoteForm.get('customerId')?.value) {
      const name = this.quoteForm.get('customerName')?.value;
      const match = this.availableCustomers().find(c => c.fullName.toLowerCase() === name?.toLowerCase());
      if (match) {
        this._fillCustomerData(match);
      }
    }

    if (this.quoteForm.invalid) {
      alert('Por favor, selecciona un cliente de la lista y asegúrate de que todos los campos obligatorios estén llenos.');
      return;
    }

    const formValue = this.quoteForm.value;
      
      // Calculate totals
      const subtotal = formValue.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
      const discount = formValue.discountAmount || 0;

      // US029: Reject if discount exceeds business limit (30% of subtotal)
      const maxDiscount = subtotal * 0.3;
      if (discount > maxDiscount) {
        alert(`Restricción de Negocio (US029): El descuento aplicado (S/ ${discount}) no puede superar el 30% del subtotal (Máximo: S/ ${maxDiscount.toFixed(2)}).`);
        return;
      }

      const taxableAmount = Math.max(0, subtotal - discount);
      const taxRate = 18; // 18% IGV
      const taxAmount = Math.round(taxableAmount * (taxRate / 100) * 100) / 100;
      const totalAmount = taxableAmount + taxAmount;

      const newQuote: any = {
        id: crypto.randomUUID(),
        workshopId: 'e26b1580-b3b0-466d-8c10-ca7f62d1c9ef', // Mock workshop ID
        customerId: formValue.customerId,
        customerName: formValue.customerName,
        quoteNumber: `COT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        status: 'DRAFT',
        items: formValue.items.map((item: any) => ({
          id: crypto.randomUUID(),
          type: item.type,
          referenceId: null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        })),
        subtotal,
        discountAmount: discount,
        taxRate,
        taxAmount,
        totalAmount,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days validity
        createdAt: new Date().toISOString(),
        approvedAt: null,
        notes: '',
        vehicle: formValue.vehicle,
        version: 0
      };

      this.store.createQuote(newQuote, () => {
        this.closeQuoteModal();
        this.selectedTab.set(1); // Switch to Quotations tab to see the new quote
      });
  }

  /** Computed total expenses (simulated as 40% of income for now since no expense data exists) */
  readonly totalExpensesValue = computed(() => this.totalIncomeValue() * 0.4);



  /** Computed count of approved quotations */
  readonly approvedQuotesCount = this.store.approvedQuotesCount;

  /** Computed count of pending quotations */
  readonly pendingQuotesCount = this.store.pendingQuotesCount;

  /** Reactive signal from store — full list of quotes */
  readonly quotes = this.store.quotes;

  /** Reactive signal from store — inventory products */
  readonly availableProducts = this.store.products;

  /** Reactive signal from store — full list of vouchers */
  readonly vouchers = this.store.vouchers;

  /** Table columns for vouchers */
  readonly voucherColumns = ['voucherNumber', 'customerName', 'issuedAt', 'totalAmount', 'status', 'actions'];

  /** Loading state for quotes */
  readonly quotesLoading = this.store.quotesLoading;

  /** Columns to display in the quotes table */
  readonly quoteColumns: string[] = [
    'quoteNumber', 'customerName', 'vehicle', 'items', 'totalAmount', 'status', 'createdAt', 'actions'
  ];

  /** Currently selected tab index (0 = Ingresos y gastos, 1 = Cotizaciones) */
  readonly selectedTab = signal<number>(0);

  /** Computed monthly financial data derived from vouchers */
  readonly monthlyRows = computed(() => {
    const vouchers = this.store.vouchers();
    const months = ['billing.months.jan', 'billing.months.feb', 'billing.months.mar', 'billing.months.apr', 'billing.months.may'];
    
    return months.map((monthKey, index) => {
      // Month index is 0-based, so Jan=0, Feb=1, etc.
      // Filter vouchers for this month (assuming 2026 for now as per user structure)
      const monthVouchers = vouchers.filter(v => {
        const date = new Date(v.issuedAt);
        return date.getMonth() === index && date.getFullYear() === 2026;
      });

      const ingresos = monthVouchers.reduce((sum, v) => sum + v.totalAmount, 0);
      // Simulate expenses as 40% of income for the month
      const gastos = ingresos * 0.4;

      return {
        month: monthKey,
        ingresos,
        gastos,
        rentabilidad: ingresos - gastos,
        // Variation will be calculated in the table if needed, but here we just return the base data
        variacion: '' 
      };
    });
  });

  /** Columns to display in the monthly details table */
  readonly detailColumns: string[] = ['month', 'ingresos', 'gastos', 'rentabilidad', 'variacion'];

  /** Computed monthly details with formatted rentabilidad and variacion */
  readonly monthlyDetails = computed(() => {
    let prevRentabilidad: number | null = null;
    return this.monthlyRows().map(row => {
      const rentabilidad = row.ingresos - row.gastos;
      let variacion = '—';
      if (prevRentabilidad !== null && prevRentabilidad !== 0) {
        const diff = ((rentabilidad - prevRentabilidad) / prevRentabilidad) * 100;
        variacion = `${diff > 0 ? '+' : ''}${diff.toFixed(3)}%`;
      }
      prevRentabilidad = rentabilidad;
      return {
        ...row,
        rentabilidad,
        variacion
      };
    });
  });

  // ── SVG Chart geometry ────────────────────────────────────────────────────

  readonly svgW = 900;
  readonly svgH = 300;
  readonly padLeft = 60;
  readonly padTop = 30;
  readonly padBottom = 60;
  readonly chartW = this.svgW - this.padLeft - 20;
  readonly chartH = this.svgH - this.padTop - this.padBottom;
  /** Computed Y-axis maximum value based on data, with a minimum of 1000 */
  readonly yMax = computed(() => {
    const data = this.monthlyRows();
    const maxVal = data.reduce((max, row) => Math.max(max, row.ingresos, row.gastos), 0);
    return Math.max(maxVal * 1.2, 1000); // Add 20% margin
  });

  readonly chartGroups = computed(() => {
    const data = this.monthlyRows();
    const groupWidth = this.chartW / data.length;
    // We will render two bars per month side by side
    const barWidth = (groupWidth * 0.4) / 2;
    const gap = 4;

    return data.map((row, i) => {
      const groupCenterX = this.padLeft + (i + 0.5) * groupWidth;
      
      const yMax = this.yMax();
      const ingresosH = yMax > 0 ? (row.ingresos / yMax) * this.chartH : 0;
      const gastosH = yMax > 0 ? (row.gastos / yMax) * this.chartH : 0;

      return {
        label: row.month,
        ingresosX: groupCenterX - barWidth - gap / 2,
        ingresosY: this.padTop + this.chartH - ingresosH,
        ingresosH,
        gastosX: groupCenterX + gap / 2,
        gastosY: this.padTop + this.chartH - gastosH,
        gastosH,
        barWidth,
        labelX: groupCenterX
      };
    });
  });

  readonly yAxisLabels = computed(() => {
    const max = this.yMax();
    return [0, max * 0.25, max * 0.5, max * 0.75, max].map(val => ({
      val: val === 0 ? 'S/0' : `S/${(val / 1000).toFixed(1)}k`,
      y: this.padTop + this.chartH - (max > 0 ? (val / max) * this.chartH : 0)
    }));
  });

  ngOnInit(): void {
    this.store.loadVouchers();
    this.store.loadQuotes();
    this.store.loadProducts();
    this.store.loadCustomers();
  }

  /**
   * Checks if a product has sufficient stock.
   * 
   * @param description - Item description to match.
   * @param quantity - Requested quantity.
   * @returns True if stock is sufficient or if it's a service.
   */
  hasSufficientStock(description: string, quantity: number, type: string): boolean {
    if (type === 'SERVICE') return true;
    
    // US026: Do not show warning if description is empty or just whitespace
    if (!description || !description.trim()) return true;

    const product = this.availableProducts().find((p: any) => 
      p.name.toLowerCase() === description.trim().toLowerCase() || 
      p.id === description
    );

    // Only alert if the product is found and its stock is insufficient
    if (product) {
      return product.current_stock >= quantity;
    }

    // If product is not found, we don't have stock data, so we don't alert yet
    return true;
  }

  calculateSubtotal(): number {
    const items = this.quoteForm.get('items')?.value || [];
    return items.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
  }

  calculateTax(): number {
    const subtotal = this.calculateSubtotal();
    const discount = this.quoteForm.get('discountAmount')?.value || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    return Math.round(taxableAmount * 0.18 * 100) / 100;
  }

  calculateTotal(): number {
    const subtotal = this.calculateSubtotal();
    const discount = this.quoteForm.get('discountAmount')?.value || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    return taxableAmount + this.calculateTax();
  }

  /**
   * Maps a Quote status to a human readable label.
   */
  getQuoteStatusLabel(status: string): string {
    return `billing.quote.status.${status.toLowerCase()}`;
  }

  /**
   * Maps a Quote status to a CSS class for the pill.
   */
  getQuoteStatusClass(status: string): string {
    const map: Record<string, string> = {
      APPROVED: 'chip-success',
      DRAFT: 'chip-warning',
      SENT: 'chip-info',
      REJECTED: 'chip-error',
      EXPIRED: 'chip-error',
    };
    return map[status] ?? 'chip-default';
  }

  /**
   * Returns CSS class based on variacion string value.
   */
  getVariacionClass(variacion: string): string {
    if (variacion === '—') return 'gray-text';
    return variacion.startsWith('+') ? 'text-green' : 'text-red';
  }
}
