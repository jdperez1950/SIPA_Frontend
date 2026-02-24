import { Component, EventEmitter, inject, Input, OnInit, Output, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponseTeamMember } from '../../project-wizard.types';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from '../../../../../../../../core/services/confirmation.service';
import { ParametroBaseService } from '../../../../../../../../core/services/parametro-base.service';
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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-response-team.component.html',
  styles: []
})
export class StepResponseTeamComponent implements OnInit {
  @Input() organizationId?: string;
  @Input({ required: true }) organizationName!: string;
  @Input({ required: true }) selectedMembers: ResponseTeamMember[] = [];
  @Output() selectionChange = new EventEmitter<ResponseTeamMember[]>();

  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  private parametroBaseService = inject(ParametroBaseService);
  userForm!: FormGroup;
  isSearching = false;
  editingMember = signal<ResponseTeamMember | null>(null);
  isEditMode = computed(() => this.editingMember() !== null);

  documentType = signal('');

  constructor() {
    effect(() => {
      this.updateDocumentValidators();
    });
  }

  // Document types from ParametroBase
  documentTypes = computed(() =>
    this.parametroBaseService.tiposDocumento().map(d => ({
      value: d.id,
      label: d.nombre
    }))
  );

  // Project Roles
  projectRoles = [
    { value: 'Líder Técnico', label: 'Líder Técnico' },
    { value: 'Apoyo Jurídico', label: 'Apoyo Jurídico' },
    { value: 'Responsable Financiero', label: 'Responsable Financiero' },
    { value: 'Coordinador Social', label: 'Coordinador Social' },
    { value: 'Otro', label: 'Otro' }
  ];

  responsiblePositions = computed(() => 
    this.parametroBaseService.tiposEncargado().map(c => ({
      value: c.id,
      label: c.nombre
    }))
  );

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.userForm = this.fb.group({
      documentType: ['', Validators.required],
      documentNumber: ['', [Validators.required, Validators.minLength(5), numericOnlyValidator]],
      name: ['', [Validators.required, Validators.minLength(3), textOnlyValidator]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, phoneLengthValidator]],
      status: ['ACTIVE', Validators.required],
      responsiblePosition: ['', Validators.required],
      profileDescription: ['', [Validators.required, Validators.minLength(10)]]
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
    const control = this.userForm.get('phoneNumber');

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

  getProfileDescriptionErrorMessage(): string {
    const control = this.userForm.get('profileDescription');

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
          phoneNumber: '3001234567',
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

    if (currentEditing) {
      // Edit mode: update existing member
      const updatedMember: ResponseTeamMember = {
        ...currentEditing,
        userName: formValue.name,
        userEmail: formValue.email,
        roleInProject: 'Otro',
        documentType: formValue.documentType,
        documentNumber: formValue.documentNumber,
        phoneNumber: formValue.phoneNumber,
        status: formValue.status,
        responsiblePosition: formValue.responsiblePosition,
        profileDescription: formValue.profileDescription
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
        userName: formValue.name,
        userEmail: formValue.email,
        roleInProject: 'Otro',
        documentType: formValue.documentType,
        documentNumber: formValue.documentNumber,
        phoneNumber: formValue.phoneNumber,
        status: formValue.status,
        responsiblePosition: formValue.responsiblePosition,
        profileDescription: formValue.profileDescription
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
      documentType: member.documentType,
      documentNumber: member.documentNumber,
      name: member.userName,
      email: member.userEmail,
      phoneNumber: member.phoneNumber,
      status: member.status,
      responsiblePosition: member.responsiblePosition || '',
      profileDescription: member.profileDescription || ''
    });
    this.documentType.set(member.documentType);
  }

  cancelEdit() {
    this.editingMember.set(null);
    this.resetForm();
  }

  resetForm() {
    this.editingMember.set(null);
    this.userForm.reset({
      documentType: '',
      status: 'ACTIVE',
      responsiblePosition: '',
      profileDescription: ''
    });
  }
}
