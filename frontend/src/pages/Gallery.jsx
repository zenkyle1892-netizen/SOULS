import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Camera, ArrowUpRight, X, ImagePlus, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

function idsToPhotos(ids, allPhotos) {
  const byId = Object.fromEntries(allPhotos.map((p) => [p.id, p]));
  return (ids || []).map((id) => byId[id]).filter(Boolean);
}

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [stories, setStories] = useState([]);
  const [settings, setSettings] = useState({ photo_form_url: "" });
  const [active, setActive] = useState(null); // { list: [...photos], index: n }
  const [loaded, setLoaded] = useState(false);
  const [batchFilter, setBatchFilter] = useState("All");

  useEffect(() => {
    Promise.all([
      api.get("/photos").then((r) => setPhotos(r.data)),
      api.get("/stories").then((r) => setStories(r.data)),
    ]).finally(() => setLoaded(true));
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (!active) return;
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive((a) => a && { ...a, index: (a.index + 1) % a.list.length });
      if (e.key === "ArrowLeft") setActive((a) => a && { ...a, index: (a.index - 1 + a.list.length) % a.list.length });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const batches = useMemo(() => {
    const set = new Set();
    photos.forEach((p) => p.year && set.add(p.year));
    stories.forEach((s) => s.year && set.add(s.year));
    return Array.from(set).sort();
  }, [photos, stories]);

  const filteredPhotos = useMemo(() => {
    if (batchFilter === "All") return photos;
    return photos.filter((p) => (p.year || "") === batchFilter);
  }, [photos, batchFilter]);

  const filteredStories = useMemo(() => {
    if (batchFilter === "All") return stories;
    return stories.filter((s) => (s.year || "") === batchFilter);
  }, [stories, batchFilter]);

  const openLightbox = (list, index) => setActive({ list, index });
  const activePhoto = active ? active.list[active.index] : null;

  const showEmpty = loaded && filteredPhotos.length === 0 && filteredStories.length === 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" data-testid="gallery-hero">
        <div className="absolute inset-0 grid-paper opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-12 relative">
          <p className="overline mb-6">§ Chapter Five</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1] max-w-4xl">
            The <span className="italic text-sage">yearbook.</span>
          </h1>
          <p className="mt-6 text-lg text-inkMuted max-w-2xl leading-relaxed">
            Photos from the seniors who walked these halls before you — lab
            days, thesis defenses, fieldwork, the small moments in between.
            Every batch adds a page.
          </p>
        </div>
      </section>

      {/* Batch filter */}
      {batches.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-4" data-testid="batch-filter">
          <div className="flex flex-wrap gap-2">
            {["All", ...batches].map((b) => {
              const activeChip = batchFilter === b;
              return (
                <button
                  key={b}
                  onClick={() => setBatchFilter(b)}
                  data-testid={`batch-chip-${b.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`font-mono text-[11px] tracking-[0.18em] uppercase px-3 py-1.5 rounded-full border transition-colors ${
                    activeChip
                      ? "bg-ink text-paper border-ink"
                      : "border-ink/15 text-ink/70 hover:border-ink hover:text-ink"
                  }`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stories */}
      {filteredStories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-8" data-testid="stories-section">
          <p className="overline mb-6 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" strokeWidth={1.75} />
            Stories
          </p>
          <div className="space-y-6">
            {filteredStories.map((s) => {
              const storyPhotos = idsToPhotos(s.photo_ids, photos);
              return (
                <article key={s.id} className="card-flat overflow-hidden" data-testid={`story-${s.id}`}>
                  <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                    {s.cover_image_url && (
                      <button
                        onClick={() => storyPhotos.length > 0 ? openLightbox(storyPhotos, 0) : openLightbox([{ image_url: s.cover_image_url, caption: s.title, year: s.year }], 0)}
                        className="relative overflow-hidden bg-white group"
                        data-testid={`story-cover-${s.id}`}
                      >
                        <img
                          src={s.cover_image_url}
                          alt={s.title}
                          loading="lazy"
                          className="w-full h-full object-cover aspect-[4/3] md:aspect-auto md:min-h-[280px] group-hover:scale-[1.02] transition-transform duration-500"
                          onError={(e) => { e.currentTarget.style.opacity = "0.2"; }}
                        />
                      </button>
                    )}
                    <div className="p-8 md:p-10 flex flex-col">
                      {s.year && (
                        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-sage-dark mb-3">
                          {s.year}
                        </p>
                      )}
                      <h3 className="font-serif text-2xl md:text-3xl tracking-tight mb-3">{s.title}</h3>
                      {s.description && (
                        <p className="text-sm text-inkMuted leading-relaxed">{s.description}</p>
                      )}
                      {storyPhotos.length > 0 && (
                        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
                          {storyPhotos.map((p, i) => (
                            <button
                              key={p.id}
                              onClick={() => openLightbox(storyPhotos, i)}
                              className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-ink/10 hover:border-sage transition-colors"
                              data-testid={`story-thumb-${s.id}-${i}`}
                              aria-label={p.caption || `Photo ${i + 1}`}
                            >
                              <img
                                src={p.image_url}
                                alt={p.caption || ""}
                                loading="lazy"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.opacity = "0.2"; }}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Photos grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-16" data-testid="gallery-grid-section">
        {showEmpty ? (
          <div className="card-flat p-12 flex flex-col items-center text-center max-w-2xl mx-auto" data-testid="gallery-empty">
            <span className="w-14 h-14 rounded-full bg-sage-light border border-sage/40 flex items-center justify-center text-sage-dark mb-5">
              <Camera strokeWidth={1.5} className="w-6 h-6" />
            </span>
            <h2 className="font-serif text-2xl mb-2">
              {batchFilter === "All" ? "No photos yet." : `Nothing for ${batchFilter} yet.`}
            </h2>
            <p className="text-sm text-inkMuted max-w-md">
              {batchFilter === "All"
                ? "Be the first to share a memory. Submit through the form below."
                : "Try another batch or share the first memory from this year."}
            </p>
          </div>
        ) : (
          filteredPhotos.length > 0 && (
            <>
              {filteredStories.length > 0 && (
                <p className="overline mb-6">Individual photos</p>
              )}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4" data-testid="gallery-grid">
                {filteredPhotos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => openLightbox(filteredPhotos, i)}
                    className="mb-4 block w-full text-left break-inside-avoid group"
                    data-testid={`photo-${p.id}`}
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-white">
                      <img
                        src={p.image_url}
                        alt={p.caption || "MLS memory"}
                        loading="lazy"
                        className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500"
                        onError={(e) => { e.currentTarget.style.opacity = "0.2"; }}
                      />
                      {(p.caption || p.year || p.submitter) && (
                        <div className="p-4 border-t border-ink/5">
                          {p.year && (
                            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-sage-dark mb-1.5">
                              {p.year}
                            </p>
                          )}
                          {p.caption && (
                            <p className="font-serif text-base italic leading-snug">"{p.caption}"</p>
                          )}
                          {p.submitter && (
                            <p className="mt-2 font-mono text-[10px] tracking-[0.15em] uppercase text-inkMuted">
                              — {p.submitter}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )
        )}
      </section>

      {/* Submission section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24" data-testid="gallery-submit-section">
        <div className="border-t border-ink/10 pt-16">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <p className="overline mb-3">§ Contribute</p>
              <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
                Share a <span className="italic text-sage">memory.</span>
              </h2>
              <p className="mt-4 text-inkMuted leading-relaxed">
                Have a photo from your MLS journey — lab days, sablay, field
                exposure, org events? Send it in. Student officers review and
                publish approved photos to the yearbook.
              </p>
              <p className="mt-4 text-sm text-inkMuted">
                Keep it appropriate and get everyone in the photo's consent
                before submitting.
              </p>
            </div>
            <div className="lg:col-span-7">
              {settings.photo_form_url ? (
                <div className="rounded-xl overflow-hidden border border-ink/10 bg-white">
                  <div className="px-4 py-2.5 bg-sage-light/60 border-b border-ink/5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                    <p className="text-xs font-mono tracking-wide text-sage-dark">
                      Sign in with your <strong>@spcdavao.edu.ph</strong> account to submit.
                    </p>
                  </div>
                  <iframe
                    title="Photo submission form"
                    src={settings.photo_form_url}
                    className="w-full"
                    style={{ height: 900, border: 0 }}
                    data-testid="photo-form-iframe"
                  >
                    Loading…
                  </iframe>
                </div>
              ) : (
                <div className="card-flat p-8 md:p-10 text-center">
                  <span className="w-12 h-12 rounded-full bg-paperAlt border border-ink/10 flex items-center justify-center text-ink mb-4 mx-auto">
                    <ImagePlus strokeWidth={1.5} className="w-5 h-5" />
                  </span>
                  <p className="font-serif text-xl mb-2">Submission form coming soon</p>
                  <p className="text-sm text-inkMuted max-w-sm mx-auto">
                    Student officers can enable the photo submission form in
                    Admin → Settings → Photo Form URL.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {activePhoto && (
        <div
          role="dialog"
          className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
          onClick={() => setActive(null)}
          data-testid="lightbox"
        >
          <button
            onClick={(e) => { e.stopPropagation(); setActive(null); }}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-paper text-ink flex items-center justify-center hover:bg-sage-light transition-colors"
            data-testid="lightbox-close"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>

          {active.list.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((a) => ({ ...a, index: (a.index - 1 + a.list.length) % a.list.length })); }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-paper text-ink flex items-center justify-center hover:bg-sage-light transition-colors z-10"
                data-testid="lightbox-prev"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((a) => ({ ...a, index: (a.index + 1) % a.list.length })); }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-paper text-ink flex items-center justify-center hover:bg-sage-light transition-colors z-10"
                data-testid="lightbox-next"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </>
          )}

          <div
            className="max-w-5xl w-full grid md:grid-cols-[1fr_320px] gap-4 items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activePhoto.image_url}
              alt={activePhoto.caption || "MLS memory"}
              className="w-full max-h-[80vh] object-contain rounded-xl bg-white"
            />
            <div className="bg-paper text-ink rounded-xl p-6">
              {active.list.length > 1 && (
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-inkMuted mb-3">
                  {active.index + 1} / {active.list.length}
                </p>
              )}
              {activePhoto.year && (
                <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-sage-dark mb-2">
                  {activePhoto.year}
                </p>
              )}
              {activePhoto.caption && (
                <p className="font-serif text-xl italic leading-snug mb-4">
                  "{activePhoto.caption}"
                </p>
              )}
              {activePhoto.submitter && (
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-inkMuted">
                  Submitted by {activePhoto.submitter}
                </p>
              )}
              <a
                href={activePhoto.image_url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 text-sm text-sage-dark hover:text-sage"
                data-testid="lightbox-open-full"
              >
                Open full size
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
