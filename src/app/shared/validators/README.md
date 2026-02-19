# Validaciones Personalizadas

Este módulo contiene validadores reutilizables para formularios en Angular.

## Validadores Disponibles

### 1. `numericOnlyValidator`
Restringe el ingreso de datos a solo números.

**Uso:**
```typescript
import { numericOnlyValidator } from '@/shared/validators';

this.form = this.fb.group({
  identificationNumber: ['', [numericOnlyValidator]]
});
```

**Error key:** `numericOnly`

### 2. `nitFormatValidator`
Valida que el campo tenga exactamente 10 dígitos numéricos (formato NIT de Colombia).

**Uso:**
```typescript
import { nitFormatValidator } from '@/shared/validators';

this.form = this.fb.group({
  nit: ['', [nitFormatValidator]]
});
```

**Error key:** `nitFormat`

### 3. `textOnlyValidator`
Restringe el ingreso de datos a solo texto (letras y espacios).

**Uso:**
```typescript
import { textOnlyValidator } from '@/shared/validators';

this.form = this.fb.group({
  fullName: ['', [textOnlyValidator]]
});
```

**Error key:** `textOnly`

### 4. `phoneLengthValidator`
Valida que el teléfono tenga solo números y esté entre 5 y 13 dígitos.

**Uso:**
```typescript
import { phoneLengthValidator } from '@/shared/validators';

this.form = this.fb.group({
  phoneNumber: ['', [phoneLengthValidator]]
});
```

**Error keys:** `numericOnly` o `phoneLength`

## Funciones de Mensajes de Error

### `getNumericOnlyErrorMessage()`
Retorna: "Solo se permiten números"

### `getNitFormatErrorMessage()`
Retorna: "Digite los 10 números sin guion, ni puntos, etc."

### `getTextOnlyErrorMessage()`
Retorna: "Solo se permite texto"

### `getEmailErrorMessage()`
Retorna: "Formato de correo inválido"

### `getRequiredErrorMessage()`
Retorna: "Este campo es obligatorio"

### `getMinLengthErrorMessage(minLength: number)`
Retorna: "Mínimo {minLength} caracteres"

### `getMinDocumentNumberLengthErrorMessage()`
Retorna: "Mínimo 5 caracteres" (específico para número de documento)

### `getMinNameLengthErrorMessage()`
Retorna: "Mínimo 3 caracteres" (específico para nombre)

### `getPhoneLengthErrorMessage()`
Retorna: "El teléfono debe tener entre 5 y 13 dígitos"

## Ejemplo Completo en Template

```html
<input
  type="text"
  formControlName="nit"
  placeholder="Digite el NIT"
/>

@if (form.get('nit')?.hasError('nitFormat')) {
  <div class="error-message">{{ getNitFormatErrorMessage() }}</div>
}
```

## Constantes de Error Keys

- `NUMERIC_ONLY_ERROR_KEY`: 'numericOnly'
- `NIT_FORMAT_ERROR_KEY`: 'nitFormat'
- `TEXT_ONLY_ERROR_KEY`: 'textOnly'
