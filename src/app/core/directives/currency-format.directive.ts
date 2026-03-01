import { Directive, HostListener, ElementRef, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
  selector: '[currencyFormat]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyFormatDirective),
      multi: true
    }
  ]
})
export class CurrencyFormatDirective implements ControlValueAccessor {
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};
  private innerValue: number = 0;

  constructor(private el: ElementRef) {}

  @HostListener('input')
  onInput(): void {
    const value = this.el.nativeElement.value;
    this.formatValue(value);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
    this.formatValue(this.el.nativeElement.value);
  }

  writeValue(value: number): void {
    this.innerValue = value || 0;
    this.el.nativeElement.value = this.formatCurrency(this.innerValue);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  private formatValue(value: string): void {
    const numericValue = this.parseCurrency(value);
    this.innerValue = numericValue;
    this.el.nativeElement.value = this.formatCurrency(numericValue);
    this.onChange(numericValue);
  }

  private parseCurrency(value: string): number {
    const cleanValue = value.replace(/\./g, '').replace(/,/g, '').replace(/\D/g, '');
    return cleanValue ? parseFloat(cleanValue) : 0;
  }

  private formatCurrency(value: number): string {
    if (value === 0) return '';
    return value.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
}
