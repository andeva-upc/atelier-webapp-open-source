import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { BillingStore } from '../../../application/billing.store';
import { Modal } from '../../../shared/presentation/modal/modal';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';


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
    Modal,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './billing-list.html',
  styleUrl: './billing-list.css',
})
export class BillingList implements OnInit {
  private readonly store = inject(BillingStore);

  /** Computed total income from store */
  readonly totalIncomeValue = this.store.totalIncome;

  /** Signal to control the visibility of the new quote modal */
  readonly isQuoteModalOpen = signal(false);

  /** Form group for the new quote */
  quoteForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initQuoteForm();
  }

  private initQuoteForm(): void {
    this.quoteForm = this.fb.group({
      customerId: ['', Validators.required],
      customerName: ['', Validators.required],
      vehicle: [''],
      discountAmount: [0, [Validators.min(0)]],
      items: this.fb.array([])
    });
  }

  get items(): FormArray {
    return this.quoteForm.get('items') as FormArray;
  }

  openQuoteModal(): void {
    this.isQuoteModalOpen.set(true);
    this.initQuoteForm();
    this.addItem(); // Start with one empty item
  }

  closeQuoteModal(): void {
    this.isQuoteModalOpen.set(false);
  }

  addItem(): void {
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

  onSubmitQuote(): void {
    if (this.quoteForm.valid) {
      const formValue = this.quoteForm.value;
      
      // Calculate totals
      const subtotal = formValue.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
      const discount = formValue.discountAmount || 0;
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
      });
    }
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
        variacion = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
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
    const product = this.availableProducts().find(p => 
      p.name.toLowerCase() === description.toLowerCase() || 
      p.id === description
    );
    return product ? product.stock >= quantity : false;
  }

  calculateSubtotal(): number {
    const items = this.quoteForm.get('items')?.value || [];
    return items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
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
