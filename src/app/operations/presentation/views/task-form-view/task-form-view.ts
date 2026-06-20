import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CoreStore } from '../../../../core/application/core.store';
import { CoreApi } from '../../../../core/infrastructure/core-api';
import { FleetApi } from '../../../../fleet/infrastructure/fleet-api';
import { OperationsApi } from '../../../infrastructure/operations-api';
import { InventoryApi } from '../../../../inventory/infrastructure/inventory-api';

import { AddTaskToWorkOrderCommand } from '../../../domain/model/commands/add-task-to-work-order.command';
import { UpdateWorkOrderTaskDetailsCommand } from '../../../domain/model/commands/update-work-order-task-details.command';
import { AddProductToTaskCommand } from '../../../domain/model/commands/add-product-to-task.command';
import { UpdateProductQuantityInTaskCommand } from '../../../domain/model/commands/update-product-quantity-in-task.command';

// ---- View Models -------------------------------------------------------
interface ServiceOption {
  id: string;
  name: string;
  price: number;
}

interface MechanicOption {
  id: string;       // employeeId (UUID used in API calls)
  name: string;     // "firstName lastName"
  speciality: string;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
  sku: string;
  currentStock: number;
}

interface AddedProduct extends ProductOption {
  quantity: number;
  taskProductId?: string; // set when loaded in edit mode (for DELETE calls)
}
// -----------------------------------------------------------------------

