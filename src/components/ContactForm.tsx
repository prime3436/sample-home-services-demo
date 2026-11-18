import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  generateRequestId,
  submitContactInquiry,
  validateContactInput,
  type ValidationErrors,
} from "@/lib/contact";

interface ContactFormProps {
  submitLabel?: string;
  endpointUrl?: string;
}

export function ContactForm({
  submitLabel = "Contact Us",
  endpointUrl,
}: ContactFormProps) {
  const [requestId, setRequestId] = useState<string>(() => generateRequestId());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const payload = {
      request_id: requestId,
      name,
      email,
      message,
      website,
    };

    const validation = validateContactInput(payload);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const result = await submitContactInquiry(payload, endpointUrl);
    setIsSubmitting(false);

    if (result.ok && result.status === "received") {
      setConfirmedId(result.request_id);
      setSubmitError(null);
      return;
    }

    setConfirmedId(null);
    setSubmitError(
      result.error ??
        "Submission could not be stored. Your request ID is preserved for retry."
    );
  }

  function handleReset() {
    setName("");
    setEmail("");
    setMessage("");
    setWebsite("");
    setErrors({});
    setConfirmedId(null);
    setSubmitError(null);
    setRequestId(generateRequestId());
  }

  if (confirmedId) {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <CardTitle className="text-xl">Inquiry Received</CardTitle>
          </div>
          <CardDescription>
            Your demonstration inquiry has been validated and stored.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="font-medium text-slate-700">Recorded Request ID</div>
            <div
              data-testid="confirmed-request-id"
              className="mt-1 break-all font-mono text-xs text-slate-900"
            >
              {confirmedId}
            </div>
          </div>
          <Button type="button" variant="outline" onClick={handleReset}>
            Submit Another Inquiry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">
          Service Inquiry Form
        </CardTitle>
        <CardDescription>
          Send a test inquiry through the intake pipeline. All fields are
          validated before storage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="contact-name">Name</Label>
              <span className="text-xs text-muted-foreground">2–80 chars</span>
            </div>
            <Input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p
                id="contact-name-error"
                role="alert"
                className="text-sm font-medium text-destructive"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="contact-email">Email</Label>
              <span className="text-xs text-muted-foreground">Max 254 chars</span>
            </div>
            <Input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="alex.rivera@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "contact-email-error" : undefined
              }
              disabled={isSubmitting}
            />
            {errors.email && (
              <p
                id="contact-email-error"
                role="alert"
                className="text-sm font-medium text-destructive"
              >
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="contact-message">Message</Label>
              <span className="text-xs text-muted-foreground">
                10–1000 chars ({message.trim().length}/1000)
              </span>
            </div>
            <Textarea
              id="contact-message"
              name="message"
              rows={4}
              placeholder="Describe the repair, assembly, or maintenance task you want to test."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message ? "contact-message-error" : undefined
              }
              disabled={isSubmitting}
            />
            {errors.message && (
              <p
                id="contact-message-error"
                role="alert"
                className="text-sm font-medium text-destructive"
              >
                {errors.message}
              </p>
            )}
          </div>

          <div className="hidden" aria-hidden="true">
            <Label htmlFor="contact-website">Website</Label>
            <Input
              id="contact-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {errors.form && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {submitError && (
            <div
              role="alert"
              data-testid="submission-error"
              className="space-y-1.5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              <div className="flex items-start gap-2 font-medium">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
              <div className="font-mono text-xs text-red-700">
                Active Request ID: {requestId}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <span
              data-testid="active-request-id"
              className="font-mono text-xs text-muted-foreground"
            >
              Request ID: {requestId}
            </span>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
