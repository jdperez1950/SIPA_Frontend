import { Component, EventEmitter, inject, Input, OnInit, Output, effect, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponseTeamMember, ParametroSelect } from '../../project-wizard.types';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from '../../../../../../../../core/services/confirmation.service';
import { ParametroBaseService } from '../../../../../../../../core/services/parametro-base.service';
import { CustomDropdownComponent } from '../../../shared/custom-dropdown/custom-dropdown.component';
import {
  numericOnlyValidator,
  nitFormatValidator,
  textOnlyValidator,
  getNumericOnlyErrorMessage,
  getNitFormatErrorMessage,
  getTextOnlyErrorMessage,
  getEmailErrorMessage,
  getRequiredErrorMessage,
  getMinNameLengthErrorMessage,
  getMinDocumentNumberLengthErrorMessage,
  phoneLengthValidator,
  getPhoneLengthErrorMessage,
  getMinLengthErrorMessage
} from '../../../../../../../../shared/validators';

@Component({
  selector: 'app-step-response-team',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomDropdownComponent],
  templateUrl: './step-response-team.component.html',
  styles: []
})
export class StepResponseTeamComponent implements OnInit {
  @Input() organizationId?: string;
  @Input({ required: true }) organizationName!: string;
  @Input({ required: true }) selectedMembers: ResponseTeamMember[] = [];
  @Input() initialResponsible: ParametroSelect | null = null;
  @Output() selectionChange = new EventEmitter<ResponseTeamMember[]>();
  @Output() responsibleChange = new EventEmitter<ParametroSelect | null>();

  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  private parametroBaseService = inject(ParametroBaseService);

  userForm!: FormGroup;
  responsibleControl!: FormControl;
  isSearching = false;
  editingMember = signal<ResponseTeamMember | null>(null);
  isEditMode = computed(() => this.editingMember() !== null);

  documentType = signal('');

  constructor() {
    effect(() => {
      this.updateDocumentValidators();
    });
  }

  documentTypes = computed(() =>
    this.parametroBaseService.tiposDocumento().map(d => ({
      id: d.id,
      nombre: d.nombre,
      tipo: d.tipo,
      codigo: d.codigo
    }))
  );

