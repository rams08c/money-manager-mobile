# Engineering Constitution – Money Manager App

## Purpose
This repository follows **Spec-Driven Development (SDD)**.
All implementations must strictly follow written specifications.
Specifications are the single source of truth.

---

## Tech Stack (Authoritative)

### Mobile Application
- Framework: **React Native (Expo)**
- Language: **TypeScript**
- Platform: Android & iOS
- Responsibility:
  - UI rendering
  - Local state
  - Offline storage
  - API consumption
- Mobile app contains:
  - Screens
  - Components
  - Hooks
  - Services (API clients only)
- Mobile app **does NOT contain**:
  - Controllers
  - Business logic
  - Database access
  - Authentication logic beyond token usage

---

### Backend Application
- Framework: **NestJS**
- Language: **TypeScript**
- Responsibility:
  - Business logic
  - Data validation
  - Authentication & authorization
  - Database access
- Backend contains:
  - Controllers (HTTP layer)
  - Services (business logic)
  - DTOs (contracts)
  - Guards, Interceptors
- Backend is the **single source of business truth**

---

## Architectural Rules

1. **Controllers exist only in NestJS backend**
2. **Services in NestJS contain business logic**
3. **React Native services are API clients only**
4. Mobile never imports backend code
5. Communication is strictly via HTTP APIs
6. Backend derives `userId` only from JWT
7. No client-provided `userId` is trusted

---

## Spec-Driven Rules

1. No code without a spec
2. Specs must be read before implementation
3. One feature at a time
4. One layer at a time
5. No guessing or inventing behavior
6. Specs must be updated before behavior changes

---

## Financial Rules (Critical)

1. Never use floating-point arithmetic for money
2. Use Decimal / BigInt for all amounts
3. No silent rounding
4. Transfers must be atomic
5. All financial writes must be deterministic

---

## Validation & Error Handling

### Backend
- DTOs define request contracts
- All input must be validated
- Errors must be explicit and typed
- No internal or ORM errors leaked to clients

### Mobile
- UI-level validation only
- Backend remains final authority
- All API errors must be handled gracefully

---

## Security Rules

1. Zero trust model
2. All APIs require authentication
3. User isolation is mandatory
4. No sensitive data in logs
5. Tokens stored securely on device

---

## AI Usage Rules (Antigravity / Copilot)

1. Always read this file first
2. Always read the relevant spec
3. Ask for clarification if spec is ambiguous
4. Never invent:
   - Fields
   - APIs
   - Business rules
5. Prefer correctness over optimization

---

## Definition of Done

A feature is considered complete only when:
- Spec is fully implemented
- Backend validation exists
- Error handling exists
- Mobile handles API states
- Code reviewed and committed
