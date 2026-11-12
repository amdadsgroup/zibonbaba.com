# Testing Plan & Quality Assurance - Zibonbaba.com

This document establishes the testing methodologies and verification checkpoints required to maintain software quality on the Zibonbaba platform.

## 1. Testing Pyramid Structure

```
+-----------------------------------------------------------+
|                      E2E (Playwright)                     |
|                   [ Checkout, POS Sync ]                  |
|                        (5% coverage)                      |
+-----------------------------------------------------------+
|                     Integration Tests                     |
|           [ API controllers, Auth Flow, POS DB ]          |
|                       (25% coverage)                      |
+-----------------------------------------------------------+
|                        Unit Tests                         |
|      [ Helpers, Pricing, Tax Calcs, Reducers, Hooks ]      |
|                       (70% coverage)                      |
+-----------------------------------------------------------+
```

---

## 2. Test Execution Guidelines

### 2.1 Unit Testing (Jest / Vitest)
* **Goal**: Verifying small, isolated helper modules.
* **Key Targets**: Price calculation helpers, tax rates, cart additions, search keyword cleaners, and layout token parsers.
* **Command**: `npm run test:unit`

### 2.2 Integration Testing (Supertest)
* **Goal**: Validating the backend Express route handling, input schemas, and database responses.
* **Key Targets**: Login token creation, product addition constraints, category updates, and order creations.
* **Command**: `npm run test:integration`

### 2.3 End-to-End Testing (Playwright)
* **Goal**: Simulating user workflows inside actual browser environments.
* **Key Flows**:
  * Guest checkout on the store catalog.
  * POS sales clerk adding custom items, adjusting pricing parameters, and printing transaction receipts.
  * Vendor configuring warehouse inventory and verifying multi-branch counts.
* **Command**: `npm run test:e2e`

### 2.4 Performance & Load Testing (k6)
* **Goal**: Verifying response rates and server loads during promotional events.
* **Targets**:
  * 1,000 concurrent storefront search requests.
  * 200 checkouts/second during flash sales.
  * Latency under 500ms for active POS terminals.

### 2.5 Accessibility Auditing (Axe Core)
* **Standard**: Conforming to WCAG 2.1 AA parameters.
* **Checks**: Checking color contrast ratios (especially brand yellow components), keyboard focus traps on dropdown flyouts, and ARIA label markers for product card buttons.
