import { Component, computed, EventEmitter, Input, Output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of, map, Observable } from 'rxjs';
import { StepIdentificationComponent } from './steps/step-identification/step-identification.component';
import { StepTechnicalTableComponent } from './steps/step-technical-table/step-technical-table.component';
import { StepResponseTeamComponent } from './steps/step-response-team/step-response-team.component';
import { AlertService } from '../../../../../../core/services/alert.service';
import { AdminDataService } from '../../../../services/admin-data.service';
import { ParametroBaseService } from '../../../../../../core/services/parametro-base.service';
import { OrganizationDocumentService } from '../../../../../../core/services/organization-document.service';
import { ProjectRequest, Project, ProjectResponseTeamMember } from '../../../../../../core/models/domain.models';
import { 
  IdentificationData, 
  TechnicalTableAssignment, 
  ResponseTeamMember 
} from './project-wizard.types';
import { ModalAlertComponent, ModalAlertData } from '../../../../../../shared/components/modal-alert';

export type WizardMode = 'FULL' | 'IDENTIFICATION_ONLY';

@Component({
  selector: 'app-project-wizard',
  standalone: true,
  imports: [
    CommonModule, 
    StepIdentificationComponent,
    StepTechnicalTableComponent,
    StepResponseTeamComponent,
    ModalAlertComponent
  ],
  templateUrl: './project-wizard.component.html',
  styles: []
})
export class ProjectWizardComponent {
  @Input() mode: WizardMode = 'FULL';
  @Input() initialData: Project | null = null;
  @Output() completed = new EventEmitter<void>();
  
  private alertService = inject(AlertService);
  private adminService = inject(AdminDataService);
  private parametroBaseService = inject(ParametroBaseService);
  private organizationDocumentService: OrganizationDocumentService = inject(OrganizationDocumentService);

  // --- Constants ---
  readonly ALL_STEPS = [
    { 
      number: 1, 
      title: 'Identificación', 
      icon: 'badge',
      description: 'Diligencie la información básica del proyecto: organización, fechas, ubicación y datos principales.'
    },
    { 
      number: 2, 
      title: 'Equipo Respuesta', 
      icon: 'group_add',
      description: 'Agrega los usuarios que formarán parte del equipo de respuesta para la organización, incluye la persona responsable de diligenciar el cuestionario de cumplimiento para la aplicación del proyecto.'
    },
    { 
      number: 3, 
      title: 'Mesa Técnica', 
      icon: 'engineering',
      description: 'Configure la mesa técnica y asigne los responsables para el seguimiento del proyecto.'
    }
  ];

  steps = computed(() => {
    if (this.mode === 'IDENTIFICATION_ONLY') {
      return [this.ALL_STEPS[0]];
    }
    return this.ALL_STEPS;
  });

  // --- State ---
  currentStep = signal(1);
  isSaving = signal(false);
  
  // Step 1 Data
  identificationData = signal<IdentificationData | null>(null);

  // Step 2 Data
  responseTeam = signal<ResponseTeamMember[]>([]);

  // Step 3 Data (Mesa Técnica)
  technicalTableAssignments = signal<TechnicalTableAssignment[]>([]);

  modalAlertData = signal<ModalAlertData | null>(null);

  constructor() {
    // Initialize with data if provided
    effect(() => {
      if (this.initialData) {
        this.loadInitialData(this.initialData);
      }
    });
  }

