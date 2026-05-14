import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TelemetryStore } from '../../../application/telemetry.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matErrorOutline } from '@ng-icons/material-icons/baseline';

@Component({
  selector: 'app-dtc-alerts-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgIcon],
  providers: [provideIcons({ matErrorOutline })],
  template: `
    <div class="alerts-container">
      <div class="alerts-header">
        <h3>{{ 'telemetry.alerts.title' | translate }}</h3>
      </div>

      <div class="alerts-list">
        @for (item of alertsUI(); track item.alert.id) {
          <div class="alert-card" [class]="item.alert.severity.toLowerCase()">
            <div class="alert-main">
              <div class="status-dot"></div>
              
              <div class="alert-info">
                <div class="alert-top-row">
                  <span class="dtc-code">{{ item.alert.dtcCode }}</span>
                  <span class="severity-badge">{{ item.alert.getSeverityKey() | translate }}</span>
                </div>
                
                <h4 class="alert-desc">{{ item.alert.description }}</h4>
                
                <div class="alert-footer">
                  {{ item.vehicle?.brand }} {{ item.vehicle?.model }} {{ item.vehicle?.plateNumber }} 
                  <span class="separator">·</span> 
                  {{ item.timestamp }}
                </div>
              </div>

              <div class="alert-icon-end">
                <ng-icon name="matErrorOutline"></ng-icon>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-alerts">
            <div class="check-circle">✓</div>
            <p>No se detectaron fallas activas</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .alerts-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      font-family: 'Mona Sans', sans-serif;
    }
    .alerts-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
    }
    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .alert-card {
      border-radius: 1rem;
      padding: 1.5rem;
      border-width: 1px;
      border-style: solid;
      transition: transform 0.2s;
    }
    .alert-card:hover {
      transform: translateY(-2px);
    }

    /* Severity Colors */
    .alert-card.critical, .alert-card.high {
      background-color: #fff1f2;
      border-color: #fecaca;
    }
    .alert-card.medium {
      background-color: #fff7ed;
      border-color: #fed7aa;
    }
    .alert-card.low {
      background-color: #f8fafc;
      border-color: #e2e8f0;
    }

    .alert-main {
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 0.5rem;
    }
    .critical .status-dot, .high .status-dot { background-color: #ef4444; }
    .medium .status-dot { background-color: #f97316; }
    .low .status-dot { background-color: #94a3b8; }

    .alert-info {
      flex: 1;
    }

    .alert-top-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.25rem;
    }

    .dtc-code {
      font-weight: 800;
      font-size: 1.1rem;
      font-family: 'Arimo', sans-serif;
    }
    .critical .dtc-code, .high .dtc-code { color: #ef4444; }
    .medium .dtc-code { color: #f97316; }
    .low .dtc-code { color: #475569; }

    .severity-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.1rem 0.6rem;
      border-radius: 1rem;
    }
    .critical .severity-badge, .high .severity-badge { background: #fee2e2; color: #ef4444; }
    .medium .severity-badge { background: #ffedd5; color: #f97316; }
    .low .severity-badge { background: #f1f5f9; color: #475569; }

    .alert-desc {
      margin: 0.25rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }

    .alert-footer {
      font-size: 0.85rem;
      color: #64748b;
      margin-top: 0.25rem;
    }
    .separator {
      margin: 0 0.25rem;
      font-weight: 900;
    }

    .alert-icon-end {
      font-size: 1.75rem;
      color: #94a3b8;
    }
    .critical .alert-icon-end, .high .alert-icon-end { color: #ef4444; }
    .medium .alert-icon-end { color: #f97316; }

    .empty-alerts {
      background: white;
      border-radius: 1rem;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      border: 1px dashed #cbd5e1;
      color: #94a3b8;
    }
    .check-circle {
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
  readonly alertsUI = this.store.alertsWithVehicle;
}
