# Handover, Recreation, Recovery, and Credential Rotation Guide

## 1. System Architecture and Request Chain

```text
Browser (GitHub Pages HTTPS)
  │  POST /functions/v1/contact-submit
  │  JSON: { request_id, name, email, message, website: "" }
  ▼
Supabase Edge Function (contact-submit, verify_jwt = false)
  │  Validates payload sizes, field lengths, email format, UUID, honeypot
  │  POST with scoped Authorization: Bearer <WINDMILL_WEBHOOK_TOKEN>
  ▼
Windmill Synchronous Flow (f/contact/contact_intake)
  │  Uses server-side SUPABASE_SERVICE_ROLE_KEY stored in Windmill variables
  │  POST /rest/v1/contact_submissions?on_conflict=request_id
  │  Prefer: resolution=ignore-duplicates,return=representation
  ▼
Supabase PostgreSQL (public.contact_submissions, RLS enabled & forced)
```

No browser code ever calls Windmill or Supabase PostgreSQL directly. All privileged tokens live strictly in Supabase Edge Function secrets and Windmill workspace variables.

---

## 2. Environment Ownership and Cost Breakdown

All accounts are Developer-owned test accounts with zero dependency on SAFI infrastructure or other Freshers' SOWs:

| Component | Provider | Tier / Plan | Monthly Cost | Ownership & Transfer Method |
|---|---|---|---|---|
| Source & CI/CD | GitHub (`prime3436/sample-home-services-demo`) | Free Public Repo + GitHub Pages | $0.00 | Transfer repository ownership or add SAFI reviewer as Admin collaborator |
| AI Website Builder | Open-source `stackblitz-labs/bolt.diy` + Gemini API | Local open-source runtime + Developer API key | <$0.50 total | Prompts and generated source committed to Git; no runtime dependency |
| Database & Edge Function | Supabase (PostgreSQL + Deno Edge Runtime) | Free / Pro Developer Tier | $0.00 | Invite SAFI operator email to Supabase Organization or recreate via SQL + CLI in <10 min |
| Workflow Orchestration | Windmill (`f/contact/contact_intake`) | Cloud Free Tier / Self-hosted Community | $0.00 | Exported Flow JSON (`windmill/f/contact/contact_intake.flow.json`) imports into any workspace in 2 minutes |

The operational pilot remains active for at least 72 hours after handover.

---

## 3. Clean Rebuild and Recreation Procedure (Rebuild Elsewhere Without Developer)

A SAFI engineer can rebuild the entire stack in a separate GitHub, Supabase, and Windmill account in under 20 minutes:

### Step A — Database & Edge Function (Supabase)
1. Create a new Supabase project and copy its `Project URL`, `Project Ref`, and `service_role` secret key.
2. Open the Supabase SQL Editor (or run `supabase db push`) and execute:
   - `supabase/migrations/20261029000001_create_contact_submissions.sql`
   - Verify RLS status using `supabase/sql/rls_verification_checks.sql`.
3. Deploy the Edge Function:
   ```bash
   supabase functions deploy contact-submit --no-verify-jwt --project-ref <project-ref>
   ```

### Step B — Windmill Synchronous Flow
1. In your Windmill workspace, create two secret variables at paths:
   - `f/contact/SUPABASE_URL` = `https://<project-ref>.supabase.co`
   - `f/contact/SUPABASE_SERVICE_ROLE_KEY` = `<supabase-service-role-key>`
2. Import `windmill/f/contact/contact_intake.flow.json` at path `f/contact/contact_intake`.
3. Generate a flow-scoped webhook token for `f/contact/contact_intake` and copy the synchronous webhook URL:
   `https://app.windmill.dev/api/w/<workspace>/jobs/run_wait_result/f/f/contact/contact_intake`

### Step C — Wire Edge Function Secrets
Set the secrets on the Supabase Edge Function:
```bash
supabase secrets set \
  ALLOWED_ORIGIN="https://<github-username>.github.io" \
  WINDMILL_FLOW_WEBHOOK_URL="https://app.windmill.dev/api/w/<workspace>/jobs/run_wait_result/f/f/contact/contact_intake" \
  WINDMILL_WEBHOOK_TOKEN="<scoped-windmill-webhook-token>" \
  --project-ref <project-ref>
```

### Step D — GitHub Repository & Automated Pages Deployment
1. Push the repository to GitHub and update `base` in `vite.config.ts` if the repository name differs from `sample-home-services-demo`.
2. In GitHub **Settings → Secrets and variables → Actions → Variables**, add repository variable:
   - `VITE_CONTACT_ENDPOINT_URL` = `https://<project-ref>.supabase.co/functions/v1/contact-submit`
3. In GitHub **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**.
4. Trigger `.github/workflows/deploy.yml` via push to `main` or manual `workflow_dispatch`.

---

## 4. Failure Recovery and Duplicate Prevention

- **When Windmill or Supabase DB is unavailable**:
  - `contact-submit` catches upstream errors or non-confirmed payloads and returns HTTP `502` with `{"error": "...", "request_id": "<uuid>"}`.
  - The browser displays a clear error alert and **keeps the same `request_id` in component state**.
- **On recovery and retry**:
  - Clicking **Request a Callback** (or **Contact Us**) re-submits the exact same `request_id`.
  - Windmill executes `POST /rest/v1/contact_submissions?on_conflict=request_id` with `Prefer: resolution=ignore-duplicates,return=representation`.
  - If the first attempt had partially written before a timeout, PostgreSQL ignores the duplicate `request_id`, Windmill confirms the existing row by `request_id`, and returns `{"stored": true, "request_id": "<uuid>"}`. Exactly one row exists in `contact_submissions`.

---

## 5. Secret Rotation and Access Transfer Procedure

1. **Rotate Windmill Webhook Token**:
   - In Windmill, open flow `f/contact/contact_intake` → **Webhooks / Tokens**, create a new scoped token, update `WINDMILL_WEBHOOK_TOKEN` in Supabase Edge Function secrets (`supabase secrets set WINDMILL_WEBHOOK_TOKEN=...`), and revoke the old Windmill token.
2. **Rotate Supabase Service Role Key**:
   - In Supabase Dashboard → **Project Settings → API**, roll the `service_role` key, then immediately update variable `f/contact/SUPABASE_SERVICE_ROLE_KEY` in Windmill.
3. **Transfer Ownership to SAFI**:
   - Transfer GitHub repository or grant Admin role to the designated SAFI GitHub account.
   - Transfer Supabase project organization ownership and Windmill workspace admin role, then rotate both secrets above so the original developer no longer holds active tokens.
