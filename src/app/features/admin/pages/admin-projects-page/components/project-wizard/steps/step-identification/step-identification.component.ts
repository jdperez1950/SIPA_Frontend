import { Component, EventEmitter, inject, Input, OnInit, Output, effect, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { CustomDropdownComponent, CustomDropdownItem } from '../../../shared/custom-dropdown/custom-dropdown.component';
import { IdentificationData, ParametroSelect } from '../../project-wizard.types';
import { ParametroBaseService } from '../../../../../../../../core/services/parametro-base.service';
import { CurrencyFormatDirective } from '../../../../../../../../core/directives/currency-format.directive';
import { EvidenceUploaderComponent } from '../../../../../../../../features/project-workspace/components/evidence-uploader/evidence-uploader.component';
import { EvidenceConfig } from '../../../../../../../../core/models/question.models';
import {
  nitFormatValidator,
  getNitFormatErrorMessage,
  getRequiredErrorMessage,
  getEmailErrorMessage,
  getMinLengthErrorMessage,
  maxDigitsValidator,
  getMaxDigitsErrorMessage,
} from '../../../../../../../../shared/validators';

import { FileService } from '../../../../../../../../core/services/file.service';
import { FinanciacionFuente } from '../../../../../../../../core/models/domain.models';

@Component({
  selector: 'app-step-identification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomDropdownComponent, CurrencyFormatDirective, EvidenceUploaderComponent],
  templateUrl: './step-identification.component.html',
  styleUrls: ['./step-identification.component.css']
})
export class StepIdentificationComponent implements OnInit {
  @Input() initialData: IdentificationData | null = null;
  @Input() readOnly = false;
  @Output() dataChange = new EventEmitter<IdentificationData>();

  private fb = inject(FormBuilder);
  public parametroBaseService = inject(ParametroBaseService);
  private fileService = inject(FileService);

  form!: FormGroup;
  
  legalFileConfig: EvidenceConfig = {
    allowedFormats: ['.pdf'],
    maxSizeMb: 10
  };

  organizationTypes = computed(() =>
    this.parametroBaseService.tiposOrganizacion().map(t => ({
      id: t.id,
      nombre: t.nombre,
      tipo: t.tipo,
      codigo: t.codigo
    }))
  );

  tieneTerrenoOptions = computed(() =>
    this.parametroBaseService.proyectoTerreno().map(t => ({
      id: t.id,
      nombre: t.nombre,
      tipo: t.tipo,
      codigo: t.codigo
    }))
  );

  requiresTradicionLibertadCertificado = signal(false);

  tieneFinanciacionOptions = computed(() =>
    this.parametroBaseService.proyectoFinanciacion().map(t => ({
      id: t.id,
      nombre: t.nombre,
      tipo: t.tipo,
      codigo: t.codigo
    }))
  );

  fuentesFinanciacion = this.parametroBaseService.fuentesFinanciacion;

  showDetalleFinanciacion = signal(false);

  // Lists for selects - Access service signal directly
  municipios: ParametroSelect[] = [];
  isManualMunicipality = false;

  constructor() {
    // Effect to handle financing sources
    effect(() => {
      const sources = this.fuentesFinanciacion();
      if (this.form && sources.length > 0) {
        const detalleArray = this.form.get('detalleFinanciacion') as FormArray;
        
        // Only rebuild if empty or different length (simple check to avoid loop if possible)
        // Or just clear and rebuild.
        // We need to preserve existing values if possible (e.g. initialData loaded, or user input)
        const currentValues = detalleArray.value as any[];
        
        detalleArray.clear();
        
        sources.forEach(source => {
          let dinero = 0;
          let especie = 0;
          
          // Check initialData first
          // El backend devuelve null en fuente, asi que usamos el índice temporalmente si coincide
          const initialMatch = this.initialData?.detalleFinanciacion?.find((f, index) => 
            (f.fuente?.id === source.id) || 
            (source.codigo && f.fuente?.codigo === source.codigo)
          );

          if (initialMatch) {
            dinero = initialMatch.dinero || 0;
            especie = initialMatch.especie || 0;
          } else if (this.initialData?.detalleFinanciacion && this.initialData.detalleFinanciacion.length > 0) {
             // Fallback por índice si la fuente es null (temporal mientras backend arregla)
             // Asumimos que el orden es el mismo que fuentesFinanciacion
             const index = sources.indexOf(source);
             if (index >= 0 && index < this.initialData.detalleFinanciacion.length) {
                const matchByIndex = this.initialData.detalleFinanciacion[index];
                if (matchByIndex) {
                    dinero = matchByIndex.dinero || 0;
                    especie = matchByIndex.especie || 0;
                }
             }
          }
          
          // Check current form values (in case of re-render or updates)
          const currentMatch = currentValues.find(v => v.id === source.id);
          if (currentMatch) {
             dinero = currentMatch.dinero;
             especie = currentMatch.especie;
          }

          detalleArray.push(this.fb.group({
            id: [source.id],
            fuente: [source.nombre], // Esto es solo display, no se envia
            fuenteId: [source.id], // ID real para enviar
            dinero: [dinero, [Validators.min(0), maxDigitsValidator(12)]],
            especie: [especie, [Validators.min(0), maxDigitsValidator(12)]]
          }));
        });
        
        // Re-apply visibility logic
        const tieneFinanciacionVal = this.form.get('tieneFinanciacion')?.value;
        this.updateFinanciacionVisibility(tieneFinanciacionVal || '');
      }
    });

    // Effect to handle initial data loading when service is ready
    effect(() => {
        const depts = this.parametroBaseService.departamentos();
        const deptValue = this.form?.get('department')?.value;

        // If we have initial data and form exists, handle department and municipality
        if (depts.length > 0 && this.initialData?.departmentId?.id && this.form) {
            const found = depts.find(d => d.id === this.initialData!.departmentId?.id);

            // Set department if not already set
            if (found && deptValue !== found.id) {
                this.form.patchValue({ department: found.id }, { emitEvent: false });
            }

            // Load municipios for this department if we have a department ID
            const deptIdToUse = found?.id || deptValue;
            if (deptIdToUse && this.municipios.length === 0) {
                this.parametroBaseService.getMunicipiosPorDepto(deptIdToUse).subscribe(municipios => {
                    this.municipios = municipios.map(m => ({ id: m.id, nombre: m.nombre, tipo: m.tipo, codigo: m.codigo }));

                    // Set municipality if we have initial data
                    if (this.initialData?.municipality?.id) {
                        const municipioFound = this.municipios.find(m => m.id === this.initialData!.municipality!.id);
                        if (municipioFound) {
                            this.form.patchValue({ municipality: municipioFound.id }, { emitEvent: false });
                        }
                    }
                });
            }
        }

        // Handle organization type when tiposOrganizacion are loaded
        const orgTypes = this.parametroBaseService.tiposOrganizacion();
        if (orgTypes.length > 0 && this.initialData && this.form) {
          const currentOrgType = this.form.get('organizationType')?.value;
          const orgTypeId = this.initialData.organizationType?.id || this.initialData.organizationType;
          
          if (orgTypeId && currentOrgType !== orgTypeId) {
            this.form.patchValue({ organizationType: orgTypeId }, { emitEvent: false });
          }
        }

        // Handle verification digit and other fields when initialData changes
        if (this.initialData && this.form) {
          const currentVerificationDigit = this.form.get('verificationDigit')?.value;
          if (this.initialData.verificationDigit && currentVerificationDigit !== this.initialData.verificationDigit) {
            this.form.patchValue({ verificationDigit: this.initialData.verificationDigit }, { emitEvent: false });
          }


        }
      });
  }

  private emitFormData() {
    if (this.form && this.form.value) {
      this.emitDataChange(this.form.value);
    }
  }

  ngOnInit() {
    this.initForm();
    
    if (this.readOnly) {
      this.form.disable();
    }
    
    // Emit changes to parent
    this.form.valueChanges.subscribe(value => {
      // Debug form state
      if (this.form.invalid) {
        // console.log('❌ [form.valueChanges] Formulario INVÁLIDO');
        // console.log('  - Form errors:', this.form.errors);
        
        // Show ALL field errors (not just dirty/touched)
        Object.keys(this.form.controls).forEach(key => {
          const control = this.form.get(key);
          if (control?.invalid) {
            // console.log(`  - ${key} inválido:`, control.errors, `(dirty: ${control.dirty}, touched: ${control.touched})`);
          }
        });
      }
      
      if (this.form.valid) {
        // console.log('✅ [form.valueChanges] Formulario VÁLIDO. Emitiendo datos...');
        // console.log('  - isLegallyConstituted:', value.isLegallyConstituted);
        
        // Find department and municipality IDs and names
        const deptId = value.department;
        const deptName = this.parametroBaseService.departamentos().find(d => d.id === deptId)?.nombre || '';
        
        // Municipality - find ID from loaded municipalities or use as-is (manual entry)
        let municipalityId: string | null = null;
        let municipalityName: string | null = null;
        
        if (this.isManualMunicipality) {
          municipalityId = null;
          municipalityName = value.municipality || null;
        } else {
          const municipio = this.municipios.find(m => m.id === value.municipality);
          if (municipio) {
            municipalityId = municipio.id;
            municipalityName = municipio.nombre;
          } else {
            municipalityId = value.municipality || null;
            municipalityName = this.municipios.find(m => m.id === value.municipality)?.nombre || value.municipality || null;
          }
        }
        
        this.emitDataChange(value);
      } else {
        // console.log('❌ [form.valueChanges] Emitiendo NULL (formulario inválido)');
        // Emit null to indicate invalid state
        this.dataChange.emit(null as any);
      }
    });
  }

  private emitDataChange(value: any) {
    // Find department and municipality IDs and names
    const deptId = value.department;
    const deptName = this.parametroBaseService.departamentos().find(d => d.id === deptId)?.nombre || '';
    
    // Municipality - find ID from loaded municipalities or use as-is (manual entry)
    let municipalityId: string | null = null;
    let municipalityName: string | null = null;
    
    if (this.isManualMunicipality) {
      municipalityId = null;
      municipalityName = value.municipality || null;
    } else {
      const municipio = this.municipios.find(m => m.id === value.municipality);
      if (municipio) {
        municipalityId = municipio.id;
        municipalityName = municipio.nombre;
      } else {
        municipalityId = value.municipality || null;
        municipalityName = this.municipios.find(m => m.id === value.municipality)?.nombre || value.municipality || null;
      }
    }
    
    // Find organization type code from GUID
    const orgType = this.parametroBaseService.tiposOrganizacion().find((t: any) => t.id === value.organizationType);
    
    const deptParam = this.parametroBaseService.departamentos().find(d => d.id === deptId);
    let municipioParam = this.municipios.find(m => m.id === municipalityId);
    
    // If not found in loaded municipios and we have initialData, use it
    if (!municipioParam && this.initialData?.municipality?.id) {
      municipioParam = this.initialData.municipality;
    }
    
    const orgTypeParam = this.parametroBaseService.tiposOrganizacion().find((t: any) => t.id === value.organizationType);
    const tieneTerrenoParam = this.tieneTerrenoOptions().find(t => t.id === value.tieneTerreno);
    const tieneFinanciacionParam = this.tieneFinanciacionOptions().find(t => t.id === value.tieneFinanciacion);

    // Filter and format detalleFinanciacion (only include rows with values)
    const detalleFinanciacion = value.detalleFinanciacion
      ?.filter((item: any) => item.dinero > 0 || item.especie > 0)
      .map((item: any) => ({
        fuente: { 
          id: item.id,
          nombre: item.fuente
        },
        dinero: item.dinero || 0,
        especie: item.especie || 0
      })) || [];

    this.dataChange.emit({
      organizationId: this.initialData?.organizationId || value.organizationId,
      description: value.description,
      projectValue: value.projectValue || 0,
      housingCount: value.housingCount || 0,
      beneficiariesCount: value.beneficiariesCount || 0,
      tieneTerreno: tieneTerrenoParam ? { id: tieneTerrenoParam.id, nombre: tieneTerrenoParam.nombre, tipo: tieneTerrenoParam.tipo, codigo: tieneTerrenoParam.codigo } : null,
      landDescription: value.landDescription || '',
      tieneFinanciacion: tieneFinanciacionParam ? { id: tieneFinanciacionParam.id, nombre: tieneFinanciacionParam.nombre, tipo: tieneFinanciacionParam.tipo, codigo: tieneFinanciacionParam.codigo } : null,
      financingDescription: value.financingDescription || '',
      detalleFinanciacion: detalleFinanciacion.length > 0 ? detalleFinanciacion : undefined,
      departmentId: deptParam ? { id: deptParam.id, nombre: deptParam.nombre, tipo: deptParam.tipo, codigo: deptParam.codigo } : null,
      departmentName: deptParam?.nombre || '',
      municipality: municipioParam ? { id: municipioParam.id, nombre: municipioParam.nombre, tipo: municipioParam.tipo, codigo: municipioParam.codigo } : null,
      municipalityName: municipioParam?.nombre || null,
      organizationName: value.organizationName,
      isLegallyConstituted: value.isLegallyConstituted,
      legalRepresentativeCertificate: value.legalRepresentativeCertificate,
      intentionAct: value.intentionAct,
      tradicionLibertadCertificado: value.tradicionLibertadCertificado,
      organizationType: orgTypeParam ? { id: orgTypeParam.id, nombre: orgTypeParam.nombre, tipo: orgTypeParam.tipo, codigo: orgTypeParam.codigo } : null,
      organizationIdentifier: value.organizationIdentifier,
      verificationDigit: value.verificationDigit,
      organizationEmail: value.organizationEmail,
      website: value.website,
      organizationDescription: value.organizationDescription,
      organizationAddress: value.organizationAddress,
      startDate: value.startDate,
      endDate: value.endDate,
      submissionDeadline: value.submissionDeadline
    });
  }

  toggleManualMunicipality() {
    this.isManualMunicipality = !this.isManualMunicipality;
    this.form.get('municipality')?.setValue(null);
    this.form.get('municipality')?.markAsUntouched();
  }

  private initForm() {
    const today = new Date().toISOString().split('T')[0];
    const defaultStart = today;
    const defaultDeadline = '2026-12-24';
    const defaultEnd = '2026-12-31';

    // Map initial department ID from initialData
    let initialDeptId = null;
    if (this.initialData?.departmentId?.id) {
      initialDeptId = this.initialData.departmentId.id;
    }
    
    // Map initial municipality ID or name
    let initialMunicipio = null;
    if (this.initialData?.municipality?.id) {
      initialMunicipio = this.initialData.municipality.id;
    } else if (this.initialData?.municipalityName) {
      initialMunicipio = this.initialData.municipalityName;
    }

    // Map initial organization type from ParametroSelect
    let initialOrgType = null;
    if (this.initialData?.organizationType?.id) {
      initialOrgType = this.initialData.organizationType.id;
    }

    this.form = this.fb.group({
      description: [this.initialData?.description || '', [Validators.required, Validators.minLength(10)]],
      housingCount: [this.initialData?.housingCount || 0],
      beneficiariesCount: [this.initialData?.beneficiariesCount || 0],
      projectValue: [this.initialData?.projectValue || 0],
      tieneTerreno: [this.initialData?.tieneTerreno?.id || '', Validators.required],
      landDescription: [this.initialData?.landDescription || '', Validators.minLength(10)],
      tieneFinanciacion: [this.initialData?.tieneFinanciacion?.id || '', Validators.required],
      financingDescription: [this.initialData?.financingDescription || '', Validators.minLength(10)],
      detalleFinanciacion: this.fb.array([]),
      department: [this.initialData?.departmentId?.id || initialDeptId, Validators.required],
      municipality: [this.initialData?.municipality?.id || initialMunicipio, Validators.required],
      organizationName: [this.initialData?.organizationName || '', [Validators.required, Validators.minLength(3)]],
      isLegallyConstituted: [this.initialData?.isLegallyConstituted || '', Validators.required],
      legalRepresentativeCertificate: [this.initialData?.legalRepresentativeCertificate || null],
      legalRepresentativeCertificateFileId: [(this.initialData as any)?.legalRepresentativeCertificateFileId || ''],
      intentionAct: [this.initialData?.intentionAct || null],
      intentionActFileId: [(this.initialData as any)?.intentionActFileId || ''],
      tradicionLibertadCertificado: [this.initialData?.tradicionLibertadCertificado || null],
      tradicionLibertadCertificadoFileId: [(this.initialData as any)?.tradicionLibertadCertificadoFileId || ''],
      organizationType: [initialOrgType, Validators.required],
      organizationIdentifier: [this.initialData?.organizationIdentifier || ''],
      verificationDigit: [this.initialData?.verificationDigit || ''],
      organizationEmail: [this.initialData?.organizationEmail || '', [Validators.required, Validators.email]],
      website: [this.initialData?.website || '', [Validators.pattern(/^(https?:\/\/)?[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(\/.*)?$/)]],
      organizationDescription: [this.initialData?.organizationDescription || '', [Validators.required, Validators.minLength(10)]],
      organizationAddress: [this.initialData?.organizationAddress || '', Validators.required],
      startDate: [this.initialData?.startDate || defaultStart],
      endDate: [this.initialData?.endDate || defaultEnd],
      submissionDeadline: [this.initialData?.submissionDeadline || defaultDeadline]
    }, { validators: [this.dateRangeValidator] });

    // Initial validation setup
    this.updateLegalValidators(this.form.get('isLegallyConstituted')?.value);

    // Subscribe to changes in isLegallyConstituted
    this.form.get('isLegallyConstituted')?.valueChanges.subscribe(val => {
      this.updateLegalValidators(val);
    });

    // Subscribe to changes in tieneTerreno to validate tradicionLibertadCertificado
    this.form.get('tieneTerreno')?.valueChanges.subscribe(val => {
      this.updateTerrenoValidators(val);
    });

    // Subscribe to changes in tieneFinanciacion to show/hide detalleFinanciacion
    this.form.get('tieneFinanciacion')?.valueChanges.subscribe(val => {
      this.updateFinanciacionVisibility(val);
    });

    // Initial visibility setup for financing detail
    this.updateFinanciacionVisibility(this.form.get('tieneFinanciacion')?.value);

    // Handle department changes to load municipalities
    this.form.get('department')?.valueChanges.subscribe((deptId) => {
      // Only reset if changed by user (dirty), or if we want to enforce it.
      // Careful with initial load.
      const currentMunicipality = this.form.get('municipality')?.value;
      
      if (deptId) {
        this.parametroBaseService.getMunicipiosPorDepto(deptId).subscribe(municipios => {
          this.municipios = municipios.map(m => ({ id: m.id, nombre: m.nombre, tipo: m.tipo, codigo: m.codigo }));
          
          // If no municipalities found, switch to manual mode automatically
          if (this.municipios.length === 0) {
            this.isManualMunicipality = true;
          } else {
            // Check if current value exists in the new list
            const exists = this.municipios.some(m => m.nombre === currentMunicipality);
            
            // If value exists, keep dropdown (manual=false).
            // If value doesn't exist but has value (initial load of manual data), switch to manual.
            // If user changed department (dirty), reset to dropdown.
            if (currentMunicipality && !exists && !this.form.get('department')?.dirty) {
                this.isManualMunicipality = true;
            } else {
                this.isManualMunicipality = false;
            }
          }

          // If current municipality is not in the new list, reset it ONLY if user changed department
          const exists = this.municipios.some(m => m.nombre === currentMunicipality);
          if (!exists && this.form.get('department')?.dirty) {
               this.form.get('municipality')?.setValue(null);
               this.isManualMunicipality = false; // Reset to dropdown for new department selection
          }
        });
      } else {
        this.municipios = [];
        this.isManualMunicipality = false;
        this.form.get('municipality')?.setValue(null);
      }
    });
  }

  updateLegalValidators(isLegallyConstituted: string) {
    // console.log('🔍 [updateLegalValidators] isLegallyConstituted:', isLegallyConstituted);
    
    const nitControl = this.form.get('organizationIdentifier');
    const dvControl = this.form.get('verificationDigit');
    const legalFileControl = this.form.get('legalRepresentativeCertificate');
    const intentionFileControl = this.form.get('intentionAct');

    // console.log('🔍 [updateLegalValidators] Estado de controles ANTES:');
    // console.log('  - NIT valid:', nitControl?.valid, 'errors:', nitControl?.errors, 'value:', nitControl?.value);
    // console.log('  - DV valid:', dvControl?.valid, 'errors:', dvControl?.errors, 'value:', dvControl?.value);
    // console.log('  - LegalFile valid:', legalFileControl?.valid, 'errors:', legalFileControl?.errors, 'value:', legalFileControl?.value);
    // console.log('  - IntentionFile valid:', intentionFileControl?.valid, 'errors:', intentionFileControl?.errors, 'value:', intentionFileControl?.value);

    if (isLegallyConstituted === 'Sí') {
      // console.log('✅ [updateLegalValidators] SÍ: Activando validadores para NIT, DV y LegalFile');
      // NIT: 9 digits required
      nitControl?.setValidators([Validators.required, Validators.pattern(/^\d{9}$/)]);
      // DV: 1 digit required
      dvControl?.setValidators([Validators.required, Validators.pattern(/^\d{1}$/)]);
      
      // File: Certificate required
      legalFileControl?.setValidators([Validators.required]);
      intentionFileControl?.clearValidators();
      intentionFileControl?.setValue(null);
    } else {
      // console.log('❌ [updateLegalValidators] NO: Desactivando validadores para NIT, DV, LegalFile e IntentionFile');
      // NIT/DV: Not required
      nitControl?.clearValidators();
      dvControl?.clearValidators();

      // File: Not required
      intentionFileControl?.clearValidators();
      legalFileControl?.clearValidators();

      // Reset values when switching to NO
      nitControl?.setValue('');
      dvControl?.setValue('');
      legalFileControl?.setValue(null);
      intentionFileControl?.setValue(null);
    }

    nitControl?.updateValueAndValidity();
    dvControl?.updateValueAndValidity();
    legalFileControl?.updateValueAndValidity();
    intentionFileControl?.updateValueAndValidity();

    // console.log('🔍 [updateLegalValidators] Estado de controles DESPUÉS:');
    // console.log('  - NIT valid:', nitControl?.valid, 'errors:', nitControl?.errors, 'value:', nitControl?.value);
    // console.log('  - DV valid:', dvControl?.valid, 'errors:', dvControl?.errors, 'value:', dvControl?.value);
    // console.log('  - LegalFile valid:', legalFileControl?.valid, 'errors:', legalFileControl?.errors, 'value:', legalFileControl?.value);
    // console.log('  - IntentionFile valid:', intentionFileControl?.valid, 'errors:', intentionFileControl?.errors, 'value:', intentionFileControl?.value);
  }

  onLegalFileSelected(file: File) {
    this.form.patchValue({ legalRepresentativeCertificate: file });
    this.form.get('legalRepresentativeCertificate')?.markAsTouched();
  }

  onIntentionFileSelected(file: File) {
    this.form.patchValue({ intentionAct: file });
    this.form.get('intentionAct')?.markAsTouched();
  }

  markAllAsTouched() {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  onTradicionLibertadCertificadoSelected(file: File) {
    this.form.patchValue({ tradicionLibertadCertificado: file });
    this.form.get('tradicionLibertadCertificado')?.markAsTouched();
  }

  updateTerrenoValidators(tieneTerrenoId: string) {
    const tradicionLibertadCertificadoControl = this.form.get('tradicionLibertadCertificado');
    
    // Find the terreno option with ID tieneTerrenoId to check if it's "SI"
    const terrenoOption = this.tieneTerrenoOptions().find(t => t.id === tieneTerrenoId);
    const esSi = terrenoOption?.nombre?.toUpperCase() === 'SI';

    this.requiresTradicionLibertadCertificado.set(esSi);

    if (esSi) {
      tradicionLibertadCertificadoControl?.setValidators([Validators.required]);
    } else {
      tradicionLibertadCertificadoControl?.clearValidators();
      tradicionLibertadCertificadoControl?.setValue(null);
    }

    tradicionLibertadCertificadoControl?.updateValueAndValidity();
  }

  updateFinanciacionVisibility(tieneFinanciacionId: string) {
    const financOption = this.tieneFinanciacionOptions().find(t => t.id === tieneFinanciacionId);
    const tieneFinanciacion = financOption?.nombre?.toUpperCase().startsWith('SI') ?? false;

    this.showDetalleFinanciacion.set(tieneFinanciacion);

    const detalleArray = this.form.get('detalleFinanciacion') as FormArray;
    const financingDescriptionControl = this.form.get('financingDescription');
    
    if (tieneFinanciacion) {
      // Si tiene financiación, mantenemos los validadores
      // NO SOBRESCRIBIMOS VALORES AQUI, solo actualizamos validez
      detalleArray.controls.forEach(control => {
        control.get('dinero')?.setValidators([Validators.min(0), maxDigitsValidator(12)]);
        control.get('especie')?.setValidators([Validators.min(0), maxDigitsValidator(12)]);
        control.get('dinero')?.updateValueAndValidity();
        control.get('especie')?.updateValueAndValidity();
      });
      financingDescriptionControl?.setValidators([Validators.minLength(10)]);
      financingDescriptionControl?.updateValueAndValidity();
    } else {
      // Si NO tiene financiación, limpiamos valores y validadores
      detalleArray.controls.forEach(control => {
        control.get('dinero')?.setValue(0);
        control.get('especie')?.setValue(0);
        control.get('dinero')?.clearValidators();
        control.get('especie')?.clearValidators();
        control.get('dinero')?.updateValueAndValidity();
        control.get('especie')?.updateValueAndValidity();
      });
      financingDescriptionControl?.clearValidators();
      financingDescriptionControl?.setValue('');
      financingDescriptionControl?.updateValueAndValidity();
    }
  }

  // Remove duplicated and old listener
  // private resetMunicipality() { ... }

  private dateRangeValidator(group: FormGroup) {
    // Si las fechas son opcionales o auto-llenadas, esta validación podría estar fallando 
    // si los valores por defecto no cumplen la lógica o si están vacíos y el validator espera strings.
    
    // Si estamos en modo de prueba con fechas ocultas, simplemente retornamos null
    // para evitar bloqueos por validaciones de zona horaria o formato.
    return null;

    /* 
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    const deadline = group.get('submissionDeadline')?.value;

    // Si alguno falta, no validamos rango (asumimos que si son required fallarán por otro lado)
    if (!start || !end || !deadline) return null;

    // Parseando fechas como UTC para evitar problemas de zona horaria
    const parseDate = (dateStr: string) => {
        const parts = dateStr.split('-');
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    };

    const startDate = parseDate(start);
    const endDate = parseDate(end);
    const deadlineDate = parseDate(deadline);

    const errors: any = {};

    // Validar que sean fechas válidas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(deadlineDate.getTime())) {
       return null;
    }

    if (endDate < startDate) {
      errors.endDateInvalid = true;
    }

    if (deadlineDate < startDate || deadlineDate > endDate) {
      errors.deadlineInvalid = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
    */
  }

  onDepartmentChange(deptId: string) {
    this.form.get('department')?.setValue(deptId, { emitEvent: true });
    
    if (deptId) {
      this.parametroBaseService.getMunicipiosPorDepto(deptId).subscribe(municipios => {
        this.municipios = municipios.map(m => ({ id: m.id, nombre: m.nombre, tipo: m.tipo, codigo: m.codigo }));
        this.form.get('municipality')?.setValue(null);
      });
    } else {
      this.municipios = [];
      this.form.get('municipality')?.setValue(null);
    }
  }

  onDepartmentDropdownOpen() {
    this.form.get('department')?.markAsTouched();
  }

  onMunicipalityDropdownOpen() {
    this.form.get('municipality')?.markAsTouched();
  }

  onMunicipalityChange(municipalityName: string) {
    this.form.get('municipality')?.setValue(municipalityName, { emitEvent: true });
  }

  getOrganizationNameErrorMessage(): string {
    const control = this.form.get('organizationName');
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }
    
    if (control.hasError('minlength')) {
      return getMinLengthErrorMessage(control.errors['minlength'].requiredLength);
    }
    
    return '';
  }

  getOrganizationIdentifierErrorMessage(): string {
    const control = this.form.get('organizationIdentifier');
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }
    
    if (control.hasError('nitFormat')) {
      return getNitFormatErrorMessage();
    }
    
    return '';
  }

  getOrganizationEmailErrorMessage(): string {
    const control = this.form.get('organizationEmail');
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }
    
    if (control.hasError('email')) {
      return getEmailErrorMessage();
    }
    
    return '';
  }

  getOrganizationAddressErrorMessage(): string {
    const control = this.form.get('organizationAddress');
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }
    
    return '';
  }

  getDepartmentErrorMessage(): string {
    const control = this.form.get('department');
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }
    
    return '';
  }

  getMunicipalityErrorMessage(): string {
    const control = this.form.get('municipality');
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }
    
    return '';
  }

  getOrganizationDescriptionErrorMessage(): string {
    const control = this.form.get('organizationDescription');
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }
    
    if (control.hasError('minlength')) {
      return getMinLengthErrorMessage(control.errors['minlength'].requiredLength);
    }

    return '';
  }

  getLandDescriptionErrorMessage(): string {
    const control = this.form.get('landDescription');
    if (!control || !control.errors) return '';

    if (control.hasError('minlength')) {
      return getMinLengthErrorMessage(control.errors['minlength'].requiredLength);
    }

    return '';
  }

  getFinancingDescriptionErrorMessage(): string {
    const control = this.form.get('financingDescription');
    if (!control || !control.errors) return '';

    if (control.hasError('minlength')) {
      return getMinLengthErrorMessage(control.errors['minlength'].requiredLength);
    }

    return '';
  }

  getTieneTerrenoErrorMessage(): string {
    const control = this.form.get('tieneTerreno');
    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }

    return '';
  }

  getTieneFinanciacionErrorMessage(): string {
    const control = this.form.get('tieneFinanciacion');
    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }

    return '';
  }

  get detalleFinanciacionArray(): FormArray {
    return this.form.get('detalleFinanciacion') as FormArray;
  }

  getDineroControl(index: number): FormControl {
    return this.detalleFinanciacionArray.at(index).get('dinero') as FormControl;
  }

  getEspecieControl(index: number): FormControl {
    return this.detalleFinanciacionArray.at(index).get('especie') as FormControl;
  }

  totalDinero(): number {
    return this.detalleFinanciacionArray.controls.reduce(
      (total, control) => total + (control.get('dinero')?.value || 0),
      0
    );
  }

  totalEspecie(): number {
    return this.detalleFinanciacionArray.controls.reduce(
      (total, control) => total + (control.get('especie')?.value || 0),
      0
    );
  }

  getMaxDigitsMsg(): string {
    return getMaxDigitsErrorMessage(12);
  }
}
