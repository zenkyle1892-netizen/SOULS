import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { HeartPulse, Users, Building2, Sparkles, ArrowUpRight, BarChart3 } from "lucide-react";

const WELLBEING = [
  { h: "Academic pressure", p: "Pressure isn't the enemy — untreated pressure is. Learn to recognize it early and rest before it becomes burnout." },
  { h: "Adjustment to college", p: "Homesickness, imposter syndrome, and social fatigue are all normal in the first months. It doesn't mean you don't belong here." },
  { h: "Burnout", p: "Signs: chronic tiredness, cynicism, feeling ineffective. Fix: sleep first, boundaries second, help third." },
  { h: "Rest and recovery", p: "Rest is part of studying, not the opposite of it. Schedule it like a subject." },
  { h: "Healthy study habits", p: "Short focused blocks, movement between sessions, and one full offline day a week if you can afford it." },
  { h: "Asking for help", p: "Asking early is a skill, not a weakness. The students who ask often are the ones who stay." },
];

const OFFICES = [
  { title: "Guidance & Counseling", body: "For personal, emotional, and adjustment concerns. Confidential.", contact: "Contact info — placeholder" },
  { title: "Student Affairs", body: "Student services, activities, and org concerns.", contact: "Contact info — placeholder" },
  { title: "Academic Office / Registrar", body: "Enrollment, grades, official documents.", contact: "Contact info — placeholder" },
  { title: "MLS Department", body: "Program-level concerns, subject issues, faculty coordination.", contact: "Contact info — placeholder" },
  { title: "Clinic / Health Services", body: "Medical concerns and check-ups on campus.", contact: "Contact info — placeholder" },
];

