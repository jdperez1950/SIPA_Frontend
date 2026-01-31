import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';
import { AdminDataService } from '../../services/admin-data.service';
import { Organization } from '../../../../core/models/domain.models';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-organizations-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './admin-organizations-page.component.html',
  styles: []
})
export class AdminOrganizationsPageComponent implements OnInit {
  private alertService = inject(AlertService);
  private adminDataService = inject(AdminDataService);

  // State
  organizations = signal<Organization[]>([]);
  isLoading = signal(false);
  
  // Filters
  searchQuery = signal('');

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);

  constructor() {
    // React to filter changes
    effect(() => {
      const query = this.searchQuery();
      this.currentPage.set(1);
      this.loadOrganizations();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // Initial load handled by effect
  }

  loadOrganizations() {
    this.isLoading.set(true);
    this.adminDataService.getOrganizations(
      this.currentPage(),
      this.pageSize(),
      this.searchQuery()
    ).subscribe({
      next: (response) => {
        this.organizations.set(response.data);
        this.totalItems.set(response.meta.totalItems);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading organizations', err);
        this.alertService.error('Error al cargar las organizaciones');
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadOrganizations();
  }

  resetPassword(org: Organization) {
    if (confirm(`¿Estás seguro de enviar el restablecimiento de contraseña a ${org.email}?`)) {
      this.isLoading.set(true);
      this.adminDataService.resetOrganizationPassword(org.id).subscribe({
        next: () => {
          this.alertService.success(`Correo de restablecimiento enviado a ${org.email}`);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error resetting password', err);
          this.alertService.error('Error al enviar el restablecimiento de contraseña');
          this.isLoading.set(false);
        }
      });
    }
  }

  getOrganizationTypeLabel(type: string): string {
    return type === 'COMPANY' ? 'Empresa/Asociación' : 'Persona Natural';
  }
}
