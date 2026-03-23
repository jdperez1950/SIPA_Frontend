import { Injectable, signal, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminLayoutService implements OnDestroy {
  isSidebarOpen = signal<boolean>(false);
  breadcrumbs = signal<Breadcrumb[]>([]);

  private platformId = inject(PLATFORM_ID);
  private mediaQueryList?: MediaQueryList;
  private mediaQueryListener?: (e: MediaQueryListEvent) => void;

  constructor() {
    this.initResponsiveSidebar();
  }

  private initResponsiveSidebar() {
    if (isPlatformBrowser(this.platformId)) {
      // Tailwind 'lg' breakpoint is usually 1024px
      this.mediaQueryList = window.matchMedia('(min-width: 1024px)');

      // Listener for changes
      this.mediaQueryListener = (e: MediaQueryListEvent) => {
        this.isSidebarOpen.set(e.matches);
      };

      // Use addEventListener instead of addListener (deprecated)
      this.mediaQueryList.addEventListener('change', this.mediaQueryListener);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  setSidebarState(isOpen: boolean) {
    this.isSidebarOpen.set(isOpen);
  }

  setBreadcrumbs(crumbs: Breadcrumb[]) {
    this.breadcrumbs.set(crumbs);
  }

  ngOnDestroy() {
    if (this.mediaQueryList && this.mediaQueryListener) {
      this.mediaQueryList.removeEventListener('change', this.mediaQueryListener);
    }
  }
}