export default function Support() {
  const [settings, setSettings] = useState({ check_in_form_url: "", pulse_sheet_url: "" });
  useEffect(() => {
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden" data-testid="support-hero">
        <div className="absolute inset-0 grid-paper opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16 relative">
          <p className="overline mb-6" style={{ color: "var(--terracotta)" }}>
            § Chapter Three
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1] max-w-4xl">
            It's okay to <span className="italic text-terracotta">ask for help.</span>
          </h1>
          <p className="mt-6 text-lg text-inkMuted max-w-2xl leading-relaxed">
            Student Support is here to point you in the right direction — but
            it isn't a substitute for professional counseling. If you're in
            crisis, please reach a professional or the guidance office directly.
          </p>
        </div>
      </section>

      {/* Well-being */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="wellbeing-section">
        <div className="flex items-center gap-3 mb-10">
          <span className="w-10 h-10 rounded-full bg-sage-light border border-sage/30 flex items-center justify-center text-sage-dark">
            <HeartPulse strokeWidth={1.5} className="w-5 h-5" />
          </span>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-inkMuted">§ 01</p>
            <h2 className="font-serif text-3xl tracking-tight">Well-being</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WELLBEING.map((w, i) => (
            <div key={i} className="card-flat p-6" data-testid={`wellbeing-${i}`}>
              <h3 className="font-serif text-xl mb-2">{w.h}</h3>
              <p className="text-sm text-inkMuted leading-relaxed">{w.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Peer Support */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="peer-section">
        <div className="grid lg:grid-cols-12 gap-10 items-start border-t border-ink/10 pt-16">
          <div className="lg:col-span-4">
            <span className="w-10 h-10 rounded-full bg-sage-light border border-sage/30 flex items-center justify-center text-sage-dark mb-4">
              <Users strokeWidth={1.5} className="w-5 h-5" />
            </span>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-inkMuted">§ 02</p>
            <h2 className="font-serif text-3xl tracking-tight">Peer Support</h2>
          </div>
          <div className="lg:col-span-8 text-inkMuted text-base leading-relaxed max-w-2xl">
            <p>
              Sometimes, knowing that someone else has experienced the same
              challenges can make things feel less overwhelming. MLS Compass
              provides student-to-student guidance while directing serious
              concerns toward appropriate professional support.
            </p>
            <p className="mt-4">
              If your peers can't help, that's okay too — the offices below can.
            </p>
          </div>
        </div>
      </section>

      {/* Official Support */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="offices-section">
        <div className="flex items-center gap-3 mb-10">
          <span className="w-10 h-10 rounded-full bg-terracotta-light border border-terracotta/30 flex items-center justify-center text-terracotta-dark">
            <Building2 strokeWidth={1.5} className="w-5 h-5" />
          </span>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-inkMuted">§ 03</p>
            <h2 className="font-serif text-3xl tracking-tight">Official Support</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {OFFICES.map((o, i) => (
            <div key={i} className="card-flat p-6 flex flex-col justify-between" data-testid={`office-${i}`}>
              <div>
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 border border-terracotta/30 rounded-full text-terracotta-dark bg-terracotta-light">
                  Official
                </span>
                <h3 className="font-serif text-xl mt-3 mb-2">{o.title}</h3>
                <p className="text-sm text-inkMuted leading-relaxed">{o.body}</p>
              </div>
              <p className="mt-6 font-mono text-xs text-inkMuted">{o.contact}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Are We Okay? */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="check-in-section">
        <div className="relative overflow-hidden rounded-3xl border border-terracotta/30 bg-terracotta-light/60 p-8 md:p-14">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full border border-terracotta/30" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full border border-terracotta/20" />
          <div className="relative">
            <span className="w-11 h-11 rounded-full bg-white border border-terracotta/30 flex items-center justify-center text-terracotta-dark mb-6">
              <Sparkles strokeWidth={1.5} className="w-5 h-5" />
            </span>
            <p className="font-mono text-[10px] tracking-[0.24em] uppercase text-terracotta-dark mb-3">
              Anonymous check-in
            </p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl">
              Are we <span className="italic">okay?</span>
            </h2>
            <p className="mt-4 text-inkMuted max-w-2xl leading-relaxed">
              A short, anonymous check-in so student representatives know how
              the batch is really doing. It takes under two minutes and helps
              us respond earlier when several people are struggling.
            </p>

            <div className="mt-8 grid md:grid-cols-3 gap-3 max-w-2xl">
              <div className="bg-white/70 rounded-2xl p-4 border border-ink/10">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-sage mr-2" />
                <span className="text-sm">Doing okay</span>
              </div>
              <div className="bg-white/70 rounded-2xl p-4 border border-ink/10">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 mr-2" />
                <span className="text-sm">Struggling a little</span>
              </div>
              <div className="bg-white/70 rounded-2xl p-4 border border-ink/10">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-terracotta mr-2" />
                <span className="text-sm">Struggling significantly</span>
              </div>
            </div>

            <div className="mt-8">
              <a
                href={settings.check_in_form_url || "#"}
                target={settings.check_in_form_url ? "_blank" : undefined}
                rel="noreferrer"
                data-testid="check-in-cta"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm tracking-wide bg-ink text-paper hover:bg-black transition-colors"
              >
                Take the check-in
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />
              </a>
              <p className="mt-4 text-xs text-inkMuted max-w-xl">
                The check-in is meant to identify student concerns — it is <em>not</em> a diagnostic tool
                or an emergency service.
              </p>
            </div>

            {/* Google form embed */}
            <div className="mt-8 rounded-xl overflow-hidden border border-ink/10 bg-white/80">
              {settings.check_in_form_url ? (
                <>
                  <div className="px-4 py-2.5 bg-terracotta-light/60 border-b border-ink/5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                    <p className="text-xs font-mono tracking-wide text-terracotta-dark">
                      Sign in with your <strong>@spcdavao.edu.ph</strong> account to submit — responses stay anonymous within the form.
                    </p>
                  </div>
                  <iframe
                    title="Are We Okay check-in form"
                    src={settings.check_in_form_url}
                    className="w-full"
                    style={{ height: 900, border: 0 }}
                    data-testid="check-in-iframe"
                  >
                    Loading…
                  </iframe>
                </>
              ) : (
                <div className="p-4">
                  <div className="aspect-[4/3] md:aspect-[16/7] w-full border border-dashed border-ink/20 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-inkMuted">Google Form Embed</p>
                      <p className="mt-2 text-sm text-inkMuted max-w-xs">
                        Add the check-in form URL from the admin panel (Settings → Check-in Form).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Batch Pulse */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24" data-testid="batch-pulse-section">
        <div className="border-t border-ink/10 pt-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-10 h-10 rounded-full bg-sage-light border border-sage/30 flex items-center justify-center text-sage-dark">
              <BarChart3 strokeWidth={1.5} className="w-5 h-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-inkMuted">§ 04</p>
              <h2 className="font-serif text-3xl tracking-tight">Batch Pulse</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-[2fr_1fr] gap-6 items-start">
            <div className="card-flat p-4">
              {settings.pulse_sheet_url ? (
                <iframe
                  title="Batch Pulse Google Sheet"
                  src={settings.pulse_sheet_url}
                  className="w-full rounded-md"
                  style={{ height: 500, border: 0 }}
                  data-testid="pulse-sheet-iframe"
                >
                  Loading…
                </iframe>
              ) : (
                <div className="border border-dashed border-ink/20 rounded-xl p-8 min-h-[300px] flex items-center justify-center">
                  <div className="text-center max-w-sm">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-inkMuted mb-2">Google Sheet / Data Studio</p>
                    <p className="text-sm text-inkMuted">
                      Paste your published Google Sheet or Looker Studio link in
                      admin → Settings → Pulse Sheet URL to display the batch's
                      check-in results here.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="text-sm text-inkMuted leading-relaxed">
              <p className="font-serif text-lg text-ink mb-3">Why we show this.</p>
              <p>
                Making the batch's pulse visible (anonymously) helps reps notice
                when several people are struggling around the same time — before
                anyone has to ask for help alone.
              </p>
              {settings.pulse_sheet_url && (
                <a
                  href={settings.pulse_sheet_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sage hover:text-sage-dark"
                  data-testid="pulse-external-link"
                >
                  Open full sheet
                  <ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
