# Operator Quick Start (30-Minute Verification Guide)

Follow these 9 steps to open the public site, submit a live test inquiry, and verify durable storage in Windmill and Supabase PostgreSQL without developer assistance.

1. **Open the live website**
   Navigate to `https://prime3436.github.io/sample-home-services-demo/` on desktop or mobile and confirm the page title **Sample Home Services — Demo**, the notice **Demonstration only — no services offered**, the three service cards (**Small Repairs**, **Furniture Assembly**, **Home Maintenance**), and the **Weekend Appointments** callout above the form.

2. **Note the active Request ID**
   Scroll to the **Service Inquiry Form**. Copy the UUID displayed next to `Request ID:` above the **Request a Callback** button.

3. **Test validation rejection (T4 check)**
   Click **Request a Callback** with blank fields. Confirm that clear validation messages appear for Name, Email, and Message and no network submission is sent.

4. **Submit a live test inquiry (T3 / T6 check)**
   Fill in harmless test values:
   - **Name**: `SAFI Verification Operator`
   - **Email**: `operator.verify@example.com`
   - **Message**: `Verifying end-to-end contact intake flow through Supabase Edge Function and Windmill.`
   Click **Request a Callback**.

5. **Confirm browser receipt**
   Verify that the form transitions to **Inquiry Received** and displays the exact `Recorded Request ID` matching the UUID from Step 2.

6. **Verify the Windmill execution run**
   Open the Windmill workspace dashboard (`https://app.windmill.dev`, workspace `prime3437`), navigate to **Runs**, filter by path `u/patibandla/contact_intake`, and open the latest run. Confirm the output payload is:
   ```json
   {
     "stored": true,
     "request_id": "<your-request-id>"
   }
   ```

7. **Verify the stored row in Supabase PostgreSQL**
   Open the Supabase Project Dashboard (`https://supabase.com/dashboard/project/zuhjpdhxjhysrzyjtbhv/editor`), open **`contact_submissions`** (or run `SELECT request_id, name, email, message, created_at FROM public.contact_submissions WHERE request_id = '<your-request-id>';` in **SQL Editor**), and confirm that exactly one row exists with matching fields and timestamp.

8. **Verify RLS protection against anonymous access (T5 check)**
   Run the following command in a terminal and verify that unauthenticated/anonymous direct table read is denied:
   ```bash
   curl -i "https://zuhjpdhxjhysrzyjtbhv.supabase.co/rest/v1/contact_submissions?select=*"
   ```

9. **Verify duplicate request safety (T7 check)**
   Re-send the same `request_id` to `POST https://zuhjpdhxjhysrzyjtbhv.supabase.co/functions/v1/contact-submit` and confirm the response is `{"request_id":"<your-request-id>","status":"received"}` while `SELECT count(*) FROM public.contact_submissions WHERE request_id = '<your-request-id>';` in Supabase still equals `1`.
