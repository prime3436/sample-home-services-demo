# Sample Home Services — Demo (WEB-001)

Single-page demonstration website and validated contact intake pipeline built for **WEB-001 | AI-First End-to-End Website Development**.

> **Notice:** Demonstration only — no services offered.

## Live Deployment & Repository
- **Public HTTPS GitHub Pages URL**: `https://prime3436.github.io/sample-home-services-demo/`
- **GitHub Repository**: `https://github.com/prime3436/sample-home-services-demo`
- **Deployment Workflow**: `.github/workflows/deploy.yml` (automated GitHub Actions build, typecheck, Vitest check, and GitHub Pages deployment)

## Fixed Stack
- **AI Builder**: Open-source `stackblitz-labs/bolt.diy` (prompts recorded in [`docs/BOLT_PROMPTS.md`](./docs/BOLT_PROMPTS.md))
- **Frontend**: React 18 + TypeScript + Vite (`base: "/sample-home-services-demo/"`), Tailwind CSS, shadcn/ui
- **Intake Edge Function**: Supabase Edge Function (`supabase/functions/contact-submit/index.ts`, `verify_jwt = false`)
- **Workflow Orchestration**: Windmill synchronous flow `f/contact/contact_intake` (`windmill/f/contact/contact_intake.flow.json`)
- **Database**: Supabase PostgreSQL `public.contact_submissions` with RLS enabled and forced (`supabase/migrations/20261029000001_create_contact_submissions.sql`)

## Repository Layout
```text
sample-home-services-demo/
├── .env.example
├── .github/workflows/deploy.yml
├── components.json
├── docs/
│   ├── BOLT_PROMPTS.md
│   ├── HANDOVER_AND_OPERATIONS.md
│   ├── OPERATOR_QUICKSTART.md
│   └── TEST_LOG_T1_T8.md
├── index.html
├── package.json
├── supabase/
│   ├── config.toml
│   ├── functions/contact-submit/index.ts
│   ├── migrations/20261029000001_create_contact_submissions.sql
│   └── sql/rls_verification_checks.sql
├── windmill/
│   └── f/contact/
│       ├── contact_intake.flow.json
│       ├── contact_intake.flow/flow.yaml
│       └── contact_intake.script.ts
└── src/
    ├── App.tsx
    ├── __tests__/contact-form.test.tsx
    ├── components/
    │   ├── ContactForm.tsx
    │   └── ui/
    └── lib/
        ├── contact.ts
        └── utils.ts
```

## Local Development and Verification
```bash
npm ci
npm run check
npm run build
```
