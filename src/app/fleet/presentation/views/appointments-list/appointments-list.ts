import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AppointmentsApiEndpoint } from '../../../infrastructure/endpoints/appointments.endpoint';
import { AppointmentResource } from '../../../infrastructure/responses/appointment.response';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './appointments-list.html',
  styleUrls: ['./appointments-list.css']
})
export class AppointmentsListComponent implements OnInit {
  private appointmentsEndpoint = inject(AppointmentsApiEndpoint);
  private router = inject(Router);

  // State
  appointments = signal<AppointmentResource[]>([]);
  isLoading = signal<boolean>(false);
  
  // Filters
  searchQuery = signal<string>('');
  selectedStatus = signal<string>('');
  statuses = ['PENDING', 'COMPLETED', 'CANCELED'];

  // Computed
  filteredAppointments = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatus();

    return this.appointments().filter(a => {
      // Basic search logic based on available IDs since we don't have expanded names yet in standard payload
      const matchesSearch = query ? (a.customerId.toLowerCase().includes(query) || a.vehicleId.toLowerCase().includes(query)) : true;
      const matchesStatus = status ? a.status === status : true;
      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    const branchId = localStorage.getItem('tenantBranchId') || sessionStorage.getItem('tenantBranchId');
    if (!branchId) return;

    this.isLoading.set(true);
    this.appointmentsEndpoint.getByBranchId(branchId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.appointments.set(data),
        error: (err) => console.error('Error loading appointments', err)
      });
  }

  onAddAppointment(): void {
    this.router.navigate(['/fleet/appointments/new']);
  }

  onEdit(appointment: AppointmentResource): void {
    this.router.navigate(['/fleet/appointments', appointment.id, 'edit']);
  }
}
