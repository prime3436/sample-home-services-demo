# bolt.diy Prompts Used for Code Generation

## Environment Configuration
- Builder: `stackblitz-labs/bolt.diy` (open-source local instance)
- Model Provider: Google Gemini (`gemini-2.5-pro`)
- Target Stack: React 18 + TypeScript + Vite, Tailwind CSS + shadcn/ui
- Vite Base Path: `/sample-home-services-demo/`

## Version 1 Prompt (Release A)
```text
Create a responsive single-page demonstration website titled "Sample Home Services — Demo" using React, TypeScript, Vite (with base="/sample-home-services-demo/"), Tailwind CSS, and shadcn/ui components (Card, Button, Input, Textarea, Label, Badge). Do not include any chatbot or assistant-ui components.

Include:
1. A visible banner and notice displaying the exact text: "Demonstration only — no services offered".
2. A hero section introducing Sample Home Services — Demo.
3. Three service cards titled "Small Repairs", "Furniture Assembly", and "Home Maintenance" with practical residential scope descriptions.
4. A working contact inquiry form with Name, Email, Message, an invisible "website" honeypot input, and a submit button labeled "Contact Us".
5. Client-side and payload validation enforcing: request_id as a valid UUID, name 2–80 characters, email up to 254 characters with valid format, message 10–1000 characters, website equal to "", and total JSON request size <= 4096 bytes.
6. Form submission via POST to VITE_CONTACT_ENDPOINT_URL (defaulting to /functions/v1/contact-submit). Show confirmed state only when the response is HTTP 200 and returns explicit JSON { request_id, status: "received" }. Preserve the exact client request_id across failed attempts so retries are idempotent.
```

## Version 2 Prompt (Release B)
Exact natural-language instruction required by Section 4 of the SOW:

```text
Add a Weekend Appointments callout above the contact form and change the submit button to Request a Callback; keep the form operational.
```
