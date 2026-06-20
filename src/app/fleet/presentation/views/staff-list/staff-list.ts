import { Component, OnInit, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FleetStore } from '../../../application/fleet.store';
import { EmployeeRegistrationResource } from '../../../infrastructure/responses/employee-registration.response';
import { StaffFormDialogComponent } from '../../components/staff-form-dialog/staff-form-dialog';
import { CoreApi } from '../../../../core/infrastructure/core-api';
import { EmployeeResource } from '../../../../core/infrastructure/responses/employee-response';

export interface StaffCardData extends EmployeeRegistrationResource {
  firstName?: string;
  lastName?: string;
}

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './staff-list.html',
  styleUrls: ['./staff-list.css']
})
export class StaffListComponent implements OnInit {
  private store = inject(FleetStore);
  private coreApi = inject(CoreApi);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private currentBranchId: string = '';
  
  private employeeProfiles = signal<Map<string, EmployeeResource>>(new Map());

  // Pagination state
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);

  staffCards = computed(() => {
    const registrations = this.store.employeeRegistrations();
    const profiles = this.employeeProfiles();
    
    return registrations.map(reg => {
      const profile = profiles.get(reg.employeeId);
      return {
        ...reg,
        firstName: profile?.firstName,
        lastName: profile?.lastName
      } as StaffCardData;
    });
  });

  paginatedCards = computed(() => {
    const all = this.staffCards();
    const start = this.currentPage() * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.ceil(this.staffCards().length / this.pageSize()) || 1;
  });

  constructor() {
    effect(() => {
      const registrations = this.store.employeeRegistrations();
      const profilesMap = this.employeeProfiles();
      let hasNewProfiles = false;
      const newMap = new Map(profilesMap);

      registrations.forEach(reg => {
        if (!newMap.has(reg.employeeId)) {
          // Temporarily set empty to avoid multiple calls
          newMap.set(reg.employeeId, {} as EmployeeResource);
          hasNewProfiles = true;
          
          this.coreApi.employees.getById(reg.employeeId).subscribe({
            next: (profile) => {
              this.employeeProfiles.update(map => {
                const updated = new Map(map);
                updated.set(reg.employeeId, profile);
                return updated;
              });
            },
            error: (err) => console.error('Failed to load employee profile', err)
          });
        }
      });

      if (hasNewProfiles) {
         this.employeeProfiles.set(newMap);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    const branchId = localStorage.getItem('tenantBranchId') || sessionStorage.getItem('tenantBranchId');
    if (branchId) {
      this.currentBranchId = branchId;
      this.store.loadEmployeeRegistrationsByBranchId(branchId);
    } else {
      console.warn('No branchId found to load staff.');
    }
  }

  // Custom Pagination logic
  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
    }
  }

  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSize.set(Number(target.value));
    this.currentPage.set(0);
  }

  onAddStaff() {
    if (!this.currentBranchId) {
      this.snackBar.open('No se encontró la sucursal actual', 'Cerrar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(StaffFormDialogComponent, {
      width: '500px',
      data: { branchId: this.currentBranchId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.createEmployeeRegistration({
          branchId: this.currentBranchId,
          employeeId: result.employeeId,
          speciality: result.speciality,
          salary: result.salary,
          createdBy: localStorage.getItem('userId') || 'system',
          status: result.status
        });
        this.snackBar.open('Empleado registrado exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onEditStaff(element: EmployeeRegistrationResource) {
    const dialogRef = this.dialog.open(StaffFormDialogComponent, {
      width: '500px',
      data: { branchId: this.currentBranchId, registration: element }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.updateEmployeeRegistration(element.id, {
          speciality: result.speciality,
          salary: result.salary,
          status: result.status,
          updatedBy: localStorage.getItem('userId') || 'system'
        });
        this.snackBar.open('Empleado actualizado exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onDeleteStaff(element: EmployeeRegistrationResource) {
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar el registro del empleado con ID: ${element.employeeId}?`);
    if (confirmed) {
      this.store.deleteEmployeeRegistration(element.id);
      this.snackBar.open('Registro de empleado eliminado exitosamente', 'Cerrar', { duration: 3000 });
    }
  }
}
