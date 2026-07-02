import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CoreStore } from '../../../application/core.store';
import { CreateEmployeeCommand } from '../../../domain/model/commands/create-employee.command';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-employee-onboarding-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './employee-onboarding-form.html',
  styleUrls: ['./employee-onboarding-form.css']
})
export class EmployeeOnboardingFormComponent {
  private fb = inject(FormBuilder);
  private coreStore = inject(CoreStore);
  private router = inject(Router);

  employeeForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    documentType: ['DNI', [Validators.required]],
    documentNumber: ['', [Validators.required]],
    phone: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) return;

    const { firstName, lastName, documentType, documentNumber, phone } = this.employeeForm.value;
    
    const command = new CreateEmployeeCommand({
      userId: userId,
      firstName: firstName,
      lastName: lastName,
      documentType: documentType,
      documentNumber: documentNumber,
      phone: phone
    });

    this.coreStore.createEmployee(command, this.router);
  }
}
