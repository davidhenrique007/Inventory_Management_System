import { Directive, HostListener, ElementRef, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appInputMask]',
  standalone: true
})
export class InputMaskDirective {
  @Input('appInputMask') maskType: 'currency' | 'number' = 'currency';

  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (this.maskType === 'currency') {
      if (value === '') value = '0';
      const numericValue = parseInt(value, 10) / 100;
      const formatted = numericValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      input.value = formatted;
      this.control.control?.setValue(numericValue, { emitEvent: false });
    } else if (this.maskType === 'number') {
      const numericValue = parseInt(value, 10);
      if (isNaN(numericValue)) {
        input.value = '';
        this.control.control?.setValue(null, { emitEvent: false });
      } else {
        input.value = numericValue.toString();
        this.control.control?.setValue(numericValue, { emitEvent: false });
      }
    }
  }
}
