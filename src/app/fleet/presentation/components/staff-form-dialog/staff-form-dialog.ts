import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { EmployeeRegistrationResource } from '../../../../infrastructure/responses/employee-registration.response';

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
    MatButtonModule
  ],
  templateUrl: './staff-form-dialog.html',
  styleUrls: ['./staff-form-dialog.css']
})
export class StaffFormDialogComponent {
  form: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<StaffFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StaffFormDialogData
  ) {
    this.isEditMode = !!data.registration;

    this.form = this.fb.group({
      employeeId: [data.registration?.employeeId || '', [Validators.required]],
      speciality: [data.registration?.speciality || '', [Validators.required]],
      salary: [data.registration?.salary || 0, [Validators.required, Validators.min(0)]],
      status: [data.registration?.status || 'ACTIVE', [Validators.required]]
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
