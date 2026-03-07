import { Component, EventEmitter, inject, Input, Output, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DropdownItem {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-dropdown.component.html',
  styleUrls: ['./custom-dropdown.component.css']
})
export class CustomDropdownComponent {
  private _items: DropdownItem[] = [];
  @Input()
  set items(value: DropdownItem[]) {
    this._items = value;
    // Re-try selection when items change
    if (this.selectedValue) {
      const found = value.find(item => item.id === this.selectedValue);
      if (found && !this.selectedItem) {
        this.selectedItem = found;
      }
    }
  }
  get items(): DropdownItem[] {
    return this._items;
  }

  @Input() placeholder: string = 'Seleccione...';
  @Input() disabled: boolean = false;
  @Input() invalid: boolean | undefined = false;
  @Input() enableSearch: boolean = true;
  @Input() selectedValue: string = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<DropdownItem>();
  @Output() dropdownOpen = new EventEmitter<void>();

  @ViewChild('dropdownTrigger') dropdownTrigger!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  isOpen = false;
  searchQuery = '';
  selectedItem: DropdownItem | null = null;

  get filteredItems(): DropdownItem[] {
    if (!this.enableSearch || !this.searchQuery) {
      return this.items;
    }
    const query = this.searchQuery.toLowerCase();
    return this.items.filter(item =>
      item.nombre.toLowerCase().includes(query)
    );
  }

  get displayValue(): string {
    return this.selectedItem?.nombre || '';
  }

  ngOnChanges() {
    if (this.selectedValue) {
      this.selectedItem = this.items.find(item => item.id === this.selectedValue) || null;
    } else {
      this.selectedItem = null;
    }
  }

  toggleDropdown() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.dropdownOpen.emit();
      setTimeout(() => {
        if (this.enableSearch) {
          this.searchInput?.nativeElement?.focus();
        }
      });
    }
  }

  selectItem(item: DropdownItem) {
    this.selectedItem = item;
    this.searchQuery = '';
    this.isOpen = false;
    this.valueChange.emit(item.id);
    this.selectionChange.emit(item);
  }

  clearSelection(event: MouseEvent) {
    event.stopPropagation();
    if (this.disabled) return;
    this.selectedItem = null;
    this.searchQuery = '';
    this.valueChange.emit('');
    this.selectionChange.emit({ id: '', nombre: '' });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.dropdownTrigger?.nativeElement?.contains(event.target)) {
      this.isOpen = false;
      this.searchQuery = '';
    }
  }

  focusSearch() {
    if (this.enableSearch && this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }
}

export type { DropdownItem as CustomDropdownItem };
