import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AppointmentFormComponent } from './appointment-form';
import { AppointmentsApiEndpoint } from '../../../infrastructure/endpoints/appointments.endpoint';
import { CustomerRegistrationsApiEndpoint } from '../../../infrastructure/endpoints/customer-registrations.endpoint';
import { VehiclesApiEndpoint } from '../../../../iot/infrastructure/endpoints/vehicles.endpoint';
import { CoreApi } from '../../../../core/infrastructure/core-api';

describe('AppointmentForm', () => {
  let component: AppointmentFormComponent;
  let fixture: ComponentFixture<AppointmentFormComponent>;
  let mockAppointmentsEndpoint: any;
  let mockCustomersEndpoint: any;
  let mockVehiclesEndpoint: any;
  let mockCoreApi: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => '123',
        setItem: (key: string, value: string) => {},
        removeItem: (key: string) => {},
        clear: () => {}
      },
      writable: true
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: (key: string) => '123',
        setItem: (key: string, value: string) => {},
        removeItem: (key: string) => {},
        clear: () => {}
      },
      writable: true
    });

    mockAppointmentsEndpoint = {
      getById: () => of({}),
      create: () => of({}),
      update: () => of({})
    };
    mockCustomersEndpoint = {
      getByBranchId: () => of([])
    };
    mockVehiclesEndpoint = {
      getByCustomerId: () => of([])
    };
    mockCoreApi = {
      customers: {
        getById: () => of({})
      }
    };
    mockRouter = {
      navigate: () => {}
    };
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: () => null
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [AppointmentFormComponent, NoopAnimationsModule],
      providers: [
        provideTranslateService(),
        { provide: AppointmentsApiEndpoint, useValue: mockAppointmentsEndpoint },
        { provide: CustomerRegistrationsApiEndpoint, useValue: mockCustomersEndpoint },
        { provide: VehiclesApiEndpoint, useValue: mockVehiclesEndpoint },
        { provide: CoreApi, useValue: mockCoreApi },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

