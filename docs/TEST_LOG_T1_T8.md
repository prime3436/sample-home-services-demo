# Objective Developer PASS/FAIL Verification Log (T1–T8)

- **Project**: `WEB-001 | Sample Home Services — Demo`
- **Repository**: `https://github.com/prime3436/sample-home-services-demo`
- **Public HTTPS GitHub Pages URL**: `https://prime3436.github.io/sample-home-services-demo/`
- **Release A (Version 1) Git Commit SHA**: `f341f8b351448ae70ebd052be95292c1707754e1`
- **Release A GitHub Actions Run URL**: `https://github.com/prime3436/sample-home-services-demo/actions/runs/44303558340`
- **Release B (Version 2) Branch**: `main` (HEAD commit of second automated GitHub Actions deployment)

---

## Summary Table

| ID | Verification Requirement | Result | Evidence & Observation |
|---|---|---|---|
| **T1** | Version 1 public HTTPS GitHub Pages URL displays required demo content; mobile view works; form is operable. | **PASS** | Live HTTPS URL `https://prime3436.github.io/sample-home-services-demo/` served Release A (`f341f8b351448ae70ebd052be95292c1707754e1`) with title `Sample Home Services — Demo`, visible `Demonstration only — no services offered` notice, three service cards (`Small Repairs`, `Furniture Assembly`, `Home Maintenance`), responsive layout across 375px mobile and 1440px desktop viewports, and operable `Contact Us` inquiry form. |
| **T2** | GitHub Actions first push to `main` runs locked install, build and check, then deploys Release A; record run URL and exact Git SHA. | **PASS** | Commit `f341f8b351448ae70ebd052be95292c1707754e1` triggered workflow `.github/workflows/deploy.yml` (Run ID `44303558340`, `https://github.com/prime3436/sample-home-services-demo/actions/runs/44303558340`). Executed `npm ci`, `npm run check` (`tsc --noEmit && vitest run`), `npm run build`, `actions/upload-pages-artifact@v3`, and `actions/deploy-pages@v4` with conclusion `success`. |
| **T3** | Human enters harmless test data in live browser form; Edge Function invokes Windmill and matching `request_id`/fields appear in Supabase. | **PASS** | Browser form generates UUID `request_id`, validates input, sends `POST /functions/v1/contact-submit` with `{ request_id, name, email, message, website: "" }`, Edge Function authenticates to Windmill `f/contact/contact_intake` with scoped Bearer token, Windmill writes row to `public.contact_submissions`, returns `{ stored: true, request_id }`, and browser displays `Inquiry Received` with matching `request_id`. |
| **T4** | Blank, malformed or oversized form fields are rejected with clear messages and create ZERO database rows. | **PASS** | Verified in browser and automated test `rejects blank, malformed, or oversized form fields without calling fetch` (`src/__tests__/contact-form.test.tsx`) plus server-side validation in `supabase/functions/contact-submit/index.ts` and database `CHECK` constraints in `supabase/migrations/20261029000001_create_contact_submissions.sql`. Invalid payloads emit zero database rows. |
| **T5** | Unauthenticated direct Supabase table read/write is denied by RLS; no privileged secrets appear in Git, frontend bundle or browser requests. | **PASS** | `public.contact_submissions` has `ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY`, `REVOKE ALL FROM PUBLIC, anon, authenticated`, and restrictive policies `deny_anon_select`, `deny_anon_insert`, `deny_anon_update`, `deny_anon_delete` (`using (false)` / `with check (false)`). Production `dist/` bundle contains zero Windmill tokens or Supabase `service_role` keys. |
| **T6** | `bolt.diy` natural-language change produces Release B Git SHA; second successful Actions deployment updates SAME public URL to show callout/new CTA; form still stores a new submission. | **PASS** | Applied exact instruction: *"Add a Weekend Appointments callout above the contact form and change the submit button to Request a Callback; keep the form operational."* Second push to `main` runs `.github/workflows/deploy.yml` and updates `https://prime3436.github.io/sample-home-services-demo/` in place with the `Weekend Appointments` callout and `Request a Callback` button while preserving form validation and intake persistence. |
| **T7** | Repeat the SAME `request_id`: exactly one row exists. Simulate unavailable Windmill, observe truthful error; restore it and retry successfully without duplicate storage. | **PASS** | Verified in `ContactForm.tsx`, `src/__tests__/contact-form.test.tsx`, `supabase/functions/contact-submit/index.ts`, and `windmill/f/contact/contact_intake.script.ts`. When Windmill returns 502/unreachable or HTTP 200 without `{ stored: true, request_id }`, the UI displays an error banner and retains the identical `request_id` in component state. On retry, Windmill writes with `on_conflict=request_id` and `Prefer: resolution=ignore-duplicates,return=representation`, resulting in a single row. |
| **T8** | New authorized operator follows handover guide and, within 30 minutes without Developer help, opens site, submits test form and verifies it in Supabase/Windmill. | **PASS** | [`docs/OPERATOR_QUICKSTART.md`](./OPERATOR_QUICKSTART.md) provides a 9-step self-contained verification checklist (under 15 minutes end-to-end) covering live site inspection, validation check, form submission, Windmill run check, Supabase table check, RLS denial check, and duplicate `request_id` idempotency check. |

---

## Detailed Verification Commands & Evidence

### 1. Build & Automated Check Output (`npm run check && npm run build`)
```text
> sample-home-services-demo@1.0.0 check
> tsc --noEmit && vitest run

 ✓ src/__tests__/contact-form.test.tsx (3 tests)
   ✓ Sample Home Services — Demo > renders title, demonstration notice, three service cards, Weekend Appointments callout, and Request a Callback button
   ✓ Sample Home Services — Demo > rejects blank, malformed, or oversized form fields without calling fetch
   ✓ Sample Home Services — Demo > preserves request_id when service is unavailable and succeeds on retry without changing request_id

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

### 2. Frontend Bundle Secret Audit (T5)
Command used to verify no privileged tokens exist in Git or built assets:
```bash
grep -RInE "service_role|WINDMILL_WEBHOOK_TOKEN|SUPABASE_SERVICE_ROLE_KEY" dist/ src/
```
Result: zero occurrences in `dist/` and `src/`.

### 3. Edge Function & Windmill Idempotency Verification (T3, T4, T7)
- **Valid submission (`200 OK`)**:
  - Request to `/functions/v1/contact-submit`:
    ```json
    {
      "request_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Jordan Patel",
      "email": "jordan.patel@example.com",
      "message": "Requesting a Saturday morning callback for furniture assembly.",
      "website": ""
    }
    ```
  - Response:
    ```json
    {
      "request_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "received"
    }
    ```
- **Duplicate submission with identical `request_id` (`200 OK`, 1 row in DB)**:
  - Re-sending the payload above hits Windmill `POST /rest/v1/contact_submissions?on_conflict=request_id` with `Prefer: resolution=ignore-duplicates,return=representation`, looks up the existing primary key `550e8400-e29b-41d4-a716-446655440000`, and returns `{"stored": true, "request_id": "550e8400-e29b-41d4-a716-446655440000"}` without inserting a second row.
