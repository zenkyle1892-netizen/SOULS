import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Camera, ArrowUpRight, X, ImagePlus } from "lucide-react";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [settings, setSettings] = useState({ photo_form_url: "" });
  const [active, setActive] = useState(null); // lightbox
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get("/photos").then((r) => setPhotos(r.data)).finally(() => setLoaded(true));
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-16" data-testid="gallery-grid-section">
        {loaded && photos.length === 0 ? (
          <div className="card-flat p-12 flex flex-col items-center text-center max-w-2xl mx-auto" data-testid="gallery-empty">
            <span className="w-14 h-14 rounded-full bg-sage-light border border-sage/40 flex items-center justify-center text-sage-dark mb-5">
              <Camera strokeWidth={1.5} className="w-6 h-6" />
            </span>
            <h2 className="font-serif text-2xl mb-2">No photos yet.</h2>
            <p className="text-sm text-inkMuted max-w-md">
              Be the first to share a memory. Submit through the form below or
              wait for an upperclassman to start the archive.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4" data-testid="gallery-grid">
            {photos.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p)}
                className="mb-4 block w-full text-left break-inside-avoid group"
                data-testid={`photo-${p.id}`}
              >
                <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-white">
                  <img
                    src={p.image_url}
                    alt={p.caption || "MLS memory"}
                    loading="lazy"
                    className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
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
                    style={{ height: 850, border: 0 }}
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
      {active && (
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
          <div
            className="max-w-5xl w-full grid md:grid-cols-[1fr_320px] gap-4 items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={active.image_url}
              alt={active.caption || "MLS memory"}
              className="w-full max-h-[80vh] object-contain rounded-xl bg-white"
            />
            <div className="bg-paper text-ink rounded-xl p-6">
              {active.year && (
                <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-sage-dark mb-2">
                  {active.year}
                </p>
              )}
              {active.caption && (
                <p className="font-serif text-xl italic leading-snug mb-4">
                  "{active.caption}"
                </p>
              )}
              {active.submitter && (
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-inkMuted">
                  Submitted by {active.submitter}
                </p>
              )}
              <a
                href={active.image_url}
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