  loadInitialData(project: Project) {
    // Backend response structure:
    // project.name -> Nombre real del proyecto (Ej: "CosiPet")
    // project.code -> Código del proyecto (Ej: "PRJ-2026-0029")
    // project.organization -> Objeto completo con la info de la organización
    // project.organizationName -> Nombre de la organización (string)
    // project.responseTeam -> Array de miembros del equipo
    
    // Map Project to IdentificationData
    // The 'organization' field in the backend response is actually the full object, 
    // but our frontend interface definition might be typed as string | OrganizationData.
    // Let's handle it safely.
    
    const orgData = project.organizationData || (typeof project.organization === 'object' ? project.organization : null);
    
    // Helper to safely get string
    const safeStr = (val: any) => (val && typeof val === 'string') ? val : '';

    // Map organization type from code to GUID
    const orgTypeId = orgData?.type?.id;
    const orgType = orgTypeId ? this.parametroBaseService.tiposOrganizacion().find((t: any) => t.id === orgTypeId) : null;

    // Backend returns municipality and region as ParametroBase objects
    const deptParam = orgData?.region;
    const municipioParam = orgData?.municipality;

    // Helper to get nombre or fallback to codigo
    const getNombreOrCodigo = (param: any) => param?.nombre || param?.codigo || '';

    // Parse project fields from backend
    this.identificationData.set({
      organizationId: orgData?.id,
      description: safeStr(project.description) || '',
      projectValue: project.projectValue || 0,
      housingCount: project.housingCount || 0,
      beneficiariesCount: project.beneficiariesCount || 0,
      tieneTerreno: project.tieneTerreno || { id: '', nombre: '' },
      landDescription: safeStr(project.landDescription) || '',
      tieneFinanciacion: project.tieneFinanciacion || { id: '', nombre: '' },
      financingDescription: safeStr(project.financingDescription) || '',
      departmentId: deptParam ? { id: deptParam.id, nombre: getNombreOrCodigo(deptParam) } : { id: '', nombre: project.state || '' },
      departmentName: getNombreOrCodigo(deptParam) || project.state || '',
      municipality: municipioParam ? { id: municipioParam.id, nombre: getNombreOrCodigo(municipioParam) } : { id: '', nombre: project.municipality || '' },
      municipalityName: getNombreOrCodigo(municipioParam) || project.municipality || '',
      
      organizationName: safeStr(project.organizationName) || orgData?.name || '',
      organizationType: orgType ? { id: orgType.id, nombre: orgType.nombre, tipo: orgType.tipo, codigo: orgType.codigo } : { id: '', nombre: '', tipo: '', codigo: '' },
      organizationIdentifier: orgData?.identifier || '',
      verificationDigit: orgData?.digitoVerificacion?.toString() ?? '',
      organizationEmail: orgData?.email || '',
      website: orgData?.paginaWeb || '',
      organizationDescription: orgData?.description || '',
      organizationAddress: orgData?.address || '',
      
      startDate: safeStr(project.startDate).split('T')[0],
      endDate: safeStr(project.endDate).split('T')[0],
      submissionDeadline: safeStr(project.submissionDeadline).split('T')[0]
    });

    // Load response team data from organization.organizationTeam
    const orgTeam = orgData?.organizationTeam;
    if (orgTeam && orgTeam.length > 0) {
      this.responseTeam.set(orgTeam.map((m: ProjectResponseTeamMember) => ({
        userId: m.userId,
        name: m.nombre || m.name,
        documentType: m.documentType || { id: '', nombre: '' },
        documentNumber: m.documentNumber,
        email: m.email,
        phone: m.phone || '',
        nombre: m.nombre || m.name,
        profile: m.profile || '',
        representativeType: m.representativeType || { id: '', nombre: '' }
      })));
    }
  }

  // --- Computed Helpers ---
  