@Component({
  selector: 'app-task-form-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './task-form-view.html',
  styleUrl: './task-form-view.css'
})
export class TaskFormViewComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private coreStore = inject(CoreStore);
  private coreApi = inject(CoreApi);
  private fleetApi = inject(FleetApi);
  private operationsApi = inject(OperationsApi);
  private inventoryApi = inject(InventoryApi);

  workOrderId: string | null = null;
  taskId: string | null = null;

  // --- Modo Edición vs Creación ---
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // --- Campos del Formulario ---
  mechanicInput = signal<string>('');
  selectedMechanicId = signal<string>('');
  selectedService = signal<ServiceOption | null>(null);
  selectedStatus = signal<string>('PENDING');
  description = signal<string>('');
  addedProducts = signal<AddedProduct[]>([]);

  // Productos originales (edit mode) para comparar y gestionar diffs
  private originalProducts: AddedProduct[] = [];

  // --- Listas del Backend ---
  servicesList = signal<ServiceOption[]>([]);
  mechanicsList = signal<MechanicOption[]>([]);
  productsList = signal<ProductOption[]>([]);

  statusList = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

  // --- Estados de Modales / Dropdowns ---
  isMechanicDropdownOpen = signal<boolean>(false);
  isServiceDropdownOpen = signal<boolean>(false);
  isStatusDropdownOpen = signal<boolean>(false);
  isProductModalOpen = signal<boolean>(false);

  // --- Para Agregar/Editar Producto en Modal ---
  isEditingProduct = signal<boolean>(false);
  editingProductIndex = signal<number | null>(null);
  productSearchInput = signal<string>('');
  selectedProductForModal = signal<ProductOption | null>(null);
  tempProductQuantity = signal<number>(1);
  isProductDropdownOpen = signal<boolean>(false);

  // --- Filtros Reactivos ---
  filteredMechanics = computed(() => {
    const search = this.mechanicInput().toLowerCase().trim();
    const list = this.mechanicsList();
    if (search === '') return list;
    return list.filter(m => m.name.toLowerCase().includes(search));
  });

  filteredProducts = computed(() => {
    const search = this.productSearchInput().toLowerCase().trim();
    const list = this.productsList();
    if (search === '') return list;
    return list.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search)
    );
  });

  // --- Precio Total Automático ---
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

  constructor() {
    // Reactively load services, mechanics and products when branch changes
    effect(() => {
      const branch = this.coreStore.currentBranch();
      if (branch?.id) {
        this.loadBranchData(branch.id.toString());
      }
    });
  }

  ngOnInit() {
    // workOrderId comes from query params (both create and edit)
    this.route.queryParams.subscribe(qParams => {
      this.workOrderId = qParams['workOrderId'] || null;
    });

    this.taskId = this.route.snapshot.paramMap.get('id');

    if (this.taskId && this.workOrderId) {
      this.isEditMode.set(true);
      this.loadTaskData(this.workOrderId, this.taskId);
    }
  }

  // ---- Data Loading ----------------------------------------------------

  private loadBranchData(branchId: string) {
    // Load services, mechanics (employee registrations), and products in parallel
    forkJoin({
      services: this.operationsApi.services.getByBranchId(branchId),
      employeeRegs: this.fleetApi.employeeRegistrations.getByBranchId(branchId),
      products: this.inventoryApi.products.getByBranchId(branchId)
    }).subscribe({
      next: ({ services, employeeRegs, products }) => {
        // Map services
        this.servicesList.set(services.map(s => ({
          id: s.id,
          name: s.name,
          price: s.price
        })));

        // Map products
        this.productsList.set(products.map(p => ({
          id: p.id,
          name: p.name,
          price: p.salePrice,
          sku: p.sku,
          currentStock: p.currentStock
        })));

        // Load employee profiles for each active registration to get names
        const activeRegs = employeeRegs.filter(r => r.status === 'ACTIVE');
        if (activeRegs.length === 0) {
          this.mechanicsList.set([]);
          return;
        }

        const profileRequests = activeRegs.map(r => this.coreApi.employees.getById(r.employeeId));
        forkJoin(profileRequests).subscribe({
          next: (profiles) => {
            const mechanics = profiles.map((p, i) => ({
              id: activeRegs[i].employeeId,
              name: `${p.firstName} ${p.lastName}`,
              speciality: activeRegs[i].speciality
            }));
            this.mechanicsList.set(mechanics);
          },
          error: (err) => console.error('Failed to load mechanic profiles:', err)
        });
      },
      error: (err) => console.error('Failed to load branch data for task form:', err)
    });
  }

  private loadTaskData(workOrderId: string, taskId: string) {
    this.isLoading.set(true);
    this.operationsApi.workOrders.getById(workOrderId).subscribe({
      next: (order) => {
        const task = (order.tasks || []).find((t: any) => t.id === taskId);
        if (!task) {
          console.error('Task not found in work order');
          this.isLoading.set(false);
          return;
        }

        this.selectedStatus.set(task.status || 'PENDING');
        this.description.set(task.description || '');

        // Pre-select mechanic
        if (task.assignedMechanicId) {
          this.selectedMechanicId.set(task.assignedMechanicId);
          this.coreApi.employees.getById(task.assignedMechanicId).subscribe({
            next: (emp) => this.mechanicInput.set(`${emp.firstName} ${emp.lastName}`),
            error: () => this.mechanicInput.set(task.assignedMechanicId)
          });
        }

        // Pre-select service (wait for servicesList to load)
        if (task.serviceId) {
          const trySelectService = () => {
            const matched = this.servicesList().find(s => s.id === task.serviceId);
            if (matched) {
              this.selectedService.set(matched);
            } else if (this.servicesList().length === 0) {
              // Services not loaded yet, retry after a tick
              setTimeout(trySelectService, 300);
            }
          };
          trySelectService();
        }

        // Load existing products
        if (task.products && task.products.length > 0) {
          const productProfileRequests = task.products.map((tp: any) =>
            this.inventoryApi.products.getById(tp.productId)
          );
          forkJoin(productProfileRequests).subscribe({
            next: (prods: any[]) => {
              const addedProds: AddedProduct[] = prods.map((p: any, i: number) => ({
                id: p.id,
                name: p.name,
                price: p.salePrice,
                sku: p.sku,
                currentStock: p.currentStock,
                quantity: task.products[i].quantity,
                taskProductId: task.products[i].id
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

  // ---- Mechanic Selection ----------------------------------------------
  selectMechanic(mech: MechanicOption) {
    this.mechanicInput.set(mech.name);
    this.selectedMechanicId.set(mech.id);
    this.isMechanicDropdownOpen.set(false);
  }

  // ---- Service Selection -----------------------------------------------
  selectService(service: ServiceOption) {
    this.selectedService.set(service);
    this.isServiceDropdownOpen.set(false);
    if (this.description().trim() === '') {
      this.description.set(`Perform standard ${service.name}.`);
    }
  }

  // ---- Status Selection -----------------------------------------------
  selectStatus(status: string) {
    this.selectedStatus.set(status);
    this.isStatusDropdownOpen.set(false);
  }

  // ---- Product Modal ---------------------------------------------------
  openProductModal() {
    this.isEditingProduct.set(false);
    this.editingProductIndex.set(null);
    const list = this.productsList();
    if (list.length > 0) {
      this.selectedProductForModal.set(list[0]);
      this.productSearchInput.set(list[0].name);
    } else {
      this.selectedProductForModal.set(null);
      this.productSearchInput.set('');
    }
    this.tempProductQuantity.set(1);
    this.isProductModalOpen.set(true);
  }

  openEditProductModal(product: AddedProduct, index: number) {
    this.isEditingProduct.set(true);
    this.editingProductIndex.set(index);
    const original = this.productsList().find(p => p.id === product.id) || product;
    this.selectedProductForModal.set(original);
    this.productSearchInput.set(original.name);
    this.tempProductQuantity.set(product.quantity);
    this.isProductModalOpen.set(true);
  }

  closeProductModal() {
    this.isProductModalOpen.set(false);
    this.isProductDropdownOpen.set(false);
  }

  saveProductModalChanges() {
    const selectedProd = this.selectedProductForModal();
    const qty = this.tempProductQuantity();
    if (!selectedProd || qty <= 0) return;

    if (this.isEditingProduct()) {
      const idx = this.editingProductIndex();
      if (idx !== null) {
        this.addedProducts.update(products =>
          products.map((p, i) => i === idx
            ? { ...p, quantity: qty }
            : p
          )
        );
      }
    } else {
      this.addedProducts.update(products => {
        const existing = products.find(p => p.id === selectedProd.id);
        if (existing) {
          return products.map(p =>
            p.id === selectedProd.id ? { ...p, quantity: p.quantity + qty } : p
          );
        } else {
          return [...products, { ...selectedProd, quantity: qty }];
        }
      });
    }
    this.closeProductModal();
  }

  selectModalProduct(prod: ProductOption) {
    this.selectedProductForModal.set(prod);
    this.productSearchInput.set(prod.name);
    this.isProductDropdownOpen.set(false);
  }

  onProductSearchBlur() {
    setTimeout(() => this.isProductDropdownOpen.set(false), 200);
  }

  removeProduct(prodId: string) {
    this.addedProducts.update(products => products.filter(p => p.id !== prodId));
  }

  // ---- Save (Create / Edit) -------------------------------------------
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
      this.description().trim(),
      this.selectedService()!.price
    );

    this.operationsApi.workOrders.addTask(this.workOrderId!, command).subscribe({
      next: (updatedOrder) => {
        // Find the newly created task (last in the list)
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
      this.description().trim(),
      this.selectedService()!.price
    );

    this.operationsApi.workOrders.updateTaskDetails(this.workOrderId!, this.taskId!, command).subscribe({
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
    const addCalls = products.map(p => {
      const cmd = new AddProductToTaskCommand(p.id, p.quantity, p.price);
      return this.operationsApi.workOrders.addProductToTask(workOrderId, taskId, cmd);
    });

    forkJoin(addCalls).subscribe({
      next: () => this.goBack(),
      error: (err) => {
        console.error('Failed to add products to task:', err);
        this.goBack(); // Still navigate even if products failed
      }
    });
  }

  private syncProducts() {
    const current = this.addedProducts();
    const original = this.originalProducts;

    const toAdd = current.filter(p => !original.find(o => o.id === p.id));
    const toRemove = original.filter(o => !current.find(p => p.id === o.id));
    const toUpdate = current.filter(p => {
      const orig = original.find(o => o.id === p.id);
      return orig && orig.quantity !== p.quantity;
    });

    const calls: any[] = [];

    // Add new products
    toAdd.forEach(p => {
      const cmd = new AddProductToTaskCommand(p.id, p.quantity, p.price);
      calls.push(this.operationsApi.workOrders.addProductToTask(this.workOrderId!, this.taskId!, cmd));
    });

    // Remove deleted products
    toRemove.forEach(p => {
      if (p.taskProductId) {
        calls.push(this.operationsApi.workOrders.removeProductFromTask(
          this.workOrderId!, this.taskId!, p.taskProductId
        ));
      }
    });

    // Update changed quantities
    toUpdate.forEach(p => {
      const orig = original.find(o => o.id === p.id);
      if (orig?.taskProductId) {
        const cmd = new UpdateProductQuantityInTaskCommand(p.id, p.quantity);
        calls.push(this.operationsApi.workOrders.updateProductQuantityInTask(
          this.workOrderId!, this.taskId!, orig.taskProductId, cmd
        ));
      }
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

  onMechanicBlur() {
    setTimeout(() => this.isMechanicDropdownOpen.set(false), 200);
  }
}
