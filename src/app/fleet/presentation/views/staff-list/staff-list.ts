import { Component, OnInit, ViewChild, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FleetStore } from '../../../application/fleet.store';
import { EmployeeRegistrationResource } from '../../../infrastructure/responses/employee-registration.response';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './staff-list.html',
  styleUrls: ['./staff-list.css']
})
export class StaffListComponent implements OnInit {
  private store = inject(FleetStore);
  
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
      this.store.loadEmployeeRegistrationsByBranchId(branchId);
    } else {
      console.warn('No branchId found to load staff.');
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onAddStaff() {
    // To be implemented in next commit
  }

  onEditStaff(element: EmployeeRegistrationResource) {
    // To be implemented in next commit
  }

  onDeleteStaff(element: EmployeeRegistrationResource) {
    // To be implemented in next commit
  }
}
