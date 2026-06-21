import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CoreStore } from '../../../application/core.store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './role-selection.html',
  styleUrls: ['./role-selection.css']
})
export class RoleSelectionComponent implements OnInit {
  public coreStore = inject(CoreStore);
  private router = inject(Router);
  private translate = inject(TranslateService);

  public isLoading = signal(true);

  constructor() {
    // Effect to monitor roles once they are loaded
    effect(() => {
      const roles = this.coreStore.currentRoles();
      if (roles !== null) {
        setTimeout(() => {
          this.isLoading.set(false);
          // Bypass rule: If user only has 1 role, select it automatically and skip this screen
          if (roles.length === 1) {
            this.selectRole(roles[0]);
          }
        });
      }
    });
  }

  ngOnInit() {
    // 1. Get userId strictly from LocalStorage to avoid cross-bounded-context injection
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    
    if (userId) {
      // 2. Load roles via Core Store (which uses the real endpoint)
      this.coreStore.loadRolesByUserId(userId);
    } else {
      // Fallback if accessed without proper session state in memory
      this.router.navigate(['/sign-in']);
    }
  }

  selectRole(role: string) {
    // Guardar el rol seleccionado (podemos almacenarlo en localStorage temporalmente o en un LayoutStore futuro)
    localStorage.setItem('activeRole', role);
    sessionStorage.setItem('activeRole', role);
    
    // Redirigir al dashboard general (Sidebar se encargará de mostrar items según el rol)
    this.router.navigate(['/home']).then(success => {
      if (!success) {
        alert(this.translate.instant('role-selection.error_nav_blocked'));
      }
    }).catch(err => {
      alert(this.translate.instant('role-selection.error_nav_exec') + err.message);
      console.error(err);
    });
  }

  onSignOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    // We navigate to /sign-in
    this.router.navigate(['/sign-in']);
  }

  // Utilidad para limpiar el nombre del rol (ej: ROLE_CUSTOMER -> Customer)
  formatRoleName(role: string): string {
    return role.replace('ROLE_', '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  // Asignar un ícono de PrimeNG basado en el rol
  getRoleIcon(role: string): string {
    if (role.includes('OWNER')) return 'pi pi-shield';
    if (role.includes('EMPLOYEE')) return 'pi pi-id-card';
    if (role.includes('CUSTOMER')) return 'pi pi-user';
    return 'pi pi-user';
  }
}
