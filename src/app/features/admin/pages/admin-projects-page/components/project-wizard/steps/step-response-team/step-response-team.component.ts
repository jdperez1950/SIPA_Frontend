import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponseTeamMember } from '../../project-wizard.types';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from '../../../../../../../../core/services/confirmation.service';

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

  // Mock document types
  documentTypes = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'NIT', label: 'NIT' },
    { value: 'PAS', label: 'Pasaporte' }
  ];

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.userForm = this.fb.group({
      documentType: ['CC', Validators.required],
      documentNumber: ['', [Validators.required, Validators.minLength(5)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      status: ['ACTIVE', Validators.required]
    });
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
          documentType: 'CC',
          status: 'ACTIVE'
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
