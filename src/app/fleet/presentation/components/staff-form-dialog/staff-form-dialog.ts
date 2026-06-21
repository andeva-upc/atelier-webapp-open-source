import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { EmployeeRegistrationResource } from '../../../infrastructure/responses/employee-registration.response';
import { CoreApi } from '../../../../core/infrastructure/core-api';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface StaffFormDialogData {
  branchId: string;
  registration?: EmployeeRegistrationResource;
}

@Component({
  selector: 'app-staff-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './staff-form-dialog.html',
  styleUrls: ['./staff-form-dialog.css']
})
export class StaffFormDialogComponent {
  form: FormGroup;
  isEditMode: boolean;
  isSearching = false;
  searchError: string | null = null;
  foundProfileName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private coreApi: CoreApi,
    public dialogRef: MatDialogRef<StaffFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StaffFormDialogData
  ) {
    this.isEditMode = !!data.registration;

    this.form = this.fb.group({
      documentNumber: ['', this.isEditMode ? [] : [Validators.required]],
      employeeId: [data.registration?.employeeId || '', [Validators.required]],
      speciality: [data.registration?.speciality || '', [Validators.required]],
      salary: [data.registration?.salary || 0, [Validators.required, Validators.min(0)]],
      status: [data.registration?.status || 'ACTIVE', [Validators.required]]
    });
  }

  onSearchProfile() {
    const docNumber = this.form.get('documentNumber')?.value;
    if (!docNumber) return;

    this.isSearching = true;
    this.searchError = null;
    this.foundProfileName = null;
    this.form.get('employeeId')?.setValue('');

    this.coreApi.employees.getByDocumentNumber(docNumber).subscribe({
      next: (employee) => {
        this.isSearching = false;
        this.foundProfileName = `${employee.firstName} ${employee.lastName}`;
        this.form.get('employeeId')?.setValue(employee.id);
      },
      error: () => {
        this.isSearching = false;
        this.searchError = 'Empleado no encontrado. Asegúrese de que esté registrado en el sistema.';
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
