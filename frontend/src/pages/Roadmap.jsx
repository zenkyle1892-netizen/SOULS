import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Package, CalendarDays, ClipboardList, LifeBuoy, HelpCircle } from "lucide-react";

const STAGES = [
  {
    id: "01",
    icon: Package,
    title: "Before Classes",
    subtitle: "What should I prepare?",
    items: [
      { h: "School essentials", p: "Lab gown (properly labeled), ID lace, closed shoes, notebook, permanent marker, small calculator, a reliable water bottle." },
      { h: "Laboratory preparation", p: "Get your name embroidered on your gown early. Prepare a small pouch for glass slides, gloves, and lens paper." },
      { h: "Digital organization", p: "Set up one folder per subject on Google Drive. Use a consistent naming pattern like SUBJ_Topic_YYYYMMDD." },
      { h: "Important accounts", p: "Activate your institutional email, student portal, and library account before day one." },
      { h: "Important contacts", p: "Save your class adviser, department office, and guidance office numbers." },
    ],
  },
  {
    id: "02",
    icon: CalendarDays,
    title: "Your First Month",
    subtitle: "What should I expect?",
    items: [
      { h: "Adjusting to college", p: "Sleep will be your first casualty if you're not careful. Anchor a fixed wake-up time even on light days." },
      { h: "Understanding schedules", p: "Photocopy or screenshot your final schedule. Note lab days separately — you'll need extra buffer time for setup." },
      { h: "Managing requirements", p: "Keep a single running document titled 'Deadlines' — dates, subjects, weight, status." },
      { h: "Getting used to laboratory classes", p: "Read the manual the night before. Practical grades often come from preparation, not talent." },
      { h: "Asking questions", p: "If you're confused, at least two other people also are. Ask." },
      { h: "Building effective study habits", p: "Start with 25-minute focused blocks. Passive reading feels productive but rarely is." },
    ],
  },
  {
    id: "03",
    icon: ClipboardList,
    title: "First Exams",
    subtitle: "How do I prepare?",
    items: [
      { h: "Study planning", p: "Work backward from the exam date. Reserve the last two days for review, not new material." },
      { h: "Avoiding cramming", p: "Spread study across 5–7 days. Sleep does most of the memory work — respect it." },
      { h: "Reviewing difficult subjects", p: "Rewrite confusing topics in your own words. If you can't explain it simply, you don't know it yet." },
      { h: "Preparing for practical examinations", p: "Rehearse the steps out loud. Practicals reward muscle memory more than reading." },
      { h: "Managing multiple deadlines", p: "Sort by weight × urgency. Do the heaviest, soonest one first while your brain is fresh." },
    ],
  },
  {
    id: "04",
    icon: LifeBuoy,
    title: "When Things Get Hard",
    subtitle: "Feeling overwhelmed?",
    items: [
      { h: "Time-management suggestions", p: "Block your calendar in 90-minute chunks. Include rest and meals — those are appointments too." },
      { h: "Healthy study habits", p: "Move your body once a day. Even a 15-minute walk resets your focus more than another coffee." },
      { h: "Asking for help", p: "Message a classmate first, then instructor. Silence is the most expensive study strategy." },
      { h: "Recognizing when you need support", p: "Persistent fatigue, disinterest, or dread aren't 'just stress' — they're signals. Listen to them." },
      { h: "Links to school support services", p: "Guidance & Counseling, Student Affairs, and your department office are all reachable. See the Student Support page." },
    ],
  },
];

export default function Roadmap() {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    api.get("/faqs", { params: { page: "roadmap" } }).then((r) => setFaqs(r.data));
  }, []);

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden" data-testid="roadmap-hero">
        <div className="absolute inset-0 grid-paper opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16 relative">
          <p className="overline mb-6">§ Chapter One</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1] max-w-4xl">
            First-Year <span className="italic text-sage">Roadmap.</span>
          </h1>
          <p className="mt-6 text-lg text-inkMuted max-w-2xl leading-relaxed">
            Not sure what comes next? Start here. Read it in order or jump to
            the stage that matches where you are.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-16" data-testid="roadmap-timeline">
        <div className="relative">
          <div className="absolute left-6 md:left-10 top-4 bottom-4 w-px bg-ink/15" aria-hidden />

          <div className="space-y-16">
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div key={stage.id} className="relative pl-16 md:pl-24" data-testid={`stage-${stage.id}`}>
                  <div className="absolute left-0 md:left-4 top-0 flex items-center gap-3">
                    <span className="w-12 h-12 md:w-12 md:h-12 rounded-full bg-white border border-ink/15 flex items-center justify-center relative z-10">
                      <Icon strokeWidth={1.5} className="w-5 h-5 text-sage" />
                    </span>
                  </div>

                  <div className="mb-8">
                    <p className="font-mono text-xs tracking-[0.24em] text-sage mb-2">
                      {stage.id} — STAGE
                    </p>
                    <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
                      {stage.title}
                    </h2>
                    <p className="mt-2 italic text-inkMuted font-serif text-lg">
                      "{stage.subtitle}"
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {stage.items.map((it, i) => (
                      <div
                        key={i}
                        className="card-flat p-6"
                        data-testid={`stage-${stage.id}-item-${i}`}
                      >
                        <h3 className="font-serif text-lg mb-2">{it.h}</h3>
                        <p className="text-sm text-inkMuted leading-relaxed">{it.p}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Stage 05 — FAQ */}
            <div className="relative pl-16 md:pl-24" data-testid="stage-05">
              <div className="absolute left-0 md:left-4 top-0">
                <span className="w-12 h-12 rounded-full bg-white border border-ink/15 flex items-center justify-center relative z-10">
                  <HelpCircle strokeWidth={1.5} className="w-5 h-5 text-terracotta" />
                </span>
              </div>
              <div className="mb-8">
                <p className="font-mono text-xs tracking-[0.24em] text-terracotta mb-2">
                  05 — STAGE
                </p>
                <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
                  Common Freshman Questions
                </h2>
              </div>

              <Accordion type="single" collapsible className="card-flat p-2 md:p-4" data-testid="freshman-faq">
                {faqs.map((f) => (
                  <AccordionItem key={f.id} value={f.id} className="border-b border-ink/10 last:border-b-0">
                    <AccordionTrigger
                      className="text-left font-serif text-lg px-4 hover:no-underline hover:text-sage"
                      data-testid={`faq-trigger-${f.id}`}
                    >
                      {f.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-5 text-inkMuted leading-relaxed">
                      {f.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
                {faqs.length === 0 && (
                  <p className="p-6 text-sm text-inkMuted">Loading questions…</p>
                )}
              </Accordion>
            </div>
          </div>
        </div>

        {/* Closing note */}
        <div className="mt-24 border-t border-ink/10 pt-12">
          <p className="font-serif text-2xl md:text-3xl italic max-w-3xl leading-snug">
            Remember: you are learning both MLS and how to be a college
            student. <span className="text-sage not-italic">Give yourself time to adjust.</span>
          </p>
        </div>
      </section>
    </div>
  );
}
