import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, BookOpen, HeartPulse, MessageCircleQuestion, ArrowUpRight, Plus, Megaphone, Share2 } from "lucide-react";
import { api } from "@/lib/api";

const PATHWAYS = [
  {
    idx: "01",
    icon: Compass,
    title: "I'm New to MLS",
    body: "Practical guidance for navigating your first year, one step at a time.",
    to: "/roadmap",
    testid: "path-new",
    accent: "sage",
  },
  {
    idx: "02",
    icon: BookOpen,
    title: "I Need Resources",
    body: "Academic and laboratory resources, organized so you can actually find them.",
    to: "/resources",
    testid: "path-resources",
    accent: "ink",
  },
  {
    idx: "03",
    icon: HeartPulse,
    title: "I Need Support",
    body: "Well-being resources and the right people to talk to when things get heavy.",
    to: "/support",
    testid: "path-support",
    accent: "terracotta",
  },
  {
    idx: "04",
    icon: MessageCircleQuestion,
    title: "I Have a Question",
    body: "Submit a question, concern, or suggestion. We'll help you find the right office.",
    to: "/ask",
    testid: "path-ask",
    accent: "sage",
  },
];

const QUICK_LINKS_FALLBACK = [
  { label: "Official School Website", url: "#", note: "" },
];

