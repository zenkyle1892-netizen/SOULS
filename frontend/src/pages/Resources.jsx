import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BookOpen, TestTube, FileText, GraduationCap, Link2, ArrowUpRight } from "lucide-react";

const CATEGORIES = [
  {
    key: "academic",
    icon: BookOpen,
    label: "Academic",
    tag: "§ 01",
    items: [
      { title: "Study resources", body: "Curated readings, textbook chapters, and open-source references organized by subject." },
      { title: "Study techniques", body: "Active recall, spaced repetition, and the study methods that actually work under an MLS load." },
      { title: "Note-taking", body: "Cornell method, mind maps, and lab-flow note templates you can copy into any notebook." },
      { title: "Time management", body: "Weekly planning templates and how to protect deep work when everything feels urgent." },
      { title: "Subject-specific resources", body: "Anatomy, Physiology, Chemistry, Clinical Chem — reviewers and practice question banks by topic." },
    ],
  },
  {
    key: "laboratory",
    icon: TestTube,
    label: "Laboratory",
    tag: "§ 02",
    items: [
      { title: "Laboratory preparation", body: "Pre-lab checklists, what to bring, and how to read a lab manual efficiently." },
      { title: "Laboratory etiquette", body: "The unspoken rules — from cleaning your station to communicating with your groupmates." },
      { title: "Practical examination tips", body: "How to rehearse steps, manage time under pressure, and stay calm at the bench." },
      { title: "Laboratory organization", body: "How to label, pack, and rotate your kit so setup takes minutes, not hours." },
      { title: "Common laboratory questions", body: "Answers to the 'is it okay if…' questions everyone whispers before class." },
    ],
  },
  {
    key: "documents",
    icon: FileText,
    label: "Student Documents",
    tag: "§ 03",
    items: [
      { title: "Forms", body: "Common forms (petition, excuse letter, request slips) with editable templates." },
      { title: "Guidelines", body: "Departmental guidelines and student handbook links, kept up to date." },
      { title: "Schedules", body: "Current semester schedule, exam calendar, and important academic dates." },
      { title: "Important documents", body: "Grading policies, dress code, and lab safety documents." },
      { title: "Official announcements", body: "A running log of announcements, linked to their original sources." },
    ],
  },
  {
    key: "life",
    icon: GraduationCap,
    label: "Student Life",
    tag: "§ 04",
    items: [
      { title: "Student organizations", body: "MLS societies and campus-wide orgs worth joining in your first year." },
      { title: "Activities", body: "Upcoming events, socials, and academic competitions." },
      { title: "Opportunities", body: "Scholarships, research programs, and volunteer openings for MLS students." },
      { title: "Campus resources", body: "Library, chapel, clinic, and study spaces you'll actually use." },
    ],
  },
];

const USEFUL_LINKS_FALLBACK = [];

export default function Resources() {
  const [usefulLinks, setUsefulLinks] = useState(USEFUL_LINKS_FALLBACK);

  useEffect(() => {
    api.get("/links", { params: { section: "useful" } }).then((r) => setUsefulLinks(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden" data-testid="resources-hero">
        <div className="absolute inset-0 grid-paper opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16 relative">
          <p className="overline mb-6">§ Chapter Two</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1] max-w-4xl">
            Resource <span className="italic text-sage">Hub.</span>
          </h1>
          <p className="mt-6 text-lg text-inkMuted max-w-2xl leading-relaxed">
            Everything you need, in one place. Student-tested tips are marked
            with a sage tag; official school info links directly to source.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Sticky index */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <p className="overline mb-4">Categories</p>
              <ul className="space-y-2 text-sm">
                {CATEGORIES.map((c) => (
                  <li key={c.key}>
                    <a
                      href={`#${c.key}`}
                      data-testid={`resource-nav-${c.key}`}
                      className="flex items-center justify-between py-2 border-b border-ink/10 hover:text-sage transition-colors"
                    >
                      <span>{c.label}</span>
                      <span className="font-mono text-[10px] text-inkMuted">{c.tag}</span>
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#useful"
                    data-testid="resource-nav-useful"
                    className="flex items-center justify-between py-2 border-b border-ink/10 hover:text-sage transition-colors"
                  >
                    <span>Useful Links</span>
                    <span className="font-mono text-[10px] text-inkMuted">§ 05</span>
                  </a>
                </li>
              </ul>
            </div>
          </aside>

          {/* Sections */}
          <div className="lg:col-span-9 space-y-20">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <section key={c.key} id={c.key} className="scroll-mt-24" data-testid={`section-${c.key}`}>
                  <div className="flex items-center gap-3 mb-8">
                    <span className="w-10 h-10 rounded-full bg-sage-light border border-sage/30 flex items-center justify-center text-sage-dark">
                      <Icon strokeWidth={1.5} className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-inkMuted">
                        {c.tag}
                      </p>
                      <h2 className="font-serif text-3xl tracking-tight">{c.label}</h2>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {c.items.map((it, i) => (
                      <div
                        key={i}
                        className="card-flat p-6"
                        data-testid={`resource-card-${c.key}-${i}`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-mono text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 border border-ink/10 rounded-full text-inkMuted">
                            Student-Tested
                          </span>
                        </div>
                        <h3 className="font-serif text-xl mb-2">{it.title}</h3>
                        <p className="text-sm text-inkMuted leading-relaxed">{it.body}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Useful links */}
            <section id="useful" className="scroll-mt-24" data-testid="section-useful">
              <div className="flex items-center gap-3 mb-8">
                <span className="w-10 h-10 rounded-full bg-terracotta-light border border-terracotta/30 flex items-center justify-center text-terracotta-dark">
                  <Link2 strokeWidth={1.5} className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-inkMuted">
                    § 05
                  </p>
                  <h2 className="font-serif text-3xl tracking-tight">Useful Links</h2>
                </div>
              </div>
              <div className="card-flat divide-y divide-ink/10">
                {usefulLinks.map((l) => (
                  <a
                    key={l.id || l.label}
                    href={l.url || "#"}
                    target={l.url && l.url !== "#" ? "_blank" : undefined}
                    rel="noreferrer"
                    data-testid={`useful-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className="flex items-center justify-between p-5 group hover:bg-paperAlt/50 transition-colors"
                  >
                    <div>
                      <p className="text-ink group-hover:text-sage transition-colors">{l.label}</p>
                      {l.note && <p className="text-xs font-mono text-inkMuted mt-0.5">{l.note}</p>}
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-inkMuted group-hover:text-sage" strokeWidth={1.5} />
                  </a>
                ))}
                {usefulLinks.length === 0 && (
                  <p className="p-6 text-sm text-inkMuted">Loading links…</p>
                )}
              </div>
              <p className="mt-5 text-xs font-mono uppercase tracking-[0.2em] text-inkMuted">
                Editable by student officers in the admin panel
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