  // Validation for Current Step
  isCurrentStepValid = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return !!this.identificationData();
      case 2:
        return this.responseTeam().length > 0;
      case 3:
        return true; // Mesa técnica es opcional
      default:
        return false;
    }
  });

  // --- Actions ---

  goToStep(step: number) {
    const maxStep = this.steps().length;
    if (step > maxStep) return;

    if (step < this.currentStep() || (step > this.currentStep() && this.isCurrentStepValid())) {
      if (step < this.currentStep()) {
        this.currentStep.set(step);
      }
    }
  }

  nextStep() {
    if (!this.isCurrentStepValid()) {
      this.alertService.error('Por favor complete todos los campos obligatorios del paso actual.');
      this.markStepAsTouched();
      return;
    }

    if (this.currentStep() === 1) {
      // If it's a new project, we don't save yet, just proceed to Step 2 to collect Team
      if (!this.initialData) {
        this.currentStep.update(s => s + 1);
      } else {
        // If editing existing project, save Step 1 changes
        this.saveStep1AndProceed();
      }
    } else if (this.currentStep() === 2) {
      // Proceed to Step 3 (Mesa Técnica)
      this.currentStep.update(s => s + 1);
    } else if (this.currentStep() === 3) {
      // Finalize (Create or Update) at step 3
      this.finishWizard();
    }
  }

  saveStep1AndProceed() {
    const data = this.identificationData();
    if (!data || !this.initialData || this.isSaving()) return;

    this.isSaving.set(true);

    // En modo edición, solo avanzamos al siguiente paso sin guardar
    // Los datos se guardarán al finalizar el wizard
    this.currentStep.update(s => s + 1);
    this.isSaving.set(false);
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  finishWizard() {
    if (!this.isCurrentStepValid()) {
      this.modalAlertData.set({
        type: 'error',
        title: 'Datos Incompletos',
        message: 'Por favor complete todos los campos requeridos antes de finalizar.',
        confirmText: 'Aceptar'
      });
      this.markStepAsTouched();
      return;
    }

    if (this.isSaving()) return;

    const data = this.identificationData();
    if (!data) return;

    this.isSaving.set(true);

      if (this.initialData) {
        // Edit Mode -> Update
        const updateRequest: ProjectRequest = {
          id: this.initialData.id,
          Description: data.description,
          HousingCount: data.housingCount,
          BeneficiariesCount: data.beneficiariesCount,
          TieneTerreno: data.tieneTerreno,
          LandDescription: data.landDescription,
          projectValue: data.projectValue,
          TieneFinanciacion: data.tieneFinanciacion,
          FinancingDescription: data.financingDescription,
          Organization: {
            id: data.organizationId,
            name: data.organizationName,
            type: data.organizationType,
            identifier: data.organizationIdentifier,
            digitoVerificacion: parseInt(data.verificationDigit || '0'),
            email: data.organizationEmail,
            paginaWeb: data.website,
            region: data.departmentId,
            municipality: data.municipality,
            address: data.organizationAddress,
            description: data.organizationDescription,
            isLegallyConstituted: data.isLegallyConstituted,
            legalRepresentativeCertificateFileId: data.legalRepresentativeCertificateFileId,
            intentionActFileId: data.intentionActFileId,
            organizationTeam: this.responseTeam().map(m => ({
              userId: m.userId,
              name: m.name,
              email: m.email,
              profile: m.profile,
              documentType: m.documentType,
              documentNumber: m.documentNumber,
              nombre: m.nombre,
              phone: m.phone,
              representativeType: m.representativeType
            }))
          },
          technicalTable: this.technicalTableAssignments().map(a => ({
            axisId: a.eje,
            advisorId: a.consultor.id
          }))
        };

        this.adminService.updateProject(this.initialData.id, updateRequest).subscribe({
          next: (response) => {
            const message = response.message || 'Proyecto actualizado exitosamente';
            this.alertService.success(message);
            this.completed.emit();
            this.isSaving.set(false);
          },
          error: (error) => {
            const errorMessage = error?.error?.message || error?.message || 'Error al actualizar el proyecto';
            this.alertService.error(errorMessage);
            this.isSaving.set(false);
          }
        });
      } else {
        // Create Mode -> Create FULL PROJECT (Step 1 + Step 2)
        const createRequest: ProjectRequest = {
          Description: data.description,
          HousingCount: data.housingCount,
          BeneficiariesCount: data.beneficiariesCount,
          TieneTerreno: data.tieneTerreno,
          LandDescription: data.landDescription,
          projectValue: data.projectValue,
          TieneFinanciacion: data.tieneFinanciacion,
          FinancingDescription: data.financingDescription,
          Organization: {
            id: data.organizationId,
            name: data.organizationName,
            type: data.organizationType,
            identifier: data.organizationIdentifier,
            digitoVerificacion: parseInt(data.verificationDigit || '0'),
            email: data.organizationEmail,
            paginaWeb: data.website,
            region: data.departmentId,
            municipality: data.municipality,
            address: data.organizationAddress,
            description: data.organizationDescription,
            isLegallyConstituted: data.isLegallyConstituted,
            legalRepresentativeCertificateFileId: data.legalRepresentativeCertificateFileId,
            intentionActFileId: data.intentionActFileId,
            organizationTeam: this.responseTeam().map(m => ({
              userId: m.userId,
              name: m.name,
              email: m.email,
              profile: m.profile,
              documentType: m.documentType,
              documentNumber: m.documentNumber,
              nombre: m.nombre,
              phone: m.phone,
              representativeType: m.representativeType
            }))
          },
          // projectTeam: this.technicalTableAssignments().map(a => ({
          //   eje: a.eje,
          //   consultor: a.consultor
          // }))
        };

        this.adminService.createProject(createRequest).subscribe({
          next: (response) => {
            const project = response.data;
            const organizationId = project.organizationId || 
                                   (typeof project.organization === 'string' ? project.organization : project.organization?.id) || 
                                   createRequest.Organization?.id;
            
            if (!organizationId) {
              this.alertService.warning('Proyecto creado, pero no se pudieron subir los documentos (falta ID de organización)');
              this.completed.emit();
              this.isSaving.set(false);
              return;
            }
            
            this.uploadOrganizationDocuments(organizationId, data).subscribe({
              next: () => {
                const message = response.message || 'Proyecto creado exitosamente';
                this.alertService.success(message);
                this.completed.emit();
                this.isSaving.set(false);
              },
              error: (error: any) => {
                this.alertService.warning('Proyecto creado, pero hubo un error al subir los documentos');
                this.completed.emit();
                this.isSaving.set(false);
              }
            });
          },
          error: (error) => {
            const errorMessage = error?.error?.message || error?.message || 'Error al crear el proyecto';
            this.alertService.error(errorMessage);
            this.isSaving.set(false);
          }
        });
      }
  }

  private uploadOrganizationDocuments(organizationId: string, data: IdentificationData): Observable<void> {
    const uploads: Observable<void>[] = [];

    const certificateDocType = this.parametroBaseService.getByCodigo('TIPO_DOCUMENTO', 'DOC1');
    const actDocType = this.parametroBaseService.getByCodigo('TIPO_DOCUMENTO', 'DOC2');
    const tradicionLibertadDocType = this.parametroBaseService.getByCodigo('TIPO_DOCUMENTO', 'DOC3');

    if (data.legalRepresentativeCertificate && certificateDocType) {
      uploads.push(
        this.organizationDocumentService.uploadDocument(
          organizationId,
          data.legalRepresentativeCertificate,
          certificateDocType.id,
          'Certificado de Existencia y Representación Legal'
        ).pipe(
          map(() => void 0)
        )
      );
    }

    if (data.intentionAct && actDocType) {
      uploads.push(
        this.organizationDocumentService.uploadDocument(
          organizationId,
          data.intentionAct,
          actDocType.id,
          'Acta de Intención'
        ).pipe(
          map(() => void 0)
        )
      );
    }

    if (data.tradicionLibertadCertificado && tradicionLibertadDocType) {
      uploads.push(
        this.organizationDocumentService.uploadDocument(
          organizationId,
          data.tradicionLibertadCertificado,
          tradicionLibertadDocType.id,
          'Certificado de Tradición y Libertad'
        ).pipe(
          map(() => void 0)
        )
      );
    }

    if (uploads.length === 0) {
      return of(void 0);
    }

    return forkJoin(uploads).pipe(map(() => void 0));
  }

  onModalAlertConfirm() {
    this.modalAlertData.set(null);
  }

  markStepAsTouched() {
    // This method would trigger form validation display in child components
    // Since we are using Signals and separate components, we might need a mechanism 
    // to broadcast "validate now" or rely on the fact that users have likely interacted.
    // For a robust solution, we could emit an event to the active step component.
  }

  // --- Data Updates ---

  updateIdentification(data: IdentificationData) {
    if (!data) {
      console.warn('updateIdentification received null data, skipping update');
      return;
    }
    
    // If organization changes, we might need to reset Step 4 (only in creation mode)
    const prev = this.identificationData();
    if (prev && prev.organizationIdentifier !== data.organizationIdentifier && !this.initialData) {
      this.responseTeam.set([]); // Reset response team only in creation mode
    }
    this.identificationData.set(data);
  }

  updateTechnicalTable(assignment: TechnicalTableAssignment) {
    this.technicalTableAssignments.update(prev => {
      // Replace existing assignment for this axis or add new
      const filtered = prev.filter(a => a.eje !== assignment.eje);
      return [...filtered, assignment];
    });
  }

  updateResponseTeam(members: ResponseTeamMember[]) {
    this.responseTeam.set(members);
    
    // En modo edición, no guardamos automáticamente
    // Los cambios se guardarán al finalizar el wizard
  }
}
