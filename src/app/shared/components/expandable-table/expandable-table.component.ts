import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef, signal, computed, inject, PLATFORM_ID, afterNextRender, OnDestroy, AfterContentInit, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  header: string;
  field: string;
  type?: 'text' | 'date' | 'currency' | 'status' | 'priority' | 'viability' | 'progress' | 'custom' | 'actions';
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface NestedTableColumn {
  header: string;
  field: string;
  type?: 'text' | 'date' | 'currency' | 'status' | 'priority' | 'viability' | 'progress' | 'custom' | 'actions';
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction {
  icon: string;
  label: string;
  color?: string; // 'text-blue-600', etc.
  action: (row: any) => void;
}

@Component({
  selector: 'app-expandable-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col h-full">
      <!-- Header / Toolbar -->
      @if (title || showTools) {
        <div class="p-4 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50/50">
          @if (title) {
            <h3 class="text-lg font-semibold text-gray-800 truncate max-w-full">{{ title }}</h3>
          }
          
          <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end sm:ml-auto">
            <ng-content select="[toolbar]"></ng-content>
            
            @if (showExpandControls) {
              <div class="flex bg-white rounded-lg border border-gray-300 overflow-hidden shrink-0">
                <button (click)="expandAll()" class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 border-r border-gray-300 transition-colors hidden sm:inline-block" title="Expandir todo">
                  <span class="material-symbols-rounded text-sm align-middle">unfold_more</span>
                </button>
                <button (click)="collapseAll()" class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors hidden sm:inline-block" title="Colapsar todo">
                  <span class="material-symbols-rounded text-sm align-middle">unfold_less</span>
                </button>
                
                <button (click)="toggleCardView()" class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 border-l border-gray-300 transition-colors" title="Cambiar Vista">
                  <span class="material-symbols-rounded text-sm align-middle">{{ isCardView() ? 'table_chart' : 'grid_view' }}</span>
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- DESKTOP TABLE VIEW (Hidden on mobile/tablet by default) -->
      @if (!isCardView()) {
      <div class="overflow-x-auto flex-1">
        <table class="w-full text-left text-sm text-gray-600">
          <thead class="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <!-- Toggle Column -->
              @if (showRowToggle) {
                <th class="w-12 px-4 py-3 text-center">
                  <span class="material-symbols-rounded text-gray-400 text-lg">list</span>
                </th>
              }
              
              <!-- Selection Column -->
              @if (selectable) {
                <th class="w-10 px-4 py-3 text-center">
                  <input type="checkbox" [checked]="isAllSelected()" (change)="toggleSelectAll()" 
                        class="rounded border-gray-300 text-pavis-brand-primary focus:ring-pavis-brand-primary cursor-pointer">
                </th>
              }

              <!-- Data Columns -->
              @for (col of columns; track col.field) {
                <th class="px-6 py-3 whitespace-nowrap tracking-wider" 
                    [ngClass]="getAlignClass(col.align)"
                    [style.width]="col.width">
                  {{ col.header }}
                </th>
              }
            </tr>
          </thead>
          
          <tbody class="divide-y divide-gray-200 bg-white">
            @for (row of data; track $index; let i = $index) {
              <!-- Main Row -->
              <tr class="hover:bg-blue-50/30 transition-colors group border-l-4"
                  [ngClass]="{'bg-blue-50/50 border-l-pavis-brand-primary': isExpanded(row), 'border-l-transparent': !isExpanded(row)}">
                
                <!-- Toggle Button -->
                @if (showRowToggle) {
                  <td class="px-4 py-3 text-center">
                    <button 
                      (click)="toggleRow(row)"
                      class="w-8 h-8 rounded-full hover:bg-white hover:shadow-sm hover:text-pavis-brand-primary flex items-center justify-center transition-all focus:outline-none"
                      [class.text-pavis-brand-primary]="isExpanded(row)"
                    >
                      <span class="material-symbols-rounded transition-transform duration-200 text-xl" [ngStyle]="{ transform: isExpanded(row) ? 'rotate(45deg)' : 'rotate(0deg)' }">chevron_right</span>
                    </button>
                  </td>
                }

                <!-- Checkbox -->
                @if (selectable) {
                  <td class="px-4 py-3 text-center">
                    <input type="checkbox" [checked]="isSelected(row)" (change)="toggleSelection(row)" 
                          class="rounded border-gray-300 text-pavis-brand-primary focus:ring-pavis-brand-primary cursor-pointer">
                  </td>
                }
                
                <!-- Cells -->
                @for (col of columns; track col.field) {
                  <td class="px-6 py-3" [ngClass]="getAlignClass(col.align)">
                    <ng-template [ngTemplateOutlet]="cellContent" [ngTemplateOutletContext]="{ col: col, row: row }"></ng-template>
                  </td>
                }
              </tr>

              <!-- Expanded Row (Detail) -->
              @if (isExpanded(row)) {
                <tr class="bg-gray-50/50 animate-fade-in">
                  <td [attr.colspan]="getTotalColumns()" class="p-0 border-b border-gray-200 shadow-inner">
                    <div class="py-4 px-4 sm:px-12 border-l-4 border-pavis-brand-primary">
                      <ng-container *ngTemplateOutlet="expandedRowTemplate; context: { $implicit: row }"></ng-container>
                    </div>
                  </td>
                </tr>
              }
            }
             <!-- Empty State -->
             @if (data.length === 0) {
              <tr>
                <td [attr.colspan]="getTotalColumns()" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <span class="material-symbols-rounded text-4xl text-gray-300">inbox</span>
                    <p>No hay registros para mostrar</p>
                  </div>
                </td>
              </tr>
             }
          </tbody>
        </table>
      </div>
      }

      <!-- MOBILE/TABLET CARD VIEW (Visible on mobile/tablet or when toggled) -->
      @if (isCardView()) {
      <div class="flex-1 bg-gray-50 p-4 space-y-4">
        @for (row of data; track row) {
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
           <!-- Card Header -->
           <div class="p-4 border-b border-gray-100 flex justify-between items-start gap-3">
              <div class="flex items-start gap-3 flex-1">
                 @if (selectable) {
                  <input type="checkbox" [checked]="isSelected(row)" (change)="toggleSelection(row)" 
                          class="mt-1 rounded border-gray-300 text-pavis-brand-primary focus:ring-pavis-brand-primary cursor-pointer">
                 }
                 
                 <!-- Primary Identifier (First Text Column usually) -->
                 <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-900 text-sm break-words line-clamp-2" [title]="getPrimaryText(row)">
                       {{ getPrimaryText(row) | slice:0:50 }}{{ getPrimaryText(row).length > 50 ? '...' : '' }}
                    </h4>
                    <div class="flex flex-wrap gap-2 mt-2">
                       <!-- Status Chips -->
                       @for (col of getStatusColumns(); track col.field) {
                          <ng-template [ngTemplateOutlet]="cellContent" [ngTemplateOutletContext]="{ col: col, row: row }"></ng-template>
                       }
                    </div>
                 </div>
              </div>
              
              <!-- Expand Button -->
               @if (showRowToggle) {
                <button
                  (click)="toggleRow(row)"
                  class="w-8 h-8 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-pavis-brand-primary flex items-center justify-center transition-all focus:outline-none flex-shrink-0"
                  [class.text-pavis-brand-primary]="isExpanded(row)"
                  [class.bg-blue-50]="isExpanded(row)"
                >
                  <span class="material-symbols-rounded transition-transform duration-200" [ngStyle]="{ transform: isExpanded(row) ? 'rotate(45deg)' : 'rotate(0deg)' }">chevron_right</span>
                </button>
               }
           </div>

           <!-- Card Body (Other Columns) -->
           @if (!isExpanded(row)) {
           <div class="p-4 space-y-4">
              <!-- Grid para campos normales (1 columna por fila) -->
              <div class="flex flex-col gap-y-3 text-sm">
                  @for (col of getGridColumns(); track col.field) {
                     <div class="flex flex-col min-w-0 pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                        <span class="text-xs text-gray-500 uppercase font-medium mb-1 truncate">{{ col.header }}</span>
                        <div class="truncate text-gray-900 font-medium">
                            <ng-template [ngTemplateOutlet]="cellContent" [ngTemplateOutletContext]="{ col: col, row: row }"></ng-template>
                        </div>
                     </div>
                  }
              </div>

              <!-- Bloques de ancho completo (Progress) -->
              @for (col of getProgressColumns(); track col.field) {
                  <div class="flex flex-col">
                      <span class="text-xs text-gray-500 uppercase font-medium mb-1">{{ col.header }}</span>
                      <ng-template [ngTemplateOutlet]="cellContent" [ngTemplateOutletContext]="{ col: col, row: row }"></ng-template>
                  </div>
              }

              <!-- Acciones (Footer dedicado) -->
              @for (col of getActionColumns(); track col.field) {
                  <div class="pt-3 border-t border-gray-100 flex justify-end gap-2">
                      <ng-template [ngTemplateOutlet]="cellContent" [ngTemplateOutletContext]="{ col: col, row: row }"></ng-template>
                  </div>
              }
           </div>
           }

           <!-- Expanded Content (Detail) -->
           @if (isExpanded(row)) {
           <div class="bg-gray-50 border-t border-gray-200 p-4 animate-fade-in">
              <!-- Full Details (All columns in list view for context) -->
              <div class="space-y-4 mb-6 pb-4 border-b border-gray-200">
                  <!-- Grid -->
                  <div class="flex flex-col gap-y-3 text-sm">
                      @for (col of getGridColumns(); track col.field) {
                        <div class="flex flex-col min-w-0 pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                            <span class="text-xs text-gray-500 uppercase font-medium mb-1 truncate">{{ col.header }}</span>
                            <div class="truncate text-gray-900 font-medium">
                                <ng-template [ngTemplateOutlet]="cellContent" [ngTemplateOutletContext]="{ col: col, row: row }"></ng-template>
                            </div>
                        </div>
                      }
                  </div>

                  <!-- Progress -->
                  @for (col of getProgressColumns(); track col.field) {
                      <div class="flex flex-col">
                          <span class="text-xs text-gray-500 uppercase font-medium mb-1">{{ col.header }}</span>
                          <ng-template [ngTemplateOutlet]="cellContent" [ngTemplateOutletContext]="{ col: col, row: row }"></ng-template>
                      </div>
                  }

                  <!-- Actions -->
                  @for (col of getActionColumns(); track col.field) {
                      <div class="pt-3 border-t border-gray-200 flex justify-end gap-2">
                          <ng-template [ngTemplateOutlet]="cellContent" [ngTemplateOutletContext]="{ col: col, row: row }"></ng-template>
                      </div>
                  }
              </div>

              <h5 class="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                <span class="material-symbols-rounded text-base">subdirectory_arrow_right</span> Detalle
              </h5>
              <ng-container *ngTemplateOutlet="expandedRowTemplate; context: { $implicit: row }"></ng-container>
           </div>
           }
        </div>
        }

        <!-- Empty State Mobile -->
        @if (data.length === 0) {
          <div class="flex flex-col items-center justify-center py-12 text-gray-500">
            <span class="material-symbols-rounded text-4xl text-gray-300">inbox</span>
            <p>No hay registros</p>
          </div>
        }
      </div>
      }

      <!-- Footer / Pagination -->
      @if (showFooter) {
        <div class="px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
          <span>Mostrando {{ data.length }} registros</span>
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </div>

    <!-- Reusable Cell Template -->
    <ng-template #cellContent let-col="col" let-row="row">
        @switch (col.type) {
          @case ('date') {
            <span class="text-gray-500 font-mono text-xs">
              {{ row[col.field] | date:'mediumDate' }}
            </span>
          }
          @case ('currency') {
            <span class="font-mono text-gray-900 font-medium">
              {{ row[col.field] | currency:'COP':'symbol-narrow':'1.0-0' }}
            </span>
          }
          @case ('status') {
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                  [ngClass]="getStatusClass(row[col.field])">
              <span class="w-1.5 h-1.5 rounded-full mr-1.5" [ngClass]="getStatusDotClass(row[col.field])"></span>
              {{ row[col.field] | titlecase }}
            </span>
          }
          @case ('priority') {
            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
                  [ngClass]="getPriorityClass(row[col.field])">
              <span class="material-symbols-rounded text-[16px]">{{ getPriorityIcon(row[col.field]) }}</span>
              {{ row[col.field] | titlecase }}
            </span>
          }
          @case ('viability') {
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
                  [ngClass]="getViabilityClass(row[col.field])">
              {{ row[col.field] }}
            </span>
          }
          @case ('progress') {
            <div class="w-full min-w-[100px] flex items-center gap-2">
              <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500"
                      [style.width.%]="row[col.field]"
                      [ngClass]="getProgressColor(row[col.field])"></div>
              </div>
              <span class="text-xs font-medium text-gray-500 w-8 text-right">{{ row[col.field] }}%</span>
            </div>
          }
          @case ('actions') {
            <div class="flex items-center justify-end gap-1">
              <ng-container *ngTemplateOutlet="actionsTemplate || defaultActions; context: { $implicit: row }"></ng-container>
            </div>
          }
          @case ('custom') {
            <ng-container *ngTemplateOutlet="customBodyTemplate; context: { $implicit: row, column: col }"></ng-container>
          }
          @default {
            <span class="text-gray-700 break-words">{{ row[col.field] }}</span>
          }
        }
    </ng-template>

    <!-- Default Actions Template (if none provided) -->
    <ng-template #defaultActions let-row>
      <button class="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors">
        <span class="material-symbols-rounded">edit</span>
      </button>
    </ng-template>
  `,
  styles: [`
    /* PAVIS Colors Custom Properties are expected in styles.scss */
  `]
})
export class ExpandableTableComponent implements OnDestroy, AfterContentInit {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() title: string = '';
  @Input() selectable = false;
  @Input() showTools = true;
  @Input() showExpandControls = true;
  @Input() showFooter = true;
  @Input() showRowToggle = true;

  @Output() selectionChange = new EventEmitter<any[]>();

  // Templates injected from parent
  @ContentChild('expandedRowTemplate') expandedRowTemplate!: TemplateRef<any>;
  @ContentChild('customBodyTemplate') customBodyTemplate!: TemplateRef<any>;
  @ContentChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

  expandedRows = signal<Set<any>>(new Set());
  selectedRows = signal<Set<any>>(new Set());
  isCardView = signal<boolean>(false);
  
  private platformId = inject(PLATFORM_ID);
  private mediaQueryList: MediaQueryList | null = null;
  private mediaQueryListener = (e: MediaQueryListEvent) => this.isCardView.set(e.matches);

  constructor() {
    // Only access window in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Use matchMedia for responsive logic (LG breakpoint: 1024px)
      // Matches true if screen width is < 1024px (Mobile/Tablet) -> Card View
      this.mediaQueryList = window.matchMedia('(max-width: 1023px)');
      
      // Set initial state
      this.isCardView.set(this.mediaQueryList.matches);
      
      // Listen for changes
      this.mediaQueryList.addEventListener('change', this.mediaQueryListener);
    }
    
    // Add effect to log data changes
    effect(() => {
      console.log('[ExpandableTable] Data changed:', this.data);
      console.log('[ExpandableTable] Data length:', this.data.length);
      console.log('[ExpandableTable] Columns:', this.columns);
    });
  }

  ngOnDestroy() {
    if (this.mediaQueryList) {
      this.mediaQueryList.removeEventListener('change', this.mediaQueryListener);
    }
  }

  ngAfterContentInit() {
    console.log('[ExpandableTable] ngAfterContentInit called');
    console.log('[ExpandableTable] expandedRowTemplate:', this.expandedRowTemplate);
    console.log('[ExpandableTable] customBodyTemplate:', this.customBodyTemplate);
    console.log('[ExpandableTable] actionsTemplate:', this.actionsTemplate);
  }

  // --- View Toggle Logic ---
  toggleCardView() {
    this.isCardView.update(v => !v);
  }

  // --- Expansion Logic ---
  toggleRow(row: any) {
    this.expandedRows.update(set => {
      const newSet = new Set(set);
      if (newSet.has(row)) newSet.delete(row);
      else newSet.add(row);
      return newSet;
    });
  }

  isExpanded(row: any) {
    return this.expandedRows().has(row);
  }

  expandAll() {
    this.expandedRows.set(new Set(this.data));
  }

  collapseAll() {
    this.expandedRows.set(new Set());
  }

  // --- Selection Logic ---
  toggleSelection(row: any) {
    this.selectedRows.update(set => {
      const newSet = new Set(set);
      if (newSet.has(row)) newSet.delete(row);
      else newSet.add(row);
      this.selectionChange.emit(Array.from(newSet));
      return newSet;
    });
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedRows.set(new Set());
    } else {
      this.selectedRows.set(new Set(this.data));
    }
    this.selectionChange.emit(Array.from(this.selectedRows()));
  }

  isSelected(row: any) {
    return this.selectedRows().has(row);
  }

  isAllSelected() {
    return this.data.length > 0 && this.selectedRows().size === this.data.length;
  }

  // --- Helpers ---
  getTotalColumns() {
    return this.columns.length + (this.showRowToggle ? 1 : 0) + (this.selectable ? 1 : 0);
  }

  getPrimaryText(row: any): string {
    const primaryCol = this.columns.find(c => c.type === 'text' || !c.type) || this.columns[0];
    return primaryCol ? row[primaryCol.field] : 'Item';
  }

  getStatusColumns() {
    return this.columns.filter(c => ['status', 'priority', 'viability'].includes(c.type || ''));
  }

  getSecondaryColumns() {
    return this.columns.filter(c => !['status', 'priority', 'viability'].includes(c.type || '') && c !== this.columns[0]);
  }

  getGridColumns() {
    return this.columns.filter(c => 
      !['status', 'priority', 'viability', 'progress', 'actions'].includes(c.type || '') && 
      c !== this.columns[0]
    );
  }

  getProgressColumns() {
    return this.columns.filter(c => c.type === 'progress');
  }

  getActionColumns() {
    return this.columns.filter(c => c.type === 'actions');
  }

  getAlignClass(align?: string) {
    return align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  }

  // --- PAVIS Color Mapping ---
  getStatusClass(status: string) {
    // Map backend status to PAVIS Palette
    switch (status?.toUpperCase()) {
      case 'VALIDATED': case 'VALIDADO': return 'bg-green-50 text-green-700 border-green-200';
      case 'RETURNED': case 'DEVUELTO': case 'RETURNED_FOR_CORRECTION': return 'bg-red-50 text-red-700 border-red-200';
      case 'PROCESS': case 'EN_PROCESO': case 'ACTIVE': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PENDING': case 'PENDIENTE': case 'DRAFT': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  }

  getStatusDotClass(status: string) {
    switch (status?.toUpperCase()) {
      case 'VALIDATED': case 'VALIDADO': return 'bg-green-500';
      case 'RETURNED': case 'DEVUELTO': case 'RETURNED_FOR_CORRECTION': return 'bg-red-500';
      case 'PROCESS': case 'EN_PROCESO': case 'ACTIVE': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  }

  getPriorityClass(priority: string) {
    switch (priority?.toUpperCase()) {
      case 'URGENT': case 'URGENTE': case 'ALTA': return 'bg-red-100 text-red-800';
      case 'ALERT': case 'ALERTA': case 'MEDIA': return 'bg-orange-100 text-orange-800';
      case 'INFO': case 'BAJA': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityIcon(priority: string) {
    switch (priority?.toUpperCase()) {
      case 'URGENT': case 'URGENTE': case 'ALTA': return 'error'; // Rojo
      case 'ALERT': case 'ALERTA': case 'MEDIA': return 'warning'; // Naranja
      case 'INFO': case 'BAJA': return 'info'; // Azul
      default: return 'help';
    }
  }

  getViabilityClass(viability: string) {
    switch (viability?.toUpperCase()) {
      case 'ENABLED': case 'HABILITADO': return 'bg-green-100 text-green-800 border-green-200';
      case 'PRE_ENABLED': case 'PRE_HABILITADO': return 'bg-lime-100 text-lime-800 border-lime-200';
      case 'HIGH': case 'ALTA': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'MEDIUM': case 'MEDIA': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'NONE': case 'NINGUNA': case 'BAJA': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  }
  
  getProgressColor(value: number) {
    if (value >= 100) return 'bg-green-500';
    if (value >= 75) return 'bg-blue-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  }
}
