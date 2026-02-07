# PAVIS - Accessibility Guidelines (a11y)

You are "Dev Angular". All code generated MUST comply with **WCAG 2.1 Level AA** standards. 
Accessibility is mandatory for Government Applications (MinVivienda).

## 1. Semantic HTML & Structure
* **Landmarks:** Use `<main>`, `<nav>`, `<header>`, `<footer>`, and `<aside>` to define page structure.
* **Headings:** Maintain a strict hierarchy (`h1` -> `h2` -> `h3`). Never skip levels for styling.
* **Buttons vs Links:**
    * Use `<button>` for actions (Save, Modal, Menu).
    * Use `<a [routerLink]>` for navigation (Change URL).
    * **Forbidden:** `<div (click)="...">`. If you must, add `role="button"` and `(keydown.enter)`.

## 2. Forms & Inputs (Critical)
* **Labels:** EVERY input must have a label.
    * **Visible:** `<label for="email">Email</label>` + `<input id="email">`.
    * **Hidden (Search/Icons):** Use `aria-label="Buscar proyecto"`.
* **Errors:** Connect errors to inputs using `aria-describedby`.
    ```html
    <input aria-describedby="email-error" [class.error]="invalid">
    @if (invalid) {
      <span id="email-error" class="text-red-600">Email inválido</span>
    }
    ```
* **Autocomplete:** Use standard attributes (e.g., `autocomplete="username"`, `autocomplete="current-password"`).

## 3. Focus & Keyboard Navigation
* **Visual Focus:** NEVER remove outline (`outline-none`) without providing a visual alternative.
    * **Tailwind Standard:** `focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none`.
* **Tab Order:** Do not use `tabindex` greater than 0.
* **Skip Links:** Ensure the main layout has a "Skip to main content" link for keyboard users.

## 4. Colors & Contrast
* **Text Contrast:** Use the defined `theme-colors.ts` which are contrast-checked.
    * Avoid white text on light backgrounds (e.g., `bg-yellow-300`).
* **Visual Cues:** Don't rely on color alone.
    * *Bad:* "Red fields are required."
    * *Good:* "Red fields marked with (*) are required."

## 5. Icons & Images
* **Decorative Icons:** MUST have `aria-hidden="true"`.
* **Meaningful Images:** MUST have an `alt` description.
* **Icon Buttons:** Buttons containing only an icon MUST have `aria-label`.
    ```html
    <button aria-label="Cerrar modal">
      <icon-close aria-hidden="true" />
    </button>
    ```

## 6. Angular Specifics (Dynamic Content)
* **Route Changes:** Ensure focus moves to the `h1` or main container after navigation.
* **Live Regions:** For dynamic updates (toasts, loading status), use `aria-live`.
    ```html
    @if (isLoading()) {
      <div role="status" aria-live="polite" class="sr-only">Cargando información...</div>
      <spinner-component />
    }
    ```
* **Modals:** When a modal opens, focus must be trapped inside it. When closed, focus returns to the trigger button.

## 7. Motion
* **Reduced Motion:** Respect user preferences.
    * Tailwind: `motion-reduce:transition-none` or `motion-reduce:transform-none`.