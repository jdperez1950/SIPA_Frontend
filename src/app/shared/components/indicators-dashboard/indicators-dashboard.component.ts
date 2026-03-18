import { Component, inject, OnInit, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStatsComponent, DashboardColumn } from '../dashboard-stats/dashboard-stats.component';
import { IndicatorsService } from '../../../core/services/indicators.service';
import { IndicatorsMapperService } from '../../../core/services/indicators-mapper.service';
import { IndicatorsQueryParams } from '../../../core/models/indicators.models';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-indicators-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardStatsComponent, LoadingComponent],
  template: `
    <div class="flex flex-col gap-6">
      @if (loading()) {
        <app-loading mode="embedded" [isLoading]="loading()"></app-loading>
      } @else if (columns().length > 0) {
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
export class IndicatorsDashboardComponent implements OnInit {
  @Input() callId?: string;
  @Input() projectId?: string;
  @Input() axisId?: string;

  private indicatorsService = inject(IndicatorsService);
  private indicatorsMapper = inject(IndicatorsMapperService);

  columns = signal<DashboardColumn[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadIndicators();
  }

  loadIndicators() {
    this.loading.set(true);
    const params: IndicatorsQueryParams = {
      callId: this.callId,
      projectId: this.projectId,
      axisId: this.axisId
    };

    this.indicatorsService.getIndicators(params).subscribe({
      next: (response) => {
        console.log('📊 [IndicatorsDashboard] Respuesta del endpoint (Nivel 1/General):', response);
        if (Array.isArray(response) && response.length > 0) {
          const allColumns = this.indicatorsMapper.mapToDashboardColumns(response);
          this.columns.set(allColumns);
        } else {
          this.columns.set([]);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading indicators:', error);
        this.columns.set([]);
        this.loading.set(false);
      }
    });
  }
}
