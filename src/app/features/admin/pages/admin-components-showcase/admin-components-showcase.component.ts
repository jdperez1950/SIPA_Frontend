import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardStatsComponent, StatItem, DashboardColumn } from '../../../../shared/components/dashboard-stats/dashboard-stats.component';
import { ExpandableTableComponent, TableColumn, NestedTableColumn } from '../../../../shared/components/expandable-table/expandable-table.component';
import { Router } from '@angular/router';

export interface RowAction {
  id: string;
  icon: string;
  label: string;
  color?: string;
}

@Component({
  selector: 'app-admin-components-showcase',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardStatsComponent, ExpandableTableComponent],
  templateUrl: './admin-components-showcase.component.html'
})
export class AdminComponentsShowcaseComponent implements OnInit {
  expandedAxes = new Set<any>();
  expandedQuestions = new Set<any>();
  
  searchTerm: string = '';
  filteredProjects: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.filteredProjects = [...this.projectsMock];
  }

  filterProjects() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredProjects = [...this.projectsMock];
      return;
    }
    
    this.filteredProjects = this.projectsMock.filter(project => 
      project.name.toLowerCase().includes(term) || 
      project.id.toString().includes(term)
    );
  }

  // --- AVAILABLE ACTIONS ---
  availableRowActions: RowAction[] = [
    { id: 'edit', icon: 'edit', label: 'Editar', color: 'text-blue-600 hover:bg-blue-50' },
    { id: 'delete', icon: 'delete', label: 'Eliminar', color: 'text-red-600 hover:bg-red-50' },
    { id: 'survey', icon: 'assignment', label: 'Responder Encuesta', color: 'text-green-600 hover:bg-green-50' },
    { id: 'view', icon: 'visibility', label: 'Ver Detalle', color: 'text-gray-600 hover:bg-gray-50' }
  ];
  // --- MOCK DATA: STATS ---
  kpiStats: StatItem[] = [
    { 
      label: 'Proyectos Activos', 
      value: 12, 
      icon: 'folder_open', 
      color: 'primary',
      trend: '+2',
      trendDirection: 'up'
    },
    { 
      label: 'Alertas Pendientes', 
      value: 3, 
      icon: 'warning', 
      color: 'warning',
      trend: '-1',
      trendDirection: 'down'
    },
    { 
      label: 'Proyectos Validados', 
      value: 45, 
      icon: 'check_circle', 
      color: 'success'
    },
    { 
      label: 'Viabilidad Alta', 
      value: '85%', 
      icon: 'trending_up', 
      color: 'accent',
      trend: '+5%',
      trendDirection: 'up'
    }
  ];
  
  // --- MOCK DATA: DASHBOARD COLUMNS (6 INDICADORES) ---
  dashboardColumns: DashboardColumn[] = [
    {
      kind: 'list',
      title: 'Escenarios de Viabilidad',
      items: [
        { label: 'Sin posibilidad', count: 1, color: 'gray' },
        { label: 'Con posibilidad', count: 1, color: 'orange' },
        { label: 'Con alta posibilidad', count: 1, color: 'green' },
        { label: 'Pre-habilitado', count: 1, color: 'blue' },
        { label: 'Habilitado', count: 1, color: 'purple' },
      ]
    },
    { 
      kind: 'badge', 
      title: 'Proyectos Certificados',
      badges: [
        { value: 4, percent: 25, color: 'gray', badgeTitle: 'Sin certificar' },
        { value: 16, percent: 75, color: 'blue', badgeTitle: 'Certificados' }
      ]
    },
    {
      kind: 'list',
      title: 'Estado de Preguntas',
      items: [
        { label: 'Sin responder', count: 2, percent: 2, color: 'gray' },
        { label: 'Sí', count: 1, percent: 1, color: 'green' },
        { label: 'No', count: 1, percent: 10, color: 'red' },
        { label: 'En Proceso', count: 1, percent: 1, color: 'orange' },
        { label: 'No sé', count: 0, percent: 1, color: 'gray' },
        { label: 'No aplica', count: 0, percent: 0, color: 'gray' },
      ]
    },
    { 
      kind: 'badge', 
      title: 'Preguntas Validadas',
      badges: [
        { value: 4, percent: 25, color: 'gray', badgeTitle: 'Pendientes' },
        { value: 16, percent: 75, color: 'orange', badgeTitle: 'Validadas' }
      ]
    },
    {
      kind: 'chips',
      title: 'Notas de revisión',
      groups: [
        {
          title: 'Prioridad',
          items: [
            { label: 'Urgente', count: 1, color: 'red' },
            { label: 'Alerta', count: 2, color: 'orange' },
            { label: 'Importante', count: 8, color: 'blue' },
          ]
        },
        {
          title: 'Vigencia',
          items: [
            { label: 'Vencidos', count: 1, color: 'red' },
            { label: 'Por vencer', count: 2, color: 'orange' },
            { label: 'Vigente', count: 2, color: 'green' },
          ]
        }
      ]
    },
    { 
      kind: 'badge', 
      title: 'Certificados',
      badges: [
        { value: 8, percent: 25, color: 'green', badgeTitle: 'Certificados' }
      ]
    },
  ];

  // --- MOCK DATA: TABLE (PROJECTS) ---
  projectColumns: TableColumn[] = [
    { header: 'Proyecto', field: 'name', type: 'text', width: '30%' },
    { header: 'Fecha Inicio', field: 'startDate', type: 'date', width: '15%' },
    { header: 'Presupuesto', field: 'budget', type: 'currency', width: '15%' },
    { header: 'Estado', field: 'status', type: 'status', width: '15%', align: 'center' },
    { header: 'Prioridad', field: 'priority', type: 'priority', width: '10%', align: 'center' },
    { header: 'Viabilidad', field: 'viability', type: 'viability', width: '10%', align: 'center' },
    { header: 'Avance', field: 'progress', type: 'progress', width: '15%' },
    { header: '', field: 'actions', type: 'actions', width: '50px' }
  ];

  // --- NESTED COLUMNS (QUESTIONS) ---
  questionColumns: NestedTableColumn[] = [
    { header: 'Pregunta', field: 'text', type: 'text' },
    { header: 'Respuesta', field: 'answer', type: 'text' },
    { header: 'Estado', field: 'status', type: 'status' }
  ];

  projectsMock = [
    {
      id: 1,
      name: 'Implementación Sistema Solar Fotovoltaico',
      startDate: '2025-01-15',
      budget: 150000000,
      status: 'PROCESS',
      priority: 'ALTA',
      viability: 'HIGH',
      progress: 65,
      axes: [
        { 
          id: 101, 
          name: 'Eje Técnico', 
          status: 'VALIDATED', 
          questions: [
            { id: 1001, text: '¿Cuenta con estudios de suelos?', answer: 'Sí', status: 'VALIDATED' },
            { id: 1002, text: '¿Tiene licencia ambiental?', answer: 'En trámite', status: 'PENDING' }
          ]
        },
        { 
          id: 102, 
          name: 'Eje Financiero', 
          status: 'PROCESS',
          questions: [
            { id: 2001, text: '¿Presupuesto detallado?', answer: 'Sí', status: 'VALIDATED' },
            { id: 2002, text: '¿Fuentes de financiación aseguradas?', answer: 'Parcial', status: 'RETURNED' }
          ]
        }
      ],
      availableActions: ['edit', 'delete', 'survey']
    },
    {
      id: 2,
      name: 'Construcción Acueducto Veredal',
      startDate: '2025-02-10',
      budget: 450000000,
      status: 'RETURNED',
      priority: 'URGENT',
      viability: 'MEDIUM',
      progress: 30,
      axes: [
        { 
          id: 201, 
          name: 'Eje Jurídico', 
          status: 'RETURNED',
          questions: [
            { id: 3001, text: '¿Predio legalizado?', answer: 'No', status: 'RETURNED' }
          ]
        }
      ],
      availableActions: ['edit', 'survey']
    },
    {
      id: 3,
      name: 'Mejoramiento Vía Terciaria',
      startDate: '2024-11-05',
      budget: 820000000,
      status: 'VALIDATED',
      priority: 'BAJA',
      viability: 'ENABLED',
      progress: 100,
      axes: [],
      availableActions: ['view']
    }
  ];

  // --- ACTIONS ---
  handleRowAction(action: RowAction, row: any) {
    console.log('Acción:', action.id, 'en fila:', row);
    
    switch (action.id) {
      case 'edit':
        alert(`Editar proyecto: ${row.name}`);
        break;
      case 'delete':
        if (confirm(`¿Estás seguro de eliminar el proyecto "${row.name}"?`)) {
          alert(`Proyecto eliminado: ${row.name}`);
        }
        break;
      case 'survey':
        alert(`Ir a responder encuesta del proyecto: ${row.name}`);
        break;
      case 'view':
        alert(`Ver detalle del proyecto: ${row.name}`);
        break;
    }
  }

  handleQuestionAction(question: any) {
    console.log('Acción en pregunta:', question);
    alert(`Acción en pregunta: ${question.text}`);
  }

  handleSelectionChange(selectedRows: any[]) {
    console.log('Filas seleccionadas:', selectedRows);
  }

  // --- EXPANSION LOGIC FOR AXES ---
  toggleAxisExpansion(axis: any) {
    if (this.expandedAxes.has(axis)) {
      this.expandedAxes.delete(axis);
    } else {
      this.expandedAxes.add(axis);
    }
  }

  isAxisExpanded(axis: any): boolean {
    return this.expandedAxes.has(axis);
  }

  // --- EXPANSION LOGIC FOR QUESTIONS ---
  toggleQuestionExpansion(question: any) {
    if (this.expandedQuestions.has(question)) {
      this.expandedQuestions.delete(question);
    } else {
      this.expandedQuestions.add(question);
    }
  }

  isQuestionExpanded(question: any): boolean {
    return this.expandedQuestions.has(question);
  }
}
