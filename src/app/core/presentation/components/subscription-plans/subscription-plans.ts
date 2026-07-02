import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
}

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './subscription-plans.html',
  styleUrls: ['./subscription-plans.css']
})
export class SubscriptionPlansComponent {
  @Output() planSelected = new EventEmitter<SubscriptionPlan>();

  plans: SubscriptionPlan[] = [
    {
      id: 'eeeee333-3333-3333-3333-333333333333',
      name: 'Lite',
      price: 99,
      features: [
        'Gestión básica ERP',
        'Inventario',
        'Conexión de hasta 5 vehículos',
        'Próximas funciones'
      ]
    },
    {
      id: 'eeeee222-2222-2222-2222-222222222222',
      name: 'Pro',
      price: 249,
      features: [
        'Todas las funciones del Plan Lite',
        'Gestión avanzada ERP',
        'Módulo de facturación electrónica',
        'Conexión de hasta 20 vehículos'
      ],
      recommended: true
    },
    {
      id: 'eeeee111-1111-1111-1111-111111111111',
      name: 'Max',
      price: 599,
      features: [
        'Todas las funciones del Plan Pro',
        'Reportes de rentabilidad',
        'Conexión de hasta 50 vehículos',
        'Automatizaciones'
      ]
    }
  ];

  onSelectPlan(plan: SubscriptionPlan) {
    this.planSelected.emit(plan);
  }
}
