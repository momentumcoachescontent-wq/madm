# Security Audit Report - Más Allá del Miedo

**Date:** January 2026
**Auditor:** Jules (AI Software Engineer)
**Scope:** Full Application (Frontend, Backend, Database, Configuration)

## 1. Executive Summary

A comprehensive security audit was performed on the `mas-alla-del-miedo` web application. The audit covered dependency analysis, static code analysis of backend and frontend logic, configuration review, and secret scanning.

**Overall Security Posture:** **Good**. The application follows many best practices, including robust authentication middleware, use of safe database bindings (D1) to prevent SQL injection, and secure handling of payment Webhooks.

However, **two critical areas** were identified that require immediate attention:
1.  **High Severity Stored XSS** vulnerability in the Student Lesson view.
2.  **High Severity Dependency Vulnerabilities** in the core framework (`hono`).

## 2. Vulnerability Summary

| ID | Severity | Category | Description | Status |
| ---- | ---------- | ---------- | ------------- | -------- |
| VULN-001 | **High** | XSS | Stored Cross-Site Scripting in Lesson Content | Open |
| VULN-002 | **High** | Dependency | Known vulnerabilities in `hono` (Auth Bypass, XSS) | Open |
| VULN-003 | **Moderate** | Dependency | Denial of Service risk in `undici` (via `wrangler`) | Open |
| VULN-004 | Low | Data Privacy | `password_hash` present in internal session objects | Open |

## 3. Detailed Findings

### VULN-001: Stored XSS in Lesson Content
*   **Location:** `src/routes/student.tsx` (Lesson View)
*   **Description:** The application renders lesson content using `dangerouslySetInnerHTML` without prior sanitization.
    ```typescript
    // src/routes/student.tsx
    <div style="..." dangerouslySetInnerHTML={{__html: lesson.content}} />
    ```
    The content is sourced from the `lessons` table, which is populated via the Admin interface (`src/features/courses/routes/admin-lessons.tsx`). The Admin interface saves the content raw without sanitization.
*   **Impact:** If an attacker compromises an Admin account or exploits an injection flaw in the Admin panel, they can inject malicious JavaScript into lesson content. This script would execute in the browser of every student who views the lesson, potentially stealing session cookies or redirecting users.
*   **Remediation:** Apply `sanitizeHtml` (from `src/lib/sanitize.ts`) to the content before rendering it in `src/routes/student.tsx`.

### VULN-002: Dependency Vulnerabilities (Hono)
*   **Location:** `package.json` / `node_modules`
*   **Description:** `npm audit` reported high-severity vulnerabilities in `hono <= 4.11.6`.
*   **JWT Algorithm Confusion:** Allows token forgery.
*   **XSS in ErrorBoundary:** Reflected XSS.
*   **Arbitrary Key Read:** In Serve Static middleware.
*   **Impact:** Potential for authentication bypass (if using JWT middleware) or XSS.
*   **Remediation:** Update `hono` to the latest version (`npm install hono@latest`).

### VULN-003: Dependency Vulnerabilities (Undici/Wrangler)
*   **Location:** `node_modules`
*   **Description:** `undici` (used by `wrangler` -> `miniflare`) has a vulnerability related to unbounded decompression, leading to resource exhaustion (DoS).
*   **Impact:** Primarily affects the development/build environment or if `wrangler` is used in production runtime in an exposed way (unlikely for Pages, but relevant for dev).
*   **Remediation:** Run `npm audit fix` to update nested dependencies.

### VULN-004: Password Hash in Internal Session Object
*   **Location:** `src/models/users.ts` -> `getUserFromSession`
*   **Description:** The `getUserFromSession` function selects all fields from the `users` table, including `password_hash`.
    ```typescript
    // src/models/users.ts
    // ... u.password_hash ...
    ```
    While this data is not currently exposed in API responses (checked `/api/me`, `/api/login`), passing the full user object around the backend increases the risk of accidental exposure (e.g., if a developer adds a debug log or passes the user object to a view that renders it).
*   **Impact:** Low. Internal risk management.
*   **Remediation:** Modify `getUserFromSession` to explicitly exclude `password_hash` or create a sanitized `SafeUser` type that omits sensitive fields.

## 4. Security Best Practices Observed (Positive Findings)
*   **No Hardcoded Secrets:** A scan of the codebase revealed no hardcoded API keys or secrets. Environment variables (`c.env`) are used correctly.
*   **SQL Injection Protection:** All database interactions use Cloudflare D1's parameterized queries (`db.prepare(...).bind(...)`).
*   **Auth Middleware:** Admin routes are strictly protected by role-based middleware. Student routes verify course enrollment before granting access.
*   **Sanitization (Blog):** Public blog posts are correctly sanitized using `xss` library before rendering.
*   **Secure Headers:** `sanitizeHtml` logic includes stripping dangerous tags while allowing safe styling.

## 5. Recommended Action Plan

1.  **Immediate Fixes:**
*   Run `npm install hono@latest` to patch the framework vulnerabilities.
*   Modify `src/routes/student.tsx` to use `sanitizeHtml(lesson.content)` inside the `dangerouslySetInnerHTML` block.

2.  **Short Term:**
*   Run `npm audit fix` to address remaining dependency issues.
*   Refactor `src/models/users.ts` to return a `User` type that excludes `password_hash` by default.

3.  **Long Term:**
*   Implement Content Security Policy (CSP) headers in `src/index.tsx` (via Hono middleware) to restrict script sources and further mitigate XSS risks.
