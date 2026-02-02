import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponseTeamMember } from '../../project-wizard.types';
import { FormsModule } from '@angular/forms';

// Mock User Interface (should be imported from models)
interface OrganizationUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-step-response-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-response-team.component.html',
  styles: []
})
export class StepResponseTeamComponent implements OnInit {
  @Input({ required: true }) organizationId!: string;
  @Input({ required: true }) organizationName!: string;
  @Input({ required: true }) selectedMembers: ResponseTeamMember[] = [];
  @Output() selectionChange = new EventEmitter<ResponseTeamMember[]>();

  organizationUsers: OrganizationUser[] = [];
  isLoading = false;

  ngOnInit() {
    this.loadOrganizationUsers();
  }

  loadOrganizationUsers() {
    this.isLoading = true;
    // Simulate API call to get users by organization ID
    setTimeout(() => {
      this.organizationUsers = [
        { id: 'USR-101', name: 'Juan Pérez', email: 'juan.perez@org.com', role: 'Representante Legal' },
        { id: 'USR-102', name: 'Maria Rodriguez', email: 'maria.r@org.com', role: 'Ingeniera Residente' },
        { id: 'USR-103', name: 'Pedro Alcantara', email: 'pedro.a@org.com', role: 'Arquitecto' },
        { id: 'USR-104', name: 'Luisa Fernanda', email: 'luisa.f@org.com', role: 'Auxiliar Administrativo' },
      ];
      this.isLoading = false;
    }, 600);
  }

  isSelected(userId: string): boolean {
    return this.selectedMembers.some(m => m.userId === userId);
  }

  toggleMember(user: OrganizationUser) {
    const isSelected = this.isSelected(user.id);
    let newSelection = [...this.selectedMembers];

    if (isSelected) {
      newSelection = newSelection.filter(m => m.userId !== user.id);
    } else {
      newSelection.push({
        userId: user.id,
        userName: user.name,
        userEmail: user.email
      });
    }

    this.selectionChange.emit(newSelection);
  }
}
