import { Component, inject, OnInit, OnChanges, Input, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStatsComponent, DashboardColumn } from '../dashboard-stats/dashboard-stats.component';
import { IndicatorsService } from '../../../core/services/indicators.service';
import { IndicatorsMapperService } from '../../../core/services/indicators-mapper.service';
import { IndicatorsQueryParams, IndicatorEntity } from '../../../core/models/indicators.models';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-indicators-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardStatsComponent, LoadingComponent],
  template: `
    <div class="flex flex-col gap-6">
      @if (loading()) {
        <app-loading mode="embedded" [isLoading]="loading()"></app-loading>
      } @else if (hasMultipleEntities()) {
        <!-- Vista Agrupada por Ejes (cuando hay projectId) -->
        <div class="space-y-4">
          @for (entity of entities(); track entity.id) {
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                class="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                (click)="toggleEntity(entity.id)"
              >
                <h3 class="font-medium text-gray-700 flex items-center gap-2">
                  <span class="material-symbols-rounded text-gray-500">category</span>
                  {{ entity.name }}
                </h3>
                <span class="material-symbols-rounded text-gray-400 transition-transform duration-200"
                  [class.rotate-180]="isExpanded(entity.id)">
                  expand_more
                </span>
              </div>
              
              @if (isExpanded(entity.id)) {
                <div class="p-4 bg-white border-t border-gray-100">
                  <app-dashboard-stats 
                    [columns]="getColumnsForEntity(entity)" 
                    [showFilters]="false">
                  </app-dashboard-stats>
                </div>
              }
            </div>
          }
        </div>
      } @else if (columns().length > 0) {
        <!-- Vista Simple (para Convocatoria/Global) -->
        <app-dashboard-stats [columns]="columns()" [showFilters]="false"></app-dashboard-stats>
      } @else {
        <div class="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
          <span class="material-symbols-rounded text-4xl mb-2 text-gray-400">bar_chart</span>
          <p>No hay indicadores disponibles</p>
        </div>
      }
    </div>
  `
})
export class IndicatorsDashboardComponent implements OnInit, OnChanges {
  @Input() callId?: string;
  @Input() projectId?: string;
  @Input() axisId?: string;

  private indicatorsService = inject(IndicatorsService);
  private indicatorsMapper = inject(IndicatorsMapperService);

  columns = signal<DashboardColumn[]>([]);
  entities = signal<IndicatorEntity[]>([]);
  expandedEntities = signal<Set<string>>(new Set());
  loading = signal(false);

  hasMultipleEntities = signal(false);

  ngOnInit() {
    this.loadIndicators();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['callId'] || changes['projectId'] || changes['axisId']) {
      this.loadIndicators();
    }
  }

  toggleEntity(entityId: string) {
    this.expandedEntities.update(set => {
      const newSet = new Set(set);
      if (newSet.has(entityId)) {
        newSet.delete(entityId);
      } else {
        newSet.add(entityId);
      }
      return newSet;
    });
  }

  isExpanded(entityId: string): boolean {
    return this.expandedEntities().has(entityId);
  }

  getColumnsForEntity(entity: IndicatorEntity): DashboardColumn[] {
    return this.indicatorsMapper.mapEntityToColumns(entity);
  }

  loadIndicators() {
    this.loading.set(true);
    const params: IndicatorsQueryParams = {
      callId: this.callId,
      projectId: this.projectId,
      axisId: this.axisId
    };

    console.log('[IndicatorsDashboard] Solicitando indicadores con params:', params);

    this.indicatorsService.getIndicators(params).subscribe({
      next: (response) => {
        console.log('[IndicatorsDashboard] Respuesta recibida:', response);
        
        if (this.projectId) {
          console.log(`[IndicatorsDashboard] Estadísticas cargadas para el proyecto ${this.projectId}`);
        }

        if (Array.isArray(response) && response.length > 0) {
          // Si hay projectId, mostramos siempre en modo agrupado por entidad (Ejes)
          if (this.projectId) {
            this.entities.set(response);
            this.hasMultipleEntities.set(true);
            // Expandir el primero por defecto
            this.expandedEntities.set(new Set([response[0].id]));
            // Limpiar columnas planas para evitar doble render
            this.columns.set([]);
          } else {
            // Vista plana (Convocatoria/Global)
            const allColumns = this.indicatorsMapper.mapToDashboardColumns(response);
            this.columns.set(allColumns);
            this.hasMultipleEntities.set(false);
            this.entities.set([]);
          }
        } else {
          this.columns.set([]);
          this.entities.set([]);
          this.hasMultipleEntities.set(false);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading indicators:', error);
        this.columns.set([]);
        this.entities.set([]);
        this.loading.set(false);
      }
    });
  }
}
