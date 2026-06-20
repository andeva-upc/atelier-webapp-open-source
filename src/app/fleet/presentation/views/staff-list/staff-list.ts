import { Component, OnInit, ViewChild, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FleetStore } from '../../../application/fleet.store';
import { EmployeeRegistrationResource } from '../../../infrastructure/responses/employee-registration.response';
import { StaffFormDialogComponent } from '../../components/staff-form-dialog/staff-form-dialog';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
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
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private currentBranchId: string = '';
  
  displayedColumns: string[] = ['employeeId', 'specialityName', 'salary', 'status', 'actions'];
  dataSource = new MatTableDataSource<EmployeeRegistrationResource>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    effect(() => {
      // Update dataSource when signal changes
      this.dataSource.data = this.store.employeeRegistrations();
    });
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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
          status: result.status
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
