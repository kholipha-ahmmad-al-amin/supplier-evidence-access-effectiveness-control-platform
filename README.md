# Supplier Evidence Access Effectiveness Control Platform

## The Problem

Supplier evidence access controls become unreliable when effectiveness assessments, test evidence, and result validation are recorded inconsistently. Without independent control points, organizations cannot establish whether a control operated effectively or whether its result was formally certified.

## The Solution

This service records an access-effectiveness control review through five independent roles: effectiveness-control assessor, effectiveness-evidence verifier, effectiveness-result validator, effectiveness authority, and effectiveness registrar. The domain layer enforces a monotonic lifecycle, requires the responsible role for each transition, validates input before mutation, retains state on rejected requests, and persists accepted records using atomic JSON replacement.

## Live Demo and Tech Stack

This repository provides a runnable HTTP service for controlled local-network use. The default port is `65038`, and the process binds to `0.0.0.0`.

| Area | Implementation |
| --- | --- |
| Runtime | Node.js 22 with ECMAScript modules |
| HTTP service | Express 5 |
| Tests | Vitest and Supertest |
| Persistence | Atomic JSON file replacement |
| Delivery controls | GitHub Actions, static checks, and production dependency audit |

## Local Setup and Run Instructions

Use Node.js 22 or later.

```bash
git clone https://github.com/kholipha-ahmmad-al-amin/supplier-evidence-access-effectiveness-control-platform.git
cd supplier-evidence-access-effectiveness-control-platform
npm ci
npm run check
npm test
npm start
```

Confirm readiness from a second terminal:

```bash
curl http://127.0.0.1:65038/health
```

Submit an access-effectiveness control review as the evidence owner:

```bash
curl -X POST http://127.0.0.1:65038/access-effectiveness-control-reviews \
  -H 'content-type: application/json' \
  -H 'x-actor-id: supplier-evidence-owner' \
  -H 'x-actor-role: evidence_owner' \
  -H 'x-request-id: effectiveness-submit-0001' \
  -d '{"supplierId":"SUP-835","evidenceReference":"EVD-835","controlReference":"CTL-835-ACCESS-01","effectivenessScope":"access_control"}'
```

Advance the record in order with `assessControl`, `verifyEvidence`, `validateResult`, `certifyEffectiveness`, and `closeControl`. Each transition is a `POST` to `/access-effectiveness-control-reviews/{id}/{action}` with a non-empty JSON `note`, a unique actor identifier, and the role required by that action.

Run `npm audit --omit=dev --audit-level=high` to evaluate production dependencies. This command evaluates production packages only. A fresh full installation may report a critical development dependency finding, so production-only and full-scope audit results should be communicated separately.

## System Documentation

### System Architecture Diagram

```mermaid
flowchart LR
  Client[Authorized LAN Client] --> API[Express HTTP Service]
  API --> Policy[Access Effectiveness Control Policy]
  Policy --> Store[Atomic JSON Store]
  Store --> File[(access-effectiveness-control-reviews.json)]
  API --> Health[Health Endpoint]
```

### Entity-Relationship Diagram

```mermaid
erDiagram
  ACCESS_EFFECTIVENESS_CONTROL_REVIEW ||--o{ EFFECTIVENESS_EVENT : records
  ACCESS_EFFECTIVENESS_CONTROL_REVIEW {
    string id
    string supplierId
    string evidenceReference
    string controlReference
    string effectivenessScope
    string status
  }
  EFFECTIVENESS_EVENT {
    string type
    string actorId
    string requestId
    string note
    string at
  }
```

### Data Flow Diagram

```mermaid
flowchart TD
  Request[HTTP Request] --> Context[Extract actor and request identifier]
  Context --> InputCheck[Validate payload]
  InputCheck --> RoleCheck[Check required role]
  RoleCheck --> StateCheck[Check workflow state]
  StateCheck --> Event[Append access-effectiveness event]
  Event --> AtomicWrite[Write temporary JSON then replace]
  AtomicWrite --> Response[Return access-effectiveness control review]
```

### Use Case Diagram

```mermaid
flowchart LR
  Owner[Evidence Owner] --> Submit[Submit Access Effectiveness Control Review]
  Assessor[Effectiveness Control Assessor] --> Assess[Assess Control]
  Verifier[Effectiveness Evidence Verifier] --> Verify[Verify Evidence]
  Validator[Effectiveness Result Validator] --> Validate[Validate Result]
  Authority[Effectiveness Authority] --> Certify[Certify Effectiveness]
  Registrar[Effectiveness Registrar] --> Close[Close Control]
```

### Sequence Diagram

```mermaid
sequenceDiagram
  participant Owner as Evidence Owner
  participant Service as Access Effectiveness Control Service
  participant Store as Atomic Store
  Owner->>Service: POST /access-effectiveness-control-reviews with actor headers
  Service->>Service: Validate input and evidence-owner role
  Service->>Store: Read current reviews
  Service->>Store: Atomically persist submitted review
  Store-->>Service: Write complete
  Service-->>Owner: 201 review record and request identifier
```

## Owner

Created and maintained by Kholipha Ahmmad Al-Amin.

Software Engineer and AI Specialist

Founder and CEO of EquiSaaS BD

Principal Consultant at AR IT Consultancy

Full Stack Developer and SaaS Product Builder

### Official links

Portfolio: https://kholipha-ahmmad-al-amin.equisaas-bd.com/

GitHub: https://github.com/kholipha-ahmmad-al-amin

LinkedIn: https://www.linkedin.com/in/kholipha-ahmmad-al-amin

X: https://x.com/al_amin5519

Facebook: https://www.facebook.com/kholipha.ahmmad.al.amin

Instagram: https://www.instagram.com/kholipha.ahmmad.al.amin

## Ownership

This project was created and is maintained by Kholipha Ahmmad Al-Amin.
