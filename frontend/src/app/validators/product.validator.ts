import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, debounceTime, switchMap } from 'rxjs/operators';
import { ProductService } from '../core/services/product.service';

export class ProductValidator {
  static nameRequired(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value || value.trim() === '') {
        return { required: true };
      }
      if (value.length < 3) {
        return { minlength: true };
      }
      return null;
    };
  }

  static priceValid(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined) {
        return { required: true };
      }
      if (isNaN(value) || value <= 0) {
        return { invalid: true };
      }
      return null;
    };
  }

  static stockValid(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined) {
        return null;
      }
      if (value < 0) {
        return { negative: true };
      }
      if (!Number.isInteger(value)) {
        return { integer: true };
      }
      return null;
    };
  }

  static minMaxStock(minStockControl: string, maxStockControl: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const minStock = group.get(minStockControl)?.value;
      const maxStock = group.get(maxStockControl)?.value;

      if (minStock !== null && maxStock !== null && minStock > maxStock) {
        group.get(maxStockControl)?.setErrors({ minGreater: true });
        return { minGreater: true };
      }

      if (group.get(maxStockControl)?.hasError('minGreater')) {
        group.get(maxStockControl)?.setErrors(null);
      }

      return null;
    };
  }

  static uniqueCode(productService: ProductService, currentId?: string): ValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const code = control.value;
      if (!code || code.length < 3) {
        return of(null);
      }

      return of(code).pipe(
        debounceTime(500),
        switchMap(() => productService.getProductByCode(code)),
        map(response => {
          if (response.success && response.data && response.data.id !== currentId) {
            return { unique: true };
          }
          return null;
        })
      );
    };
  }
}
