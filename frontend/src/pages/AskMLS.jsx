import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowUpRight, MessageSquare, Quote as QuoteIcon, Star } from "lucide-react";

const CATEGORIES = [
  "Academic",
  "Laboratory",
  "Announcements",
  "Schedule / Requirements",
  "Student Concerns",
  "Well-being",
  "Suggestions",
  "General Question",
];

export default function AskMLS() {
  const [faqs, setFaqs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [settings, setSettings] = useState({ ask_form_url: "", contribution_form_url: "" });

  useEffect(() => {
    api.get("/faqs", { params: { page: "ask-mls" } }).then((r) => setFaqs(r.data));
    api.get("/quotes").then((r) => setQuotes(r.data));
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  // Compute hero (manual pin > 3-day auto-rotation)
  const heroQuote = (() => {
    if (quotes.length === 0) return null;
    const pinned = quotes.find((q) => q.is_featured);
    if (pinned) return { ...pinned, _autoRotated: false };
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 3));
    return { ...quotes[dayIndex % quotes.length], _autoRotated: true };
  })();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" data-testid="ask-hero">
        <div className="absolute inset-0 grid-paper opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16 relative">
          <p className="overline mb-6">§ Chapter Four</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1] max-w-4xl">
            Ask MLS. <span className="italic text-sage">No question is too small.</span>
          </h1>
          <p className="mt-6 text-lg text-inkMuted max-w-2xl leading-relaxed">
            Have a question, concern, or suggestion? You don't need to know
            exactly who to approach. Submit it here and the student
            representatives will help direct you toward the appropriate
            information or office.
          </p>

          {/* Featured quote hero (manual pin, or 3-day auto-rotation fallback) */}
          {heroQuote && (
            <div
              className="mt-14 relative bg-white border border-ink/10 rounded-3xl p-8 md:p-12 max-w-4xl grid md:grid-cols-[80px_1fr] gap-6 items-start"
              data-testid="featured-quote"
            >
              <div className="hidden md:flex flex-col items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-sage-light border border-sage/40 flex items-center justify-center text-sage-dark">
                  <Star strokeWidth={1.75} className="w-5 h-5 fill-current" />
                </span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-inkMuted rotate-180" style={{ writingMode: "vertical-rl" }}>
                  {heroQuote._autoRotated ? "Rotating" : "Featured"}
                </span>
              </div>
              <div>
                <p className="md:hidden font-mono text-[10px] tracking-[0.24em] uppercase text-sage-dark mb-3 flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-current" strokeWidth={1.75} />
                  {heroQuote._autoRotated ? "Quote of the week" : "Featured contribution"}
                </p>
                <p className="font-serif text-2xl md:text-3xl leading-snug italic">
                  "{heroQuote.text}"
                </p>
                <p className="mt-6 font-mono text-[11px] tracking-[0.2em] uppercase text-inkMuted">
                  — {heroQuote.attribution}
                  {heroQuote.year_level && <span className="text-sage-dark"> · {heroQuote.year_level}</span>}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Submit + Upper Years */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-16" data-testid="ask-body">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Submit */}
          <div className="lg:col-span-7">
            <div className="card-flat p-8 md:p-10">
              <p className="overline mb-4">§ Submit</p>
              <h2 className="font-serif text-3xl md:text-4xl tracking-tight mb-6">
                Submit a question.
              </h2>
              <p className="text-inkMuted leading-relaxed mb-6">
                Fill out the form below with your @spcdavao.edu.ph account, or
                open it in a new tab. Student representatives will help route
                it to the right office.
              </p>

              <a
                href={settings.ask_form_url || "#"}
                target="_blank"
                rel="noreferrer"
                data-testid="submit-cta"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm tracking-wide bg-ink text-paper hover:bg-black transition-colors"
              >
                <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
                Open in new tab
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />
              </a>

              <div className="mt-8">
                <p className="overline mb-3">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <span
                      key={c}
                      data-testid={`category-${c.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className="font-mono text-[11px] tracking-[0.15em] uppercase px-3 py-1.5 border border-ink/15 rounded-full text-ink/80"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-xl overflow-hidden border border-ink/10 bg-white">
                {settings.ask_form_url ? (
                  <>
                    <div className="px-4 py-2.5 bg-sage-light/60 border-b border-ink/5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                      <p className="text-xs font-mono tracking-wide text-sage-dark">
                        Sign in with your <strong>@spcdavao.edu.ph</strong> account to submit.
                      </p>
                    </div>
                    <iframe
                      title="Ask MLS submission form"
                      src={settings.ask_form_url}
                      className="w-full"
                      style={{ height: 900, border: 0 }}
                      data-testid="ask-form-iframe"
                    >
                      Loading…
                    </iframe>
                  </>
                ) : (
                  <div className="border border-dashed border-ink/20 rounded-xl p-6 flex items-center justify-center min-h-[220px] m-2">
                    <div className="text-center">
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-inkMuted">Google Form Embed</p>
                      <p className="mt-2 text-sm text-inkMuted max-w-xs">
                        Set the form URL in the admin panel (Settings → Ask MLS Form).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Upper Year Quotes */}
          <div className="lg:col-span-5">
            <div className="mb-6">
              <p className="overline mb-3">§ From the Upper Years</p>
              <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
                Things I <span className="italic">wish</span> I knew before MLS.
              </h2>
              <p className="mt-3 text-sm text-inkMuted leading-relaxed max-w-md">
                Short pieces of advice from those a few semesters ahead. No
                long-term commitment required — just one piece of wisdom.
              </p>
            </div>

            <div className="space-y-3">
              {quotes.filter((q) => q.id !== heroQuote?.id).map((q) => (
                <div
                  key={q.id}
                  data-testid={`quote-${q.id}`}
                  className="card-flat p-6 relative"
                >
                  <QuoteIcon className="absolute -top-2 -left-2 w-6 h-6 text-sage bg-paper p-1 rounded-full" strokeWidth={1.5} />
                  <p className="font-serif italic text-lg leading-snug">"{q.text}"</p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-inkMuted">
                      — {q.attribution}
                    </p>
                    {q.year_level && (
                      <span className="font-mono text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full bg-sage-light border border-sage/30 text-sage-dark">
                        {q.year_level}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {quotes.length === 0 && (
                <p className="text-sm text-inkMuted">Loading quotes…</p>
              )}
            </div>

            {/* Contribution form */}
            <div className="mt-8 card-flat p-6" data-testid="contribution-section">
              <p className="overline mb-3">§ Contribute</p>
              <h3 className="font-serif text-2xl tracking-tight mb-2">
                Share one thing you wish you knew.
              </h3>
              <p className="text-sm text-inkMuted leading-relaxed mb-4">
                No long-term commitment. Submit one short piece of wisdom —
                student officers review submissions and publish approved ones
                as quote cards above.
              </p>
              {settings.contribution_form_url ? (
                <>
                  <a
                    href={settings.contribution_form_url}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="contribution-cta"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm tracking-wide bg-sage text-white hover:bg-sage-dark transition-colors"
                  >
                    Contribute wisdom
                    <ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />
                  </a>
                  <div className="mt-6 rounded-xl overflow-hidden border border-ink/10 bg-white">
                    <div className="px-4 py-2.5 bg-sage-light/60 border-b border-ink/5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                      <p className="text-xs font-mono tracking-wide text-sage-dark">
                        Sign in with your <strong>@spcdavao.edu.ph</strong> account to submit.
                      </p>
                    </div>
                    <iframe
                      title="Upper-Year contribution form"
                      src={settings.contribution_form_url}
                      className="w-full"
                      style={{ height: 800, border: 0 }}
                      data-testid="contribution-iframe"
                    >
                      Loading…
                    </iframe>
                  </div>
                </>
              ) : (
                <div className="border border-dashed border-ink/20 rounded-xl p-6 flex items-center justify-center min-h-[120px]">
                  <p className="text-sm text-inkMuted text-center max-w-xs">
                    Contribution form coming soon — admin can enable it in Settings.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24" data-testid="ask-faq-section">
        <div className="border-t border-ink/10 pt-16">
          <p className="overline mb-4">§ FAQ</p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight mb-8">
            Frequently asked questions.
          </h2>

          <Accordion type="single" collapsible className="card-flat p-2 md:p-4" data-testid="ask-faq">
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="border-b border-ink/10 last:border-b-0">
                <AccordionTrigger
                  className="text-left font-serif text-lg px-4 hover:no-underline hover:text-sage"
                  data-testid={`ask-faq-trigger-${f.id}`}
                >
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 text-inkMuted leading-relaxed">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
            {faqs.length === 0 && <p className="p-6 text-sm text-inkMuted">Loading…</p>}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
