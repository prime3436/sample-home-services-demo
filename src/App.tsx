import {
  Wrench,
  PackageCheck,
  ShieldCheck,
  Info,
  CalendarClock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContactForm } from "@/components/ContactForm";

const SERVICES = [
  {
    title: "Small Repairs",
    icon: Wrench,
    summary:
      "Fixture replacements, drywall patching, door alignment, and hardware adjustments.",
    details: [
      "Cabinet hinges, locks, and interior door latches",
      "Drywall anchors, patching, and trim touch-ups",
      "Faucet aerators, caulking, and weatherstripping",
    ],
  },
  {
    title: "Furniture Assembly",
    icon: PackageCheck,
    summary:
      "Flat-pack residential and home-office furniture assembly with anchoring where required.",
    details: [
      "Desks, shelving units, wardrobes, and bed frames",
      "Leveling, hardware torque check, and wall anchoring",
      "Multi-piece modular storage and dining sets",
    ],
  },
  {
    title: "Home Maintenance",
    icon: ShieldCheck,
    summary:
      "Routine seasonal upkeep checks to keep residential fixtures and fittings in working order.",
    details: [
      "Filter replacements, smoke detector battery checks",
      "Grout sealing, exterior door sweep installation",
      "Preventive hardware and safety fixture inspection",
    ],
  },
] as const;

export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-900">
      <div
        role="region"
        aria-label="Demonstration notice"
        className="border-b border-amber-300/80 bg-amber-50 px-4 py-2.5 text-amber-950"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 text-center text-xs font-semibold tracking-wide sm:text-sm">
          <Info className="h-4 w-4 shrink-0 text-amber-800" />
          <span>Demonstration only — no services offered</span>
        </div>
      </div>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white">
              SHS
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-slate-900">
                Sample Home Services — Demo
              </p>
              <p className="text-xs text-slate-500">
                WEB-001 Reference Intake Pilot
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-slate-900">
              Services
            </a>
            <a href="#contact" className="hover:text-slate-900">
              Contact Form
            </a>
            <Badge variant="secondary" className="font-mono text-xs">
              Demonstration only — no services offered
            </Badge>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="max-w-3xl space-y-5">
              <Badge
                variant="outline"
                className="border-slate-300 text-slate-700"
              >
                Residential Repair & Upkeep Demo
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Sample Home Services — Demo
              </h1>
              <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                Practical residential repairs, flat-pack assembly, and scheduled
                home maintenance showcased in a single-page operational pilot.
                Submit the inquiry form below to verify end-to-end intake
                validation and persistence.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#contact"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Open Inquiry Form
                </a>
                <a
                  href="#services"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  View Service Scope
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16"
        >
          <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Core Service Categories
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Three reference categories demonstrated in this pilot release.
              </p>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Demonstration only — no services offered
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <Card
                  key={service.title}
                  className="flex flex-col border-slate-200 bg-white"
                >
                  <CardHeader>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg text-slate-900">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-slate-600">
                      {service.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <ul className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                      {service.details.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section
          id="contact"
          className="border-t border-slate-200 bg-slate-100/70 py-12 sm:py-16"
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Submit a Service Inquiry
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Submissions route through a public Supabase Edge Function and an
                authenticated Windmill flow before durable storage in
                PostgreSQL.
              </p>
            </div>

            <div
              data-testid="weekend-appointments-callout"
              className="mb-6 rounded-lg border border-slate-300 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Weekend Appointments
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Saturday and Sunday demonstration slots (8:00 AM – 4:00
                      PM) can be requested using the inquiry form below. Mention
                      your preferred weekend window in the message field.
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit shrink-0">
                  Sat & Sun Windows
                </Badge>
              </div>
            </div>

            <ContactForm submitLabel="Request a Callback" />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6">
          <span>Sample Home Services — Demo</span>
          <span className="font-medium text-slate-700">
            Demonstration only — no services offered
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