  responsiblePositions = computed(() =>
    this.parametroBaseService.tiposEncargado().map(c => ({
      id: c.id,
      nombre: c.nombre,
      tipo: c.tipo,
      codigo: c.codigo
    }))
  );

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialResponsible'] && !changes['initialResponsible'].firstChange) {
      if (this.responsibleControl) {
        this.responsibleControl.setValue(this.initialResponsible?.id || '', { emitEvent: false });
      }
    }
  }

  getDocumentTypeName(id: string): string {
    const docType = this.documentTypes().find(d => d.id === id);
    return docType?.nombre || id;
  }

  getResponsiblePositionName(id: string): string {
    const position = this.responsiblePositions().find(p => p.id === id);
    return position?.nombre || id;
  }

  private initForm() {
    this.responsibleControl = new FormControl(this.initialResponsible?.id || '', Validators.required);
    this.responsibleControl.valueChanges.subscribe(value => {
      const selected = this.responsiblePositions().find(p => p.id === value);
      this.responsibleChange.emit(selected || null);
    });

    this.userForm = this.fb.group({
      documentType: ['', Validators.required],
      documentNumber: ['', [Validators.required, Validators.minLength(5), numericOnlyValidator]],
      name: ['', [Validators.required, Validators.minLength(3), textOnlyValidator]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, phoneLengthValidator]],
      responsiblePosition: ['', Validators.required],
      profile: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.userForm.get('documentType')?.valueChanges.subscribe(value => {
      this.documentType.set(value);
    });
  }

  private updateDocumentValidators() {
    const docNumberControl = this.userForm.get('documentNumber');
    const docType = this.documentType();

    if (docNumberControl) {
      if (docType === 'NIT') {
        docNumberControl.setValidators([
          Validators.required,
          nitFormatValidator
        ]);
      } else if (docType === 'CC' || docType === 'CE') {
        docNumberControl.setValidators([
          Validators.required,
          Validators.minLength(5),
          numericOnlyValidator
        ]);
      } else {
        docNumberControl.setValidators([
          Validators.required,
          Validators.minLength(5)
        ]);
      }
      docNumberControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  getDocumentTypeErrorMessage(): string {
    const control = this.userForm.get('documentType');

    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }

    return '';
  }

  getDocumentNumberErrorMessage(): string {
    const control = this.userForm.get('documentNumber');
    const docType = this.documentType();

    if (!control || !control.errors) return '';

    if (docType === 'NIT') {
      if (control.hasError('nitFormat')) {
        return getNitFormatErrorMessage();
      }
    }

    if (control.hasError('numericOnly')) {
      return getNumericOnlyErrorMessage();
    }

    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }

    if (control.hasError('minlength')) {
      return getMinDocumentNumberLengthErrorMessage();
    }

    return '';
  }

  getNameErrorMessage(): string {
    const control = this.userForm.get('name');

    if (!control || !control.errors) return '';

    if (control.hasError('textOnly')) {
      return getTextOnlyErrorMessage();
    }

    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }

    if (control.hasError('minlength')) {
      return getMinNameLengthErrorMessage();
    }

    return '';
  }

  getEmailErrorMessage(): string {
    const control = this.userForm.get('email');

    if (!control || !control.errors) return '';

    if (control.hasError('email')) {
      return getEmailErrorMessage();
    }

    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }

    return '';
  }

  getPhoneNumberErrorMessage(): string {
    const control = this.userForm.get('phone');

    if (!control || !control.errors) return '';

    if (control.hasError('phoneLength')) {
      return getPhoneLengthErrorMessage();
    }

    if (control.hasError('numericOnly')) {
      return getNumericOnlyErrorMessage();
    }

    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }

    return '';
  }

  getResponsiblePositionErrorMessage(): string {
    const control = this.userForm.get('responsiblePosition');

    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }

    return '';
  }

  getProfileErrorMessage(): string {
    const control = this.userForm.get('profile');

    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }

    if (control.hasError('minlength')) {
      return getMinLengthErrorMessage(control.errors['minlength'].requiredLength);
    }

    return '';
  }

  searchUserByDocument() {
    const docNumber = this.userForm.get('documentNumber')?.value;
    if (!docNumber) return;

    this.isSearching = true;

    // Simulate API search
    setTimeout(() => {
      this.isSearching = false;
      // Mock existing user check
      if (docNumber === '123456789') {
        this.userForm.patchValue({
          name: 'Usuario Existente',
          email: 'usuario.existente@email.com',
          phone: '3001234567',
          documentType: 'CC'
        });
      }
    }, 800);
  }

  addMember() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.value;
    const currentEditing = this.editingMember();

    // Validación: Si existe un Representante legal, no permitir agregar más miembros
    const hasLegalRep = this.selectedMembers.some(member => 
      member.representativeType?.nombre?.toLowerCase().includes('representante legal') || 
      member.representativeType?.nombre?.toLowerCase().includes('representante')
    );

    // Si ya existe un representante legal, bloquear cualquier adición adicional
    if (hasLegalRep) {
      this.confirmationService.alert({
        title: 'Restricción de Rol',
        message: 'No se pueden agregar más miembros si existe un Representante legal.',
        type: 'warning'
      });
      return;
    }

    // Get parameter objects for JSON format
    const docTypeParam = this.documentTypes().find(d => d.id === formValue.documentType);
    const responsibleParam = this.responsiblePositions().find(r => r.id === formValue.responsiblePosition);

    if (currentEditing) {
      // Edit mode: update existing member
      const updatedMember: ResponseTeamMember = {
        ...currentEditing,
        name: formValue.name,
        email: formValue.email,
        documentType: formValue.documentType ? { id: formValue.documentType, nombre: docTypeParam?.nombre || '', tipo: docTypeParam?.tipo, codigo: docTypeParam?.codigo } : null,
        documentNumber: formValue.documentNumber,
        phone: formValue.phone,
        nombre: formValue.name,
        profile: formValue.profile,
        representativeType: formValue.responsiblePosition ? { id: formValue.responsiblePosition, nombre: responsibleParam?.nombre || '', tipo: responsibleParam?.tipo, codigo: responsibleParam?.codigo } : null
      };

      const updatedList = this.selectedMembers.map(m =>
        m.documentNumber === currentEditing.documentNumber ? updatedMember : m
      );
      this.selectionChange.emit(updatedList);
      this.resetForm();
    } else {
      // Add mode: add new member
      const exists = this.selectedMembers.some(
        m => m.documentNumber === formValue.documentNumber
      );

      if (exists) {
        this.confirmationService.alert({
          title: 'Usuario Existente',
          message: 'Este usuario ya ha sido agregado al equipo.',
          type: 'warning'
        });
        return;
      }

      const newMember: ResponseTeamMember = {
        name: formValue.name,
        email: formValue.email,
        documentType: formValue.documentType ? { id: formValue.documentType, nombre: docTypeParam?.nombre || '', tipo: docTypeParam?.tipo, codigo: docTypeParam?.codigo } : null,
        documentNumber: formValue.documentNumber,
        phone: formValue.phone,
        nombre: formValue.name,
        profile: formValue.profile,
        representativeType: formValue.responsiblePosition ? { id: formValue.responsiblePosition, nombre: responsibleParam?.nombre || '', tipo: responsibleParam?.tipo, codigo: responsibleParam?.codigo } : null
      };

      const updatedList = [...this.selectedMembers, newMember];
      this.selectionChange.emit(updatedList);
      this.resetForm();
    }
  }

  removeMember(member: ResponseTeamMember) {
    const currentEditing = this.editingMember();
    
    if (currentEditing?.documentNumber === member.documentNumber) {
      this.editingMember.set(null);
    }
    
    const updatedList = this.selectedMembers.filter(
      m => m.documentNumber !== member.documentNumber
    );
    this.selectionChange.emit(updatedList);
  }

  editMember(member: ResponseTeamMember) {
    this.editingMember.set(member);
    this.userForm.patchValue({
      documentType: member.documentType?.id || '',
      documentNumber: member.documentNumber,
      name: member.nombre || member.name,
      email: member.email,
      phone: member.phone,
      responsiblePosition: member.representativeType?.id || '',
      profile: member.profile
    });
    this.documentType.set(member.documentType?.id || '');
  }

  cancelEdit() {
    this.editingMember.set(null);
    this.resetForm();
  }

  resetForm() {
    this.editingMember.set(null);
    this.userForm.reset({
      documentType: '',
      responsiblePosition: '',
      profile: ''
    });
  }
}
