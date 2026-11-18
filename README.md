# Sample Home Services — Demo (WEB-001)

Single-page demonstration website and validated contact intake pipeline built for **WEB-001 | AI-First End-to-End Website Development**.

> **Notice:** Demonstration only — no services offered.

## Live Deployment & Release History
- **Public HTTPS GitHub Pages URL**: `https://prime3436.github.io/sample-home-services-demo/`
- **GitHub Repository**: `https://github.com/prime3436/sample-home-services-demo`
- **Deployment Workflow**: [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)
- **Release A (Version 1 — "Contact Us")**:
  - Commit SHA: `f341f8b351448ae70ebd052be95292c1707754e1`
  - GitHub Actions Run: `https://github.com/prime3436/sample-home-services-demo/actions/runs/44303558340`
- **Release B (Version 2 — "Weekend Appointments" callout + "Request a Callback")**:
  - Deployed automatically via `.github/workflows/deploy.yml` on push to `main` to the same HTTPS URL (`https://prime3436.github.io/sample-home-services-demo/`).

## Fixed Stack
- **AI Builder**: Open-source `stackblitz-labs/bolt.diy` (prompts recorded in [`docs/BOLT_PROMPTS.md`](./docs/BOLT_PROMPTS.md))
- **Frontend**: React 18 + TypeScript + Vite (`base: "/sample-home-services-demo/"`), Tailwind CSS, shadcn/ui
- **Intake Edge Function**: Supabase Edge Function ([`supabase/functions/contact-submit/index.ts`](./supabase/functions/contact-submit/index.ts), `verify_jwt = false`)
- **Workflow Orchestration**: Windmill synchronous flow `f/contact/contact_intake` ([`windmill/f/contact/contact_intake.flow.json`](./windmill/f/contact/contact_intake.flow.json))
- **Database**: Supabase PostgreSQL `public.contact_submissions` with RLS enabled and forced ([`supabase/migrations/20261029000001_create_contact_submissions.sql`](./supabase/migrations/20261029000001_create_contact_submissions.sql))

## Handover Documents
- [`docs/OPERATOR_QUICKSTART.md`](./docs/OPERATOR_QUICKSTART.md) — One-page operator quick start (9 steps, <30-minute onboarding)
- [`docs/HANDOVER_AND_OPERATIONS.md`](./docs/HANDOVER_AND_OPERATIONS.md) — Full setup, clean recreation, cost, failure recovery, and secret rotation guide
- [`docs/BOLT_PROMPTS.md`](./docs/BOLT_PROMPTS.md) — Exact `bolt.diy` prompts for Version 1 and Version 2
- [`docs/TEST_LOG_T1_T8.md`](./docs/TEST_LOG_T1_T8.md) — Objective Developer PASS/FAIL test log and evidence (T1–T8)
- [`.env.example`](./.env.example) — Sanitized environment variable template

## Local Development and Verification
```bash
npm ci
npm run check
npm run build
```
