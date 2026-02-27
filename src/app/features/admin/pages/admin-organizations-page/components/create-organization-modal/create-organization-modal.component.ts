import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateOrganizationDTO, Organization, OrganizationType } from '../../../../../../core/models/domain.models';

@Component({
  selector: 'app-admin-organization-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" (click)="close.emit()">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-in" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="font-bold text-gray-800 text-lg">
            {{ organization ? 'Editar Organización' : 'Nueva Organización' }}
          </h3>
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div class="space-y-4">
            <!-- Nombre -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Organización <span class="text-red-500">*</span></label>
              <input type="text" id="name" formControlName="name" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej: Constructora S.A."
                [class.border-red-300]="isInvalid('name')">
              @if (isInvalid('name')) {
                <p class="text-xs text-red-500 mt-1">El nombre es requerido</p>
              }
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Tipo -->
              <div>
                <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Tipo <span class="text-red-500">*</span></label>
                <select id="type" formControlName="type"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                  <option value="COMPANY">Empresa/Asociación</option>
                  <option value="PERSON">Persona Natural</option>
                </select>
              </div>

              <!-- Identificador (NIT/CC) -->
              <div>
                <label for="identifier" class="block text-sm font-medium text-gray-700 mb-1">NIT / CC <span class="text-red-500">*</span></label>
                <input type="text" id="identifier" formControlName="identifier"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ej: 900.123.456"
                  [class.border-red-300]="isInvalid('identifier')">
              </div>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico <span class="text-red-500">*</span></label>
              <input type="email" id="email" formControlName="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej: contacto@empresa.com"
                [class.border-red-300]="isInvalid('email')">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Departamento -->
              <div>
                <label for="region" class="block text-sm font-medium text-gray-700 mb-1">Departamento <span class="text-red-500">*</span></label>
                <input type="text" id="region" formControlName="region"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  [class.border-red-300]="isInvalid('region')">
              </div>

              <!-- Municipio -->
              <div>
                <label for="municipality" class="block text-sm font-medium text-gray-700 mb-1">Municipio <span class="text-red-500">*</span></label>
                <input type="text" id="municipality" formControlName="municipality"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  [class.border-red-300]="isInvalid('municipality')">
              </div>
            </div>

            <!-- Nombre Contacto -->
            <div>
              <label for="contactName" class="block text-sm font-medium text-gray-700 mb-1">Nombre de Contacto</label>
              <input type="text" id="contactName" formControlName="contactName"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej: María González">
            </div>

            <!-- Archivo Usuarios (Solo crear) -->
            @if (!organization) {
              <div>
                <label for="usersFile" class="block text-sm font-medium text-gray-700 mb-1">
                  Cargar Usuarios (.xlsx) <span class="text-red-500">*</span>
                </label>
                <div class="mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8 hover:bg-gray-50 transition-colors"
                     [class.bg-blue-50]="selectedFile()"
                     [class.border-blue-300]="selectedFile()">
                  <div class="text-center">
                    @if (selectedFile()) {
                      <span class="material-symbols-rounded mx-auto h-10 w-10 text-blue-500 block mb-2">description</span>
                      <div class="flex text-sm leading-6 text-gray-600 justify-center">
                        <span class="font-semibold text-blue-600 truncate max-w-[200px]">{{ selectedFile()?.name }}</span>
                      </div>
                      <p class="text-xs text-gray-500 mt-1">Archivo listo para cargar</p>
                      <button type="button" (click)="removeFile()" class="mt-2 text-xs font-medium text-red-600 hover:text-red-500 underline">Remover archivo</button>
                    } @else {
                      <span class="material-symbols-rounded mx-auto h-10 w-10 text-gray-400 block mb-2">upload_file</span>
                      <div class="flex text-sm leading-6 text-gray-600 justify-center">
                        <label for="file-upload" class="relative cursor-pointer rounded-md font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
                          <span>Subir archivo</span>
                          <input id="file-upload" name="file-upload" type="file" class="sr-only" accept=".xlsx" (change)="onFileSelected($event)">
                        </label>
                        <p class="pl-1">o arrastrar</p>
                      </div>
                      <p class="text-xs leading-5 text-gray-500 mt-1">XLSX hasta 10MB</p>
                    }
                  </div>
                </div>
                @if (fileError()) {
                  <p class="mt-1 text-xs text-red-500">{{ fileError() }}</p>
                }
              </div>
            }
          </div>

          <!-- Footer Buttons -->
          <div class="pt-4 flex gap-3">
            <button type="button" (click)="close.emit()" 
              class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" 
              [disabled]="form.invalid || (!organization && !selectedFile()) || isSubmitting()"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed">
              @if (isSubmitting()) {
                <span class="material-symbols-rounded animate-spin text-sm mr-2">progress_activity</span>
                Guardando...
              } @else {
                {{ organization ? 'Guardar Cambios' : 'Crear Organización' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class AdminOrganizationCreateModalComponent implements OnInit {
  @Input() organization: Organization | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<{ dto: CreateOrganizationDTO, file: File }>();
  @Output() update = new EventEmitter<{ id: string, dto: CreateOrganizationDTO }>();

  private fb = inject(FormBuilder);
  
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    type: ['COMPANY' as OrganizationType, Validators.required],
    identifier: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    municipality: ['', Validators.required],
    region: ['', Validators.required],
    contactName: ['']
  });

  selectedFile = signal<File | null>(null);
  fileError = signal<string | null>(null);
  isSubmitting = signal(false);

  ngOnInit() {
    if (this.organization) {
      const municipalityValue = typeof this.organization.municipality === 'string' 
        ? this.organization.municipality 
        : this.organization.municipality?.nombre || '';
      
      const regionValue = typeof this.organization.region === 'string' 
        ? this.organization.region 
        : this.organization.region?.nombre || '';

      this.form.patchValue({
        name: this.organization.name,
        type: this.organization.type,
        identifier: this.organization.identifier,
        email: this.organization.email,
        municipality: municipalityValue,
        region: regionValue,
        contactName: this.organization.contactName || ''
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.name.endsWith('.xlsx')) {
        this.selectedFile.set(file);
        this.fileError.set(null);
      } else {
        this.selectedFile.set(null);
        this.fileError.set('Por favor seleccione un archivo .xlsx válido');
      }
    }
  }

  removeFile() {
    this.selectedFile.set(null);
    this.fileError.set(null);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return control ? (control.touched && control.invalid) : false;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formData = this.form.getRawValue();
    
    const dto: CreateOrganizationDTO = {
      name: formData.name,
      type: formData.type as OrganizationType,
      identifier: formData.identifier,
      email: formData.email,
      municipality: formData.municipality,
      region: formData.region,
      contactName: formData.contactName,
      status: this.organization ? this.organization.status : 'ACTIVE'
    };

    if (this.organization) {
      const updateDto: any = { ...dto };
      
      if (typeof this.organization.municipality === 'object') {
        updateDto.municipalityId = this.organization.municipality.id;
      }
      if (typeof this.organization.region === 'object') {
        updateDto.regionId = this.organization.region.id;
      }
      
      this.update.emit({ id: this.organization.id, dto: updateDto });
    } else {
      if (!this.selectedFile()) {
        this.fileError.set('Debe cargar el archivo de usuarios');
        this.isSubmitting.set(false);
        return;
      }
      this.create.emit({ dto, file: this.selectedFile()! });
    }
    // Note: Parent component handles the actual service call and should stop loading or close modal
    // Ideally we'd have an input for loading state from parent, but this is a simple impl.
  }
}
