import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordValidator {
  static strength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const hasMinLength = value.length >= 6;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      const errors: any = {};

      if (!hasMinLength) errors.minLength = true;
      if (!hasUpperCase) errors.upperCase = true;
      if (!hasLowerCase) errors.lowerCase = true;
      if (!hasNumber) errors.number = true;
      if (!hasSpecialChar) errors.specialChar = true;

      return Object.keys(errors).length ? { passwordStrength: errors } : null;
    };
  }

  static match(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (!control || !matchingControl) {
        return null;
      }

      if (matchingControl.errors && !matchingControl.errors['passwordMismatch']) {
        return null;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        matchingControl.setErrors(null);
        return null;
      }
    };
  }

  static getStrengthMessage(errors: any): string {
    if (!errors) return '';

    const messages = [];
    if (errors.minLength) messages.push('• pelo menos 6 caracteres');
    if (errors.upperCase) messages.push('• pelo menos uma letra maiúscula');
    if (errors.lowerCase) messages.push('• pelo menos uma letra minúscula');
    if (errors.number) messages.push('• pelo menos um número');
    if (errors.specialChar) messages.push('• pelo menos um caractere especial (!@#$% etc)');

    return messages.length ? `A senha deve conter:\n${messages.join('\n')}` : '';
  }
}
