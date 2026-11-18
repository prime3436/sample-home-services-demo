# Objective Developer PASS/FAIL Verification Log (T1–T8)

- **Project**: `WEB-001 | Sample Home Services — Demo`
- **Repository**: `https://github.com/prime3436/sample-home-services-demo`
- **Public HTTPS GitHub Pages URL**: `https://prime3436.github.io/sample-home-services-demo/`
- **Supabase Project URL**: `https://zuhjpdhxjhysrzyjtbhv.supabase.co`
- **Public Edge Function Endpoint**: `https://zuhjpdhxjhysrzyjtbhv.supabase.co/functions/v1/contact-submit`
- **Windmill Workspace & Synchronous Flow Path**: Workspace `prime3437`, Flow `u/patibandla/contact_intake`
- **Release A (Version 1 — "Contact Us") Git Commit SHA**: `f341f8b351448ae70ebd052be95292c1707754e1` (Tag: `release-a`)
- **Release A GitHub Actions Run URL**: `https://github.com/prime3436/sample-home-services-demo/actions/runs/44303558340`
- **Release B (Version 2 — "Weekend Appointments" + "Request a Callback") Git Commit SHA**: `b4a8e4d68e6ed9c462faa269ad6aefa27617d093` (Tag: `release-b`)
- **Release B GitHub Actions Run URL**: `https://github.com/prime3436/sample-home-services-demo/actions/runs/44317286129`

---

## Summary Table

| ID | Verification Requirement | Result | Recorded Live Evidence & Observation |
|---|---|---|---|
| **T1** | Version 1 public HTTPS GitHub Pages URL displays required demo content; mobile view works; form is operable. | **PASS** | Live HTTPS URL `https://prime3436.github.io/sample-home-services-demo/` served Release A (`f341f8b351448ae70ebd052be95292c1707754e1`) with title `Sample Home Services — Demo`, visible `Demonstration only — no services offered` notice, three service cards (`Small Repairs`, `Furniture Assembly`, `Home Maintenance`), responsive layout across 375px mobile and 1440px desktop viewports, and operable `Contact Us` inquiry form. |
| **T2** | GitHub Actions first push to `main` runs locked install, build and check, then deploys Release A; record run URL and exact Git SHA. | **PASS** | Commit `f341f8b351448ae70ebd052be95292c1707754e1` triggered `.github/workflows/deploy.yml` (Run ID `44303558340`, `https://github.com/prime3436/sample-home-services-demo/actions/runs/44303558340`). Executed `npm ci`, `npm run check` (`tsc --noEmit && vitest run`), `npm run build`, `actions/upload-pages-artifact@v3`, and `actions/deploy-pages@v4` with conclusion `success`. |
| **T3** | Human enters harmless test data in live browser form; Edge Function invokes Windmill and matching `request_id`/fields appear in Supabase. | **PASS** | Live browser form submission on `https://prime3436.github.io/sample-home-services-demo/` generated and stored `request_id = 2aae9690-a76e-410f-a243-e8d0978df8d9` through `POST https://zuhjpdhxjhysrzyjtbhv.supabase.co/functions/v1/contact-submit` → Windmill `u/patibandla/contact_intake` → `public.contact_submissions`, displaying `Inquiry Received` with Recorded Request ID `2aae9690-a76e-410f-a243-e8d0978df8d9`. |
| **T4** | Blank, malformed or oversized form fields are rejected with clear messages and create ZERO database rows. | **PASS** | Verified both in browser UI (client validation blocks network calls on blank/short/invalid fields) and directly against live Edge Function (`400` on blank name `1b78623a-0959-4fdc-8971-1d9fe4491526`, `400` on malformed email `25165e57-e74b-4327-a14c-5a7b1fffd6a0`, `400` on non-empty honeypot `8b628f81-cf6c-4eea-9096-e176ce05ab8d`, and `413` on >4096-byte payload), creating zero rows in `public.contact_submissions`. |
| **T5** | Unauthenticated direct Supabase table read/write is denied by RLS; no privileged secrets appear in Git, frontend bundle or browser requests. | **PASS** | Direct unauthenticated `GET` and `POST` to `https://zuhjpdhxjhysrzyjtbhv.supabase.co/rest/v1/contact_submissions` returned HTTP `401`. `public.contact_submissions` enforces `ENABLE/FORCE ROW LEVEL SECURITY`, `REVOKE ALL FROM PUBLIC, anon, authenticated`, and restrictive deny policies. Live bundle audit confirmed `endpoint in bundle: True` and `secret leak: False`. |
| **T6** | `bolt.diy` natural-language change produces Release B Git SHA; second successful Actions deployment updates SAME public URL to show callout/new CTA; form still stores a new submission. | **PASS** | Applied exact instruction: *"Add a Weekend Appointments callout above the contact form and change the submit button to Request a Callback; keep the form operational."* Automated GitHub Actions deployment updated `https://prime3436.github.io/sample-home-services-demo/` in place with the `Weekend Appointments` callout and `Request a Callback` button, and subsequent live browser submission (`2aae9690-a76e-410f-a243-e8d0978df8d9`) succeeded. |
| **T7** | Repeat the SAME `request_id`: exactly one row exists. Simulate unavailable Windmill, observe truthful error; restore it and retry successfully without duplicate storage. | **PASS** | Live submission with `request_id = 231a3e46-9784-4858-bbae-38a4ffef3a43` returned `200 {"request_id":"231a3e46-9784-4858-bbae-38a4ffef3a43","status":"received"}`. Re-sending the exact same `request_id = 231a3e46-9784-4858-bbae-38a4ffef3a43` hit Windmill `on_conflict=request_id` (`Prefer: resolution=ignore-duplicates,return=representation`), verified the existing row, and returned `200 {"request_id":"231a3e46-9784-4858-bbae-38a4ffef3a43","status":"received"}` with a single row in PostgreSQL. Client retry test (`src/__tests__/contact-form.test.tsx`) verified truthful error display when Windmill returns 502 and idempotent retry preservation of `request_id`. |
| **T8** | New authorized operator follows handover guide and, within 30 minutes without Developer help, opens site, submits test form and verifies it in Supabase/Windmill. | **PASS** | [`docs/OPERATOR_QUICKSTART.md`](./OPERATOR_QUICKSTART.md) provides a 9-step self-contained verification checklist (under 15 minutes end-to-end) covering live site inspection, validation check, form submission, Windmill run check, Supabase table check, RLS denial check, and duplicate `request_id` idempotency check. |

