import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Compass, Menu, X } from "lucide-react";

const NAV = [
  { to: "/", label: "Home", testid: "nav-home" },
  { to: "/roadmap", label: "Roadmap", testid: "nav-roadmap" },
  { to: "/resources", label: "Resources", testid: "nav-resources" },
  { to: "/support", label: "Support", testid: "nav-support" },
  { to: "/ask", label: "Ask MLS", testid: "nav-ask" },
  { to: "/gallery", label: "Gallery", testid: "nav-gallery" },
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hideChrome = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      {!hideChrome && (
        <header
          className="sticky top-0 z-40 backdrop-blur-md bg-paper/80 border-b border-ink/10"
          data-testid="site-header"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 group"
              data-testid="logo-link"
            >
              <span className="w-9 h-9 rounded-full border border-ink/20 flex items-center justify-center bg-white group-hover:border-sage transition-colors">
                <Compass strokeWidth={1.5} className="w-5 h-5 text-sage" />
              </span>
              <span className="font-serif text-lg tracking-tight">
                MLS <span className="text-sage">Compass</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/"}
                  data-testid={n.testid}
                  className={({ isActive }) =>
                    `text-sm tracking-tight link-underline pb-0.5 ${
                      isActive ? "text-ink font-medium" : "text-ink/70 hover:text-ink"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>

            <button
              className="lg:hidden p-2 -mr-2"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              data-testid="nav-toggle"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {open && (
            <div className="lg:hidden border-t border-ink/10 bg-paper" data-testid="mobile-menu">
              <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col">
                {NAV.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.to === "/"}
                    onClick={() => setOpen(false)}
                    data-testid={`${n.testid}-mobile`}
                    className={({ isActive }) =>
                      `py-3 border-b border-ink/5 text-base ${
                        isActive ? "text-sage font-medium" : "text-ink/80"
                      }`
                    }
                  >
                    {n.label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </header>
      )}

      <main className="flex-1">{children}</main>

      {!hideChrome && (
        <footer className="mt-24 border-t border-ink/10 bg-paperAlt" data-testid="site-footer">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center bg-white">
                  <Compass strokeWidth={1.5} className="w-4 h-4 text-sage" />
                </span>
                <span className="font-serif text-lg">MLS Compass</span>
              </div>
              <p className="text-sm text-inkMuted max-w-xs leading-relaxed">
                Your guide to navigating Medical Laboratory Science.
              </p>
            </div>
            <div>
              <p className="overline mb-4">Navigate</p>
              <ul className="space-y-2 text-sm">
                {NAV.map((n) => (
                  <li key={n.to}>
                    <Link
                      to={n.to}
                      className="text-ink/80 hover:text-sage transition-colors"
                      data-testid={`footer-${n.testid}`}
                    >
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="overline mb-4">A note</p>
              <p className="text-sm text-inkMuted leading-relaxed">
                Student-led resource hub. Always verify official policies and
                requirements through the appropriate school office.
              </p>
              <p className="mt-6 font-mono text-[11px] tracking-[0.2em] uppercase text-inkMuted/70">
                © {new Date().getFullYear()} MLS Compass
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
