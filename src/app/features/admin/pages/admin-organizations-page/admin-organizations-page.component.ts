import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { Organization, CreateOrganizationDTO } from '../../../../core/models/domain.models';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { AdminOrganizationCreateModalComponent } from './components/create-organization-modal/create-organization-modal.component';

@Component({
  selector: 'app-admin-organizations-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-organizations-page.component.html',
  styles: []
})
export class AdminOrganizationsPageComponent implements OnInit {
  private alertService = inject(AlertService);
  private adminDataService = inject(AdminDataService);
  private confirmationService = inject(ConfirmationService);

  // State
  organizations = signal<Organization[]>([]);
  isLoading = signal(false);
  showCreateModal = signal(false);
  selectedOrganization = signal<Organization | null>(null);
  
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
    this.confirmationService.confirm({
      title: 'Restablecer Contraseña',
      message: `¿Estás seguro de enviar el restablecimiento de contraseña a ${org.email}?`,
      type: 'warning',
      confirmText: 'Enviar'
    }).then(confirmed => {
      if (confirmed) {
        this.isLoading.set(true);
        this.adminDataService.resetOrganizationPassword(org.email).subscribe({
          next: (success) => {
            if (success) {
              this.alertService.success(`Correo de restablecimiento enviado a ${org.email}`);
            } else {
              this.alertService.error('No se pudo enviar el correo.');
            }
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Error resetting password', err);
            this.alertService.error('Error al enviar el restablecimiento de contraseña');
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  getOrganizationTypeLabel(type: string): string {
    return type === 'COMPANY' ? 'Empresa/Asociación' : 'Persona Natural';
  }

  openEditModal(org: Organization) {
    this.selectedOrganization.set(org);
    this.showCreateModal.set(true);
  }

  handleUpdateOrganization(event: { id: string, dto: CreateOrganizationDTO }) {
    this.adminDataService.updateOrganization(event.id, event.dto).subscribe({
      next: (updatedOrg) => {
        this.alertService.success(`Organización ${updatedOrg.name} actualizada exitosamente`);
        this.showCreateModal.set(false);
        this.selectedOrganization.set(null);
        this.loadOrganizations();
      },
      error: (err) => {
        console.error('Error updating organization', err);
        this.alertService.error('Error al actualizar la organización');
      }
    });
  }

  handleCreateOrganization(event: { dto: CreateOrganizationDTO, file: File }) {
    // The modal handles the loading state internally for the button, 
    // but we can also show a global loader if preferred.
    // Here we delegate the call to the service.
    
    this.adminDataService.createOrganization(event.dto, event.file).subscribe({
      next: (newOrg) => {
        this.alertService.success(`Organización ${newOrg.name} creada exitosamente`);
        this.showCreateModal.set(false);
        this.loadOrganizations(); // Reload to refresh list
      },
      error: (err) => {
        console.error('Error creating organization', err);
        this.alertService.error('Error al crear la organización');
        // Note: In a real scenario, we might want to pass the error back to the modal 
        // to stop its loading state, but for now we just close or show alert.
        // If we want to keep modal open on error, we would need to pass control back.
        // For simplicity, we assume the modal component will handle its own state reset if needed,
        // or we can use a shared service state.
      }
    });
  }
}
