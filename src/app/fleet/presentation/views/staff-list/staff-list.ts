import { Component, OnInit, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
    TranslateModule,
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
  private translate = inject(TranslateService);
  private currentBranchId: string = '';
  
  private employeeProfiles = signal<Map<string, EmployeeResource>>(new Map());

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

  onAddStaff() {
    if (!this.currentBranchId) {
      this.snackBar.open(this.translate.instant('fleet.staffList.noBranchId'), this.translate.instant('fleet.staffList.close'), { duration: 3000 });
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
          specialityName: this.translate.instant(`fleet.staffForm.roles.${result.speciality}`),
          salary: result.salary,
          createdBy: localStorage.getItem('userId') || 'system',
          status: result.status
        }, 
        () => {
          this.snackBar.open(this.translate.instant('fleet.staffList.successRegister'), this.translate.instant('fleet.staffList.close'), { duration: 3000 });
        },
        (err) => {
          this.snackBar.open(`Error al registrar: ${err?.status} - Verifica si el empleado ya está registrado o el ID es correcto`, 'Cerrar', { duration: 5000 });
        });
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
          specialityName: this.translate.instant(`fleet.staffForm.roles.${result.speciality}`),
          salary: result.salary,
          status: result.status,
          updatedBy: localStorage.getItem('userId') || 'system'
        });
        this.snackBar.open(this.translate.instant('fleet.staffList.successUpdate'), this.translate.instant('fleet.staffList.close'), { duration: 3000 });
      }
    });
  }

  onDeleteStaff(staff: StaffCardData) {
    const confirmMessage = this.translate.instant('fleet.staffList.confirmDelete', { id: staff.employeeId });
    const confirmed = window.confirm(confirmMessage);
    if (confirmed) {
      this.store.deleteEmployeeRegistration(staff.id);
      this.snackBar.open(this.translate.instant('fleet.staffList.successDelete'), this.translate.instant('fleet.staffList.close'), { duration: 3000 });
    }
  }
}
