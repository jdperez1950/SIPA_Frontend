import { Component, EventEmitter, inject, Input, OnInit, Output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponseTeamMember } from '../../project-wizard.types';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from '../../../../../../../../core/services/confirmation.service';
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
  getPhoneLengthErrorMessage
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
  userForm!: FormGroup;
  isSearching = false;

  documentType = signal('CC');

  constructor() {
    effect(() => {
      this.updateDocumentValidators();
    });
  }

  // Mock document types
  documentTypes = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'NIT', label: 'NIT' },
    { value: 'PAS', label: 'Pasaporte' }
  ];

  // Project Roles
  projectRoles = [
    { value: 'Líder Técnico', label: 'Líder Técnico' },
    { value: 'Apoyo Jurídico', label: 'Apoyo Jurídico' },
    { value: 'Responsable Financiero', label: 'Responsable Financiero' },
    { value: 'Coordinador Social', label: 'Coordinador Social' },
    { value: 'Otro', label: 'Otro' }
  ];

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.userForm = this.fb.group({
      documentType: ['CC', Validators.required],
      documentNumber: ['', [Validators.required, Validators.minLength(5), numericOnlyValidator]],
      name: ['', [Validators.required, Validators.minLength(3), textOnlyValidator]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, phoneLengthValidator]],
      status: ['ACTIVE', Validators.required]
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
    
    // Check if user already added
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
      roleInProject: 'Otro', // Default role to 'Otro' as UI control was removed
      documentType: formValue.documentType,
      documentNumber: formValue.documentNumber,
      phoneNumber: formValue.phoneNumber,
      status: formValue.status,
      // userId would be set if it was an existing user from DB, for now undefined for new ones
    };

    const updatedList = [...this.selectedMembers, newMember];
    this.selectionChange.emit(updatedList);
    this.resetForm();
  }

  removeMember(member: ResponseTeamMember) {
    const updatedList = this.selectedMembers.filter(
      m => m.documentNumber !== member.documentNumber
    );
    this.selectionChange.emit(updatedList);
  }

  resetForm() {
    this.userForm.reset({
      documentType: 'CC',
      status: 'ACTIVE'
    });
  }
}
