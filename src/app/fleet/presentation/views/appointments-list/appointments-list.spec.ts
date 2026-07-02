import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AppointmentsListComponent } from './appointments-list';
import { AppointmentsApiEndpoint } from '../../../infrastructure/endpoints/appointments.endpoint';

describe('AppointmentsList', () => {
  let component: AppointmentsListComponent;
  let fixture: ComponentFixture<AppointmentsListComponent>;
  let mockAppointmentsEndpoint: any;
  let mockRouter: any;

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
      getByBranchId: () => of([])
    };
    mockRouter = {
      navigate: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [AppointmentsListComponent],
      providers: [
        provideTranslateService(),
        { provide: AppointmentsApiEndpoint, useValue: mockAppointmentsEndpoint },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

