import { Component, EventEmitter, Output, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <!-- Mobile View -->
      <div class="flex flex-1 justify-between sm:hidden">
        <button 
          [disabled]="currentPage() === 1"
          (click)="onPageChange(currentPage() - 1)"
          class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Anterior
        </button>
        <button 
          [disabled]="currentPage() === totalPages()"
          (click)="onPageChange(currentPage() + 1)"
          class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Siguiente
        </button>
      </div>

      <!-- Desktop View -->
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Mostrando
            <span class="font-medium">{{ startItem() }}</span>
            a
            <span class="font-medium">{{ endItem() }}</span>
            de
            <span class="font-medium">{{ totalItems() }}</span>
            resultados
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <!-- Previous -->
            <button 
              [disabled]="currentPage() === 1"
              (click)="onPageChange(currentPage() - 1)"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="material-symbols-rounded text-sm">chevron_left</span>
            </button>
            
            <!-- Page Numbers -->
            @for (page of visiblePages(); track page) {
              <button 
                (click)="onPageChange(page)"
                [class.bg-blue-600]="page === currentPage()"
                [class.text-white]="page === currentPage()"
                [class.hover:bg-blue-500]="page === currentPage()"
                [class.text-gray-900]="page !== currentPage()"
                [class.ring-1]="true"
                [class.ring-inset]="true"
                [class.ring-gray-300]="true"
                [class.hover:bg-gray-50]="page !== currentPage()"
                class="relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0">
                {{ page }}
              </button>
            }

            <!-- Next -->
            <button 
              [disabled]="currentPage() === totalPages()"
              (click)="onPageChange(currentPage() + 1)"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="material-symbols-rounded text-sm">chevron_right</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `
})
export class PaginationComponent {
  totalItems = input.required<number>();
  itemsPerPage = input<number>(10);
  currentPage = input.required<number>();

  @Output() pageChange = new EventEmitter<number>();

  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));
  
  startItem = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.itemsPerPage() + 1;
  });

  endItem = computed(() => {
    const end = this.currentPage() * this.itemsPerPage();
    return end > this.totalItems() ? this.totalItems() : end;
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    const windowStart = Math.max(1, Math.min(current - 2, total - 4));
    const windowEnd = Math.min(total, windowStart + 4);
    
    const simpleRange = [];
    for (let i = windowStart; i <= windowEnd; i++) {
      simpleRange.push(i);
    }
    return simpleRange;
  });

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