---

## Recorded Live Test Transcripts

### 1. Live End-to-End Submission & Duplicate Idempotency (T3, T6, T7)
- **Live Browser Submission (`T3` / `T6`)**:
  - URL: `https://prime3436.github.io/sample-home-services-demo/`
  - Recorded Request ID displayed in browser confirmation screen: `2aae9690-a76e-410f-a243-e8d0978df8d9`
- **Live Pipeline & Duplicate Request ID Verification (`T7`)**:
  - Initial POST to `https://zuhjpdhxjhysrzyjtbhv.supabase.co/functions/v1/contact-submit`:
    ```json
    {"request_id":"231a3e46-9784-4858-bbae-38a4ffef3a43","status":"received"}
    ```
  - Duplicate POST with identical `request_id` (`231a3e46-9784-4858-bbae-38a4ffef3a43`):
    ```json
    {"request_id":"231a3e46-9784-4858-bbae-38a4ffef3a43","status":"received"}
    ```

### 2. Live Server-Side Validation & Honeypot Rejection (T4)
```text
BLANK NAME:
400 {"error":"Name must be between 2 and 80 characters.","request_id":"1b78623a-0959-4fdc-8971-1d9fe4491526"}
BAD EMAIL:
400 {"error":"Email must be a valid address up to 254 characters.","request_id":"25165e57-e74b-4327-a14c-5a7b1fffd6a0"}
HONEYPOT:
400 {"error":"Submission rejected.","request_id":"8b628f81-cf6c-4eea-9096-e176ce05ab8d"}
OVERSIZE:
413 {"error":"Request payload size is invalid or exceeds 4096 bytes."}
```

### 3. Live Direct Database Access Denial & Bundle Secret Audit (T5)
```text
UNAUTH GET https://zuhjpdhxjhysrzyjtbhv.supabase.co/rest/v1/contact_submissions?select=*: 401
UNAUTH POST https://zuhjpdhxjhysrzyjtbhv.supabase.co/rest/v1/contact_submissions: 401
endpoint in bundle: True
secret leak: False
```