const ANN_CATEGORIES = ["All", "Academic", "Event", "Reminder"];
const CATEGORY_STYLES = {
  Academic: "bg-sage-light text-sage-dark border-sage/30",
  Event: "bg-terracotta-light text-terracotta-dark border-terracotta/30",
  Reminder: "bg-paperAlt text-ink/70 border-ink/15",
};

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch { return d; }
}

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [quickLinks, setQuickLinks] = useState(QUICK_LINKS_FALLBACK);
  const [annFilter, setAnnFilter] = useState("All");

  useEffect(() => {
    api.get("/announcements").then((r) => setAnnouncements(r.data)).catch(() => {});
    api.get("/links", { params: { section: "quick" } }).then((r) => setQuickLinks(r.data)).catch(() => {});
  }, []);

  const filteredAnnouncements = useMemo(() => {
    if (annFilter === "All") return announcements;
    return announcements.filter((a) => (a.category || "Reminder") === annFilter);
  }, [announcements, annFilter]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 grid-paper opacity-60 pointer-events-none" />
        <div className="absolute top-10 right-8 hidden md:block pointer-events-none">
          <Plus strokeWidth={1} className="w-4 h-4 text-ink/30" />
        </div>
        <div className="absolute bottom-24 left-24 hidden md:block pointer-events-none">
          <Plus strokeWidth={1} className="w-4 h-4 text-ink/30" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-28 lg:pt-32 lg:pb-40 relative">
          <div className="grid lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-8">
              <p className="overline mb-6" data-testid="hero-overline">
                A Student Companion · Est. 2026
              </p>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[0.98] tracking-tight">
                Your guide to
                <br />
                navigating
                <br />
                <span className="italic text-sage">Medical Laboratory Science.</span>
              </h1>
              <p className="mt-8 text-lg text-inkMuted max-w-xl leading-relaxed">
                Whether you're starting your first year or navigating the later
                stages of MLS, MLS Compass provides practical resources,
                guidance, and support to help you find your way.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/roadmap"
                  className="btn-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm tracking-wide"
                  data-testid="hero-cta-first-year"
                >
                  I'm a First-Year Student
                  <ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />
                </Link>
                <Link
                  to="/resources"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm tracking-wide border border-ink/20 hover:border-ink transition-colors"
                  data-testid="hero-cta-explore"
                >
                  Explore Resources
                </Link>
                <Link
                  to="/support"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm tracking-wide bg-terracotta-light text-terracotta-dark hover:bg-terracotta hover:text-white transition-colors"
                  data-testid="hero-cta-support"
                >
                  I Need Support
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 relative">
              <div className="relative aspect-[4/5] rounded-full overflow-hidden border border-ink/10 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                <img
                  src="https://images.unsplash.com/photo-1707944746058-4da338d0f827?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwzfHxzY2llbmNlJTIwbGFib3JhdG9yeSUyMHN0dWRlbnRzJTIwd2FybXRofGVufDB8fHx8MTc4NjY5ODk4OHww&ixlib=rb-4.1.0&q=85"
                  alt="MLS students working"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-[10px] border-paper rounded-full pointer-events-none" />
              </div>
              <div className="absolute -bottom-4 -left-4 font-mono text-[10px] tracking-[0.2em] uppercase bg-paper border border-ink/10 px-3 py-1.5 rounded-full">
                Slide No. 001
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PATHWAYS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20" data-testid="pathways-section">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <div>
            <p className="overline mb-3">§ 01 — Pathways</p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-2xl">
              What are you looking for?
            </h2>
          </div>
          <p className="text-inkMuted max-w-md text-sm leading-relaxed">
            Four doors. Pick the one that matches where you are right now — you
            can always come back for another.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {PATHWAYS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.idx}
                to={p.to}
                data-testid={p.testid}
                className="card-flat p-8 md:p-10 flex flex-col justify-between group min-h-[220px]"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                      p.accent === "terracotta"
                        ? "bg-terracotta-light border-terracotta/30 text-terracotta-dark"
                        : p.accent === "sage"
                        ? "bg-sage-light border-sage/30 text-sage-dark"
                        : "bg-paperAlt border-ink/10 text-ink"
                    }`}
                  >
                    <Icon strokeWidth={1.5} className="w-5 h-5" />
                  </span>
                  <span className="font-mono text-xs tracking-[0.2em] text-inkMuted">
                    {p.idx}
                  </span>
                </div>
                <div className="mt-10">
                  <h3 className="font-serif text-2xl md:text-3xl tracking-tight mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-inkMuted leading-relaxed max-w-md">
                    {p.body}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink group-hover:text-sage transition-colors">
                    Continue
                    <ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* MESSAGE */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24" data-testid="message-section">
        <div className="grid lg:grid-cols-12 gap-10 items-center border-t border-ink/10 pt-16">
          <div className="lg:col-span-7">
            <p className="overline mb-4">§ 02 — Why this exists</p>
            <p className="font-serif text-3xl md:text-4xl leading-tight max-w-2xl">
              You don't have to
              <span className="italic text-sage"> figure it out alone.</span>
            </p>
          </div>
          <div className="lg:col-span-5 text-inkMuted text-base leading-relaxed">
            <p>
              MLS Compass was created by students for students — to make
              information easier to find, questions easier to ask, and support
              easier to reach. It doesn't replace your school offices; it points
              you toward them.
            </p>
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-4" data-testid="announcements-section">
          <div className="border-t border-ink/10 pt-16">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
              <div>
                <p className="overline mb-3 flex items-center gap-2">
                  <Megaphone className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Announcements
                </p>
                <h2 className="font-serif text-4xl md:text-5xl tracking-tight">
                  What's <span className="italic text-sage">new.</span>
                </h2>
              </div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-inkMuted max-w-xs">
                Newest first · updated by student officers
              </p>
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2 mb-6" data-testid="ann-filter">
              {ANN_CATEGORIES.map((c) => {
                const active = annFilter === c;
                return (
                  <button
                    key={c}
                    onClick={() => setAnnFilter(c)}
                    data-testid={`ann-filter-${c.toLowerCase()}`}
                    className={`font-mono text-[11px] tracking-[0.18em] uppercase px-3 py-1.5 rounded-full border transition-colors ${
                      active
                        ? "bg-ink text-paper border-ink"
                        : "border-ink/15 text-ink/70 hover:border-ink hover:text-ink"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {filteredAnnouncements.slice(0, 8).map((a) => {
                const cat = a.category || "Reminder";
                const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.Reminder;
                const shareText = `${a.title}\n\n${a.body}\n\nSource: ${a.source}\nMLS Compass · ${window.location.origin}`;
                const shareUrl = `${window.location.origin}/?a=${a.id}#announcement-${a.id}`;
                const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
                const onCopy = async (e) => {
                  e.preventDefault();
                  try {
                    await navigator.clipboard.writeText(shareText);
                    e.currentTarget.dataset.copied = "1";
                    setTimeout(() => { if (e.currentTarget) delete e.currentTarget.dataset.copied; }, 1500);
                  } catch {}
                };
                return (
                  <article
                    key={a.id}
                    id={`announcement-${a.id}`}
                    className="card-flat p-6 md:p-7 grid md:grid-cols-[160px_1fr] gap-4 md:gap-8 scroll-mt-24"
                    data-testid={`announcement-${a.id}`}
                  >
                    <div>
                      <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-sage-dark">
                        {formatDate(a.date)}
                      </p>
                      <p className="mt-1 font-mono text-[10px] tracking-[0.15em] uppercase text-inkMuted">
                        {a.source}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                        <span
                          className={`font-mono text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 border rounded-full ${style}`}
                          data-testid={`ann-category-${a.id}`}
                        >
                          {cat}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={onCopy}
                            data-testid={`ann-copy-${a.id}`}
                            className="text-[10px] font-mono tracking-[0.15em] uppercase px-2.5 py-1 rounded-full border border-ink/10 hover:border-ink hover:bg-ink hover:text-paper transition-colors"
                            title="Copy shareable text"
                          >
                            <span data-testid={`ann-copy-label-${a.id}`}>Copy</span>
                          </button>
                          <a
                            href={fbShare}
                            target="_blank"
                            rel="noreferrer"
                            data-testid={`ann-share-${a.id}`}
                            className="inline-flex items-center gap-1 text-[10px] font-mono tracking-[0.15em] uppercase px-2.5 py-1 rounded-full border border-ink/10 hover:border-sage hover:bg-sage-light transition-colors"
                            title="Share on Facebook"
                          >
                            <Share2 className="w-3 h-3" strokeWidth={1.75} />
                            Share
                          </a>
                        </div>
                      </div>
                      <h3 className="font-serif text-xl md:text-2xl tracking-tight mb-2">{a.title}</h3>
                      <p className="text-sm text-inkMuted leading-relaxed">{a.body}</p>
                    </div>
                  </article>
                );
              })}
              {filteredAnnouncements.length === 0 && (
                <p className="text-sm text-inkMuted py-6">No announcements in this category yet.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* QUICK LINKS */}
      <section className="bg-paperAlt border-y border-ink/10 mt-24" data-testid="quick-links-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <p className="overline mb-6">Quick links</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-4">
            {quickLinks.map((l) => (
              <a
                key={l.id || l.label}
                href={l.url || "#"}
                target={l.url && l.url !== "#" ? "_blank" : undefined}
                rel="noreferrer"
                className="flex items-center justify-between py-3 border-b border-ink/10 group"
                data-testid={`quick-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div>
                  <span className="text-ink group-hover:text-sage transition-colors">
                    {l.label}
                  </span>
                  {l.note && (
                    <span className="block font-mono text-[10px] text-inkMuted mt-0.5 tracking-wide">
                      {l.note}
                    </span>
                  )}
                </div>
                <ArrowUpRight className="w-4 h-4 text-inkMuted group-hover:text-sage" strokeWidth={1.5} />
              </a>
            ))}
          </div>
          <p className="mt-8 text-xs font-mono uppercase tracking-[0.2em] text-inkMuted">
            Editable by student officers in the admin panel
          </p>
        </div>
      </section>
    </div>
  );
}
