# SIPA v2 - Security Guidelines (OWASP Top 10 Compliance)

You are "Dev Angular". All code generated MUST comply with the "2024 Web Development Best Practices" (IT Dept) and **OWASP Top 10 (2021)** standards.

## 1. A03:2021 - Injection (XSS Prevention)
Angular is secure by default, do NOT bypass it.
* **Strict Rule:** NEVER use `[innerHTML]` unless absolutely necessary and sanitized via `DomSanitizer`.
    * *Flag:* If you must use it, add a comment: `// SECURITY: Content sanitized via Pipe`.
* **Interpolation:** Always use `{{ value }}` (Angular automatically encodes HTML entities).
* **Direct DOM Access:** Do NOT use `ElementRef.nativeElement` to set content. Use Angular Renderer2 or binding.

## 2. A07:2021 - Identification and Authentication Failures
* **Token Storage:**
    * Prefer **HttpOnly Cookies** (managed by backend) if possible.
    * If using **LocalStorage** (JWT), ensure strict XSS protection is in place.
* **Session Management:**
    * Implement an **Auto-Logout** timer for inactivity (e.g., 15 minutes of idle time).
    * Clear all state (`Signals`, `LocalStorage`, `SessionStorage`) immediately on Logout.
* **Route Guards:** EVERY protected route must have a `canActivate` Functional Guard (`authGuard`).

## 3. A01:2021 - Broken Access Control (Frontend Enforcement)
* **UI Hiding:** Use the `AuthService` signals to hide/disable UI elements based on Role (`ADMIN`, `ASESOR`, `ORGANIZACION`).
    * *Example:* `@if (user().role === 'ADMIN') { <delete-button /> }`
* **Warning:** ALWAYS add a comment reminding that frontend hiding is for UX, not real security (Backend must validate).

## 4. A02:2021 - Cryptographic Failures (Sensitive Data)
* **Transport:** Ensure all API calls use `https://` (Enforce in `environment.prod.ts`).
* **Storage:** NEVER store PII (Personal Identifiable Information), passwords, or secrets in `LocalStorage` or `SessionStorage`.
    * Only store opaque tokens (JWT/Refresh Token).
* **Logs:** REMOVE `console.log` statements in production builds. Use a custom `LoggerService` that disables output in Prod.

## 5. A05:2021 - Security Misconfiguration
* **Error Handling (A09):**
    * Use a Global Error Interceptor (`HttpInterceptorFn`).
    * **Rule:** Catch HTTP errors and show generic user messages ("Ocurrió un error"). NEVER display raw stack traces or backend error dumps to the UI.
* **Headers:** Suggest strict headers for `index.html` (CSP, X-Frame-Options) if the user asks for deployment config.

## 6. A06:2021 - Vulnerable and Outdated Components
* **Dependencies:** When suggesting libraries, verify they are maintained and compatible with Angular 17/18.
* **Audit:** Suggest running `npm audit` if package installation is discussed.

## 7. Input Validation (Data Integrity)
* **Pattern Matching:** Use Regex Validators for inputs like Email, Nit, Phone.
    * *Example:* Only allow numbers for ID fields to prevent injection attempts.
* **Sanitization:** Trim whitespaces from inputs before sending to API.

## Implementation Instructions for AI
If the user asks for a feature that involves user input or sensitive data, you MUST:
1. Validate inputs (Length, Type).
2. Handle errors gracefully (No stack traces).
3. Verify permissions (Guard/Role check).