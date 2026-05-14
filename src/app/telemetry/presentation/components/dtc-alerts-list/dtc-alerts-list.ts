import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TelemetryStore } from '../../../application/telemetry.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matWarning, matError, matInfo } from '@ng-icons/material-icons/baseline';

@Component({
  selector: 'app-dtc-alerts-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgIcon],
  providers: [provideIcons({ matWarning, matError, matInfo })],
  template: `
    <div class="alerts-container">
      <div class="alerts-header">
        <h3>{{ 'telemetry.alerts.title' | translate }}</h3>
        <span class="count-badge" *ngIf="alerts().length > 0">{{ alerts().length }}</span>
      </div>

      <div class="alerts-list">
        @for (alert of alerts(); track alert.id) {
          <div class="alert-item" [class]="alert.severity.toLowerCase()">
            <div class="alert-icon">
              @if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
                <ng-icon name="matError"></ng-icon>
              } @else if (alert.severity === 'MEDIUM') {
                <ng-icon name="matWarning"></ng-icon>
              } @else {
                <ng-icon name="matInfo"></ng-icon>
              }
            </div>
            
            <div class="alert-content">
              <div class="alert-top">
                <span class="code">{{ alert.dtcCode }}</span>
                <span class="severity-label">{{ alert.getSeverityKey() | translate }}</span>
              </div>
              <p class="description">{{ alert.description }}</p>
            </div>
          </div>
        } @empty {
          <div class="empty-alerts">
            <div class="check-icon">✓</div>
            <p>No se detectaron fallas activas</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .alerts-container {
      background: white;
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .alerts-header {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .alerts-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
    }
    .count-badge {
      background: #fee2e2;
      color: #ef4444;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.1rem 0.5rem;
      border-radius: 1rem;
    }
    .alerts-list {
      display: flex;
      flex-direction: column;
    }
    .alert-item {
      display: flex;
      padding: 1.25rem 1.5rem;
      gap: 1rem;
      border-bottom: 1px solid #f1f5f9;
      transition: background-color 0.2s;
    }
    .alert-item:last-child {
      border-bottom: none;
    }
    .alert-icon {
      font-size: 1.5rem;
      display: flex;
      align-items: flex-start;
      padding-top: 0.1rem;
    }
    .alert-item.critical .alert-icon { color: #ef4444; }
    .alert-item.high .alert-icon { color: #f97316; }
    .alert-item.medium .alert-icon { color: #eab308; }
    .alert-item.low .alert-icon { color: #3b82f6; }

    .alert-content {
      flex: 1;
    }
    .alert-top {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.25rem;
    }
    .code {
      font-family: monospace;
      font-weight: 700;
      color: #1e293b;
      font-size: 1rem;
    }
    .severity-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 700;
      padding: 0.1rem 0.4rem;
      border-radius: 0.25rem;
    }
    .critical .severity-label { background: #fef2f2; color: #ef4444; }
    .high .severity-label { background: #fff7ed; color: #f97316; }
    .medium .severity-label { background: #fefce8; color: #854d0e; }
    .low .severity-label { background: #eff6ff; color: #1d4ed8; }

    .description {
      margin: 0;
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.4;
    }

    .empty-alerts {
      padding: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: #94a3b8;
    }
    .check-icon {
      width: 48px;
      height: 48px;
      background: #f0fdf4;
      color: #22c55e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
    }
  `]
})
export class DtcAlertsList {
  private readonly store = inject(TelemetryStore);
  readonly alerts = this.store.alerts;
}
