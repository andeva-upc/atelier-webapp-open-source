import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CoreStore } from '../../../../core/application/core.store';
import { OperationsStore } from '../../../application/operations.store';
import { InventoryStore } from '../../../../inventory/application/inventory.store';

import { AddTaskToWorkOrderCommand } from '../../../domain/model/commands/add-task-to-work-order.command';
import { UpdateWorkOrderTaskDetailsCommand } from '../../../domain/model/commands/update-work-order-task-details.command';
import { AddProductToTaskCommand } from '../../../domain/model/commands/add-product-to-task.command';
import { UpdateProductQuantityInTaskCommand } from '../../../domain/model/commands/update-product-quantity-in-task.command';

import { MechanicSelectorComponent } from '../../../../fleet/presentation/components/mechanic-selector/mechanic-selector';
import { ProductSelectorComponent } from '../../../../inventory/presentation/components/product-selector/product-selector';
import { TranslateModule } from '@ngx-translate/core';

interface AddedProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  taskProductId?: string;
  stockQuantity?: number;
}

@Component({
  selector: 'app-task-form-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MechanicSelectorComponent, ProductSelectorComponent, TranslateModule],
  templateUrl: './task-form-view.html',
  styleUrl: './task-form-view.css'
})
export class TaskFormViewComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private coreStore = inject(CoreStore);
  private operationsStore = inject(OperationsStore);
  private inventoryStore = inject(InventoryStore);

  workOrderId: string | null = null;
  taskId: string | null = null;
  branchId = signal<string | null>(null);

  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  selectedMechanicId = signal<string>('');
  selectedService = signal<{ id: string, name: string, price: number } | null>(null);
  selectedStatus = signal<string>('PENDING');
  description = signal<string>('');
  addedProducts = signal<AddedProduct[]>([]);

  private originalProducts: AddedProduct[] = [];

  isServiceDropdownOpen = signal<boolean>(false);
  isProductModalOpen = signal<boolean>(false);

  isEditingProduct = signal<boolean>(false);
  editingProductIndex = signal<number | null>(null);
  selectedProductForModal = signal<{ id: string, name: string, price: number, stockQuantity: number } | null>(null);
  tempProductQuantity = signal<number>(1);

  statusList = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

  totalPrice = computed(() => {
    const servicePrice = this.selectedService()?.price || 0;
    const productsPrice = this.addedProducts().reduce(
      (sum, p) => sum + p.price * p.quantity, 0
    );
    return servicePrice + productsPrice;
  });

  modalProductTotalPrice = computed(() => {
    const price = this.selectedProductForModal()?.price || 0;
    return price * this.tempProductQuantity();
  });

  availableStockForModal = computed(() => {
    const selectedProd = this.selectedProductForModal();
    if (!selectedProd) return 0;

    const s_db = selectedProd.stockQuantity;
    const q_db = this.originalProducts.find(o => o.id === selectedProd.id)?.quantity || 0;

    let q_mem = 0;
    if (this.isEditingProduct()) {
      q_mem = 0; // replacing the entire item quantity, so we don't subtract it from available stock
    } else {
      const existing = this.addedProducts().find(p => p.id === selectedProd.id);
      q_mem = existing ? existing.quantity : 0;
    }

    return s_db + q_db - q_mem;
  });


  constructor() {
    effect(() => {
      const branch = this.coreStore.currentBranch();
      if (branch?.id) {
        this.branchId.set(branch.id.toString());
        this.operationsStore.loadServicesByBranchId(branch.id.toString());
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.workOrderId = this.route.snapshot.paramMap.get('workOrderId');
    this.taskId = this.route.snapshot.paramMap.get('id');

    if (this.taskId && this.workOrderId) {
      this.isEditMode.set(true);
      this.loadTaskData(this.workOrderId, this.taskId);
    }
  }

  get servicesList() {
    return this.operationsStore.currentBranchServices();
  }

  private loadTaskData(workOrderId: string, taskId: string) {
    this.isLoading.set(true);
    this.operationsStore.getWorkOrderByIdObservable(workOrderId).subscribe({
      next: (order) => {
        const task = (order.tasks || []).find((t: any) => t.id === taskId);
        if (!task) {
          console.error('Task not found in work order');
          this.isLoading.set(false);
          return;
        }

        this.selectedStatus.set(task.status || 'PENDING');
        this.description.set(task.description || '');

        if (task.assignedMechanicId) {
          this.selectedMechanicId.set(task.assignedMechanicId);
        }

        if (task.serviceId) {
          const trySelectService = () => {
            const matched = this.servicesList.find(s => s.id === task.serviceId);
            if (matched) {
              this.selectedService.set({ id: matched.id, name: matched.name, price: matched.price });
            } else if (this.servicesList.length === 0) {
              setTimeout(trySelectService, 300);
            }
          };
          trySelectService();
        }

        if (task.products && task.products.length > 0) {
          const productProfileRequests = task.products.map((tp: any) =>
            this.inventoryStore.getProductByIdObservable(tp.productId)
          );
          forkJoin(productProfileRequests).subscribe({
            next: (prods: any[]) => {
              const addedProds: AddedProduct[] = prods.map((p: any, i: number) => ({
                id: p.id,
                name: p.name,
                price: p.salePrice,
                quantity: task.products[i].quantity,
                taskProductId: task.products[i].id,
                stockQuantity: p.currentStock
              }));
              this.addedProducts.set(addedProds);
              this.originalProducts = [...addedProds];
            },
            error: (err) => console.error('Failed to load task product details:', err)
          });
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load work order for task editing:', err);
        this.isLoading.set(false);
      }
    });
  }

  onMechanicSelected(mechanicId: string) {
    this.selectedMechanicId.set(mechanicId);
  }

  selectService(service: any) {
    this.selectedService.set({ id: service.id, name: service.name, price: service.price });
    this.isServiceDropdownOpen.set(false);
    if (this.description().trim() === '') {
      this.description.set(`Perform standard ${service.name}.`);
    }
  }

  selectStatus(status: string) {
    this.selectedStatus.set(status);
  }

  openProductModal() {
    this.isEditingProduct.set(false);
    this.editingProductIndex.set(null);
    this.selectedProductForModal.set(null);
    this.tempProductQuantity.set(1);
    this.isProductModalOpen.set(true);
  }

  openEditProductModal(product: AddedProduct, index: number) {
    this.isEditingProduct.set(true);
    this.editingProductIndex.set(index);
    this.selectedProductForModal.set({
      id: product.id,
      name: product.name,
      price: product.price,
      stockQuantity: product.stockQuantity || 99999
    });
    this.tempProductQuantity.set(product.quantity);
    this.isProductModalOpen.set(true);
  }

  closeProductModal() {
    this.isProductModalOpen.set(false);
  }

  onModalProductSelected(productInfo: {id: string, name: string, stockQuantity: number, price: number}) {
    this.selectedProductForModal.set({
      id: productInfo.id,
      name: productInfo.name,
      price: productInfo.price,
      stockQuantity: productInfo.stockQuantity
    });
  }

  saveProductModalChanges() {
    const selectedProd = this.selectedProductForModal();
    const qty = this.tempProductQuantity();
    const available = this.availableStockForModal();
    if (!selectedProd || qty <= 0) return;

    if (qty > available) {
      alert(`No hay suficiente stock. Stock disponible: ${available}`);
      return;
    }

    if (this.isEditingProduct()) {
      const idx = this.editingProductIndex();
      if (idx !== null) {
        this.addedProducts.update(products =>
          products.map((p, i) => i === idx ? { ...p, quantity: qty } : p)
        );
      }
    } else {
      this.addedProducts.update(products => {
        const existing = products.find(p => p.id === selectedProd.id);
        if (existing) {
          return products.map(p => p.id === selectedProd.id ? { ...p, quantity: p.quantity + qty } : p);
        } else {
          return [...products, {
            id: selectedProd.id,
            name: selectedProd.name,
            price: selectedProd.price,
            quantity: qty,
            stockQuantity: selectedProd.stockQuantity
          }];
        }
      });
    }
    this.closeProductModal();
  }

  removeProduct(prodId: string) {
    this.addedProducts.update(products => products.filter(p => p.id !== prodId));
  }

  saveChanges() {
    if (!this.workOrderId) {
      alert('Error: No se encontró el ID de la orden de trabajo.');
      this.router.navigate(['/work-orders']);
      return;
    }
    if (!this.selectedMechanicId()) {
      alert('Por favor seleccioná un mecánico.');
      return;
    }
    if (!this.selectedService()) {
      alert('Por favor seleccioná un servicio.');
      return;
    }
    if (this.description().trim().length < 5) {
      alert('La descripción debe tener al menos 5 caracteres.');
      return;
    }

    if (this.isEditMode() && this.taskId) {
      this.updateTask();
    } else {
      this.createTask();
    }
  }

  private createTask() {
    const command = new AddTaskToWorkOrderCommand(
      this.selectedService()!.id,
      this.selectedMechanicId(),
      this.description().trim()
    );

    // Using Observable to chain products
    this.operationsStore.getOperationsApi().workOrders.addTask(this.workOrderId!, command).subscribe({
      next: (updatedOrder) => {
        const tasks = updatedOrder.tasks || [];
        const newTask = tasks[tasks.length - 1];

        if (newTask && this.addedProducts().length > 0) {
          this.addProductsToTask(this.workOrderId!, newTask.id, this.addedProducts());
        } else {
          this.goBack();
        }
      },
      error: (err) => {
        console.error('Failed to create task:', err);
        alert('Error al crear la tarea. Verificá la consola para más detalles.');
      }
    });
  }

  private updateTask() {
    const command = new UpdateWorkOrderTaskDetailsCommand(
      this.selectedService()!.id,
      this.selectedMechanicId(),
      this.description().trim()
    );

    this.operationsStore.getOperationsApi().workOrders.updateTaskDetails(this.workOrderId!, this.taskId!, command).subscribe({
      next: () => {
        this.syncProducts();
      },
      error: (err) => {
        console.error('Failed to update task:', err);
        alert('Error al actualizar la tarea.');
      }
    });
  }

  private addProductsToTask(workOrderId: string, taskId: string, products: AddedProduct[]) {
    const api = this.operationsStore.getOperationsApi();
    const addCalls = products.map(p => {
      const cmd = new AddProductToTaskCommand(p.id, p.quantity);
      return api.workOrderTasks.addProductToTask(taskId, cmd);
    });

    forkJoin(addCalls).subscribe({
      next: () => this.goBack(),
      error: (err) => {
        console.error('Failed to add products to task:', err);
        this.goBack(); 
      }
    });
  }

  private syncProducts() {
    const current = this.addedProducts();
    const original = this.originalProducts;
    const api = this.operationsStore.getOperationsApi();

    const toAdd = current.filter(p => !original.find(o => o.id === p.id));
    const toRemove = original.filter(o => !current.find(p => p.id === o.id));
    const toUpdate = current.filter(p => {
      const orig = original.find(o => o.id === p.id);
      return orig && orig.quantity !== p.quantity;
    });

    const calls: any[] = [];

    toAdd.forEach(p => {
      const cmd = new AddProductToTaskCommand(p.id, p.quantity);
      calls.push(api.workOrderTasks.addProductToTask(this.taskId!, cmd));
    });

    toRemove.forEach(p => {
      calls.push(api.workOrderTasks.removeProductFromTask(this.taskId!, p.id));
    });

    toUpdate.forEach(p => {
      const cmd = new UpdateProductQuantityInTaskCommand(p.id, p.quantity);
      calls.push(api.workOrderTasks.updateProductQuantityInTask(this.taskId!, p.id, cmd));
    });

    if (calls.length === 0) {
      this.goBack();
      return;
    }

    forkJoin(calls).subscribe({
      next: () => this.goBack(),
      error: (err) => {
        console.error('Failed to sync products:', err);
        this.goBack();
      }
    });

  }

  private goBack() {
    this.router.navigate(['/work-orders'], {
      queryParams: { expandedOrderId: this.workOrderId }
    });
  }
}
