import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const NUMERIC_ONLY_ERROR_KEY = 'numericOnly';
export const TEXT_ONLY_ERROR_KEY = 'textOnly';
export const PHONE_LENGTH_ERROR_KEY = 'phoneLength';
export const NIT_FORMAT_ERROR_KEY = 'nitFormat';

export const numericOnlyValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;

  if (!value) {
    return null;
  }

  const numericRegex = /^[0-9]+$/;

  if (!numericRegex.test(value)) {
    return {
      [NUMERIC_ONLY_ERROR_KEY]: true
    };
  }

  return null;
};

export const nitFormatValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;

  if (!value) {
    return null;
  }

  const nitRegex = /^[0-9]{10}$/;

  if (!nitRegex.test(value)) {
    return {
      [NIT_FORMAT_ERROR_KEY]: true
    };
  }

  return null;
};

export const textOnlyValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;

  if (!value) {
    return null;
  }

  const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

  if (!textRegex.test(value)) {
    return {
      [TEXT_ONLY_ERROR_KEY]: true
    };
  }

  return null;
};

export function getNumericOnlyErrorMessage(): string {
  return 'Solo se permiten números';
}

export function getNitFormatErrorMessage(): string {
  return 'Digite los 10 números sin guion, ni puntos, etc.';
}

export function getTextOnlyErrorMessage(): string {
  return 'Solo se permite texto';
}

export function getEmailErrorMessage(): string {
  return 'Formato de correo inválido';
}

export function getRequiredErrorMessage(): string {
  return 'Este campo es obligatorio';
}

export function getMinLengthErrorMessage(minLength: number): string {
  return `Mínimo ${minLength} caracteres`;
}

export function getMinDocumentNumberLengthErrorMessage(): string {
  return 'Mínimo 5 caracteres';
}

export function getMinNameLengthErrorMessage(): string {
  return 'Mínimo 3 caracteres';
}

export const phoneLengthValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;

  if (!value) {
    return null;
  }

  // Validar que sean solo números
  const numericRegex = /^[0-9]+$/;
  if (!numericRegex.test(value)) {
    return {
      [NUMERIC_ONLY_ERROR_KEY]: true
    };
  }

  // Validar longitud mínima (5) y máxima (13)
  if (value.length < 5 || value.length > 13) {
    return {
      [PHONE_LENGTH_ERROR_KEY]: true
    };
  }

  return null;
};

export function getPhoneLengthErrorMessage(): string {
  return 'El teléfono debe tener entre 5 y 13 dígitos';
}
