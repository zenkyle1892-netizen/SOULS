import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { api, getAdminPin, setAdminPin, clearAdminPin, adminHeaders } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Compass, LogOut, Plus, Trash2, Save, ArrowLeft, Sparkles, ExternalLink, Star } from "lucide-react";

const ANN_CATEGORIES = ["Academic", "Event", "Reminder"];

function LoginScreen({ onLogin }) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admin/login", { pin });
      setAdminPin(pin);
      toast.success("Welcome back.");
      onLogin();
    } catch {
      toast.error("Invalid PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-md card-flat p-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-inkMuted mb-8 hover:text-sage"
          data-testid="admin-back-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to site
        </Link>
        <div className="flex items-center gap-2 mb-6">
          <span className="w-9 h-9 rounded-full border border-ink/20 flex items-center justify-center bg-white">
            <Compass className="w-5 h-5 text-sage" strokeWidth={1.5} />
          </span>
          <span className="font-serif text-lg">MLS Compass · Admin</span>
        </div>
        <h1 className="font-serif text-3xl tracking-tight mb-2">Enter admin PIN.</h1>
        <p className="text-sm text-inkMuted mb-6">
          For student officers editing content.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <Input
            type="password"
            placeholder="Admin PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            data-testid="admin-pin-input"
            required
          />
          <Button type="submit" className="w-full" disabled={loading} data-testid="admin-login-btn">
            {loading ? "Checking…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function FAQManager() {
  const [faqs, setFaqs] = useState([]);
  const [draft, setDraft] = useState({ question: "", answer: "", page: "roadmap", order: 0 });

  const load = () => api.get("/faqs").then((r) => setFaqs(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!draft.question || !draft.answer) return toast.error("Question & answer required.");
    try {
      await api.post("/faqs", draft, { headers: adminHeaders() });
      toast.success("FAQ added.");
      setDraft({ question: "", answer: "", page: "roadmap", order: 0 });
      load();
    } catch { toast.error("Failed to add FAQ."); }
  };

  const save = async (f) => {
    try {
      await api.put(`/faqs/${f.id}`, {
        question: f.question, answer: f.answer, page: f.page, order: Number(f.order) || 0,
      }, { headers: adminHeaders() });
      toast.success("Saved.");
      load();
    } catch { toast.error("Save failed."); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      await api.delete(`/faqs/${id}`, { headers: adminHeaders() });
      toast.success("Deleted.");
      load();
    } catch { toast.error("Delete failed."); }
  };

  return (
    <div className="space-y-8">
      <div className="card-flat p-6" data-testid="faq-create-card">
        <h3 className="font-serif text-xl mb-4">Add a new FAQ</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            placeholder="Question"
            value={draft.question}
            onChange={(e) => setDraft({ ...draft, question: e.target.value })}
            data-testid="new-faq-question"
          />
          <div className="flex gap-3">
            <Select value={draft.page} onValueChange={(v) => setDraft({ ...draft, page: v })}>
              <SelectTrigger data-testid="new-faq-page"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="roadmap">Roadmap</SelectItem>
                <SelectItem value="ask-mls">Ask MLS</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Order"
              value={draft.order}
              onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
              data-testid="new-faq-order"
              className="w-28"
            />
          </div>
        </div>
        <Textarea
          className="mt-4"
          rows={3}
          placeholder="Answer"
          value={draft.answer}
          onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
          data-testid="new-faq-answer"
        />
        <Button className="mt-4" onClick={create} data-testid="create-faq-btn">
          <Plus className="w-4 h-4 mr-1" /> Add FAQ
        </Button>
      </div>

      <div className="space-y-3">
        {faqs.map((f, idx) => (
          <div key={f.id} className="card-flat p-5" data-testid={`faq-row-${f.id}`}>
            <div className="grid md:grid-cols-[1fr_180px_100px] gap-3">
              <Input
                value={f.question}
                onChange={(e) => {
                  const next = [...faqs]; next[idx].question = e.target.value; setFaqs(next);
                }}
                data-testid={`edit-faq-q-${f.id}`}
              />
              <Select value={f.page} onValueChange={(v) => {
                const next = [...faqs]; next[idx].page = v; setFaqs(next);
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="roadmap">Roadmap</SelectItem>
                  <SelectItem value="ask-mls">Ask MLS</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={f.order}
                onChange={(e) => {
                  const next = [...faqs]; next[idx].order = Number(e.target.value); setFaqs(next);
                }}
              />
            </div>
            <Textarea
              className="mt-3"
              rows={3}
              value={f.answer}
              onChange={(e) => {
                const next = [...faqs]; next[idx].answer = e.target.value; setFaqs(next);
              }}
              data-testid={`edit-faq-a-${f.id}`}
            />
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => save(f)} data-testid={`save-faq-${f.id}`}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(f.id)} data-testid={`delete-faq-${f.id}`}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuoteManager() {
  const [quotes, setQuotes] = useState([]);
  const [draft, setDraft] = useState({ text: "", attribution: "Upper-Year Student", year_level: "", order: 0 });

  const load = () => api.get("/quotes").then((r) => setQuotes(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!draft.text) return toast.error("Quote text required.");
    try {
      await api.post("/quotes", draft, { headers: adminHeaders() });
      toast.success("Quote added.");
      setDraft({ text: "", attribution: "Upper-Year Student", year_level: "", order: 0 });
      load();
    } catch { toast.error("Failed to add quote."); }
  };

  const save = async (q) => {
    try {
      await api.put(`/quotes/${q.id}`, {
        text: q.text, attribution: q.attribution, year_level: q.year_level || "", order: Number(q.order) || 0,
      }, { headers: adminHeaders() });
      toast.success("Saved.");
      load();
    } catch { toast.error("Save failed."); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this quote?")) return;
    try {
      await api.delete(`/quotes/${id}`, { headers: adminHeaders() });
      toast.success("Deleted.");
      load();
    } catch { toast.error("Delete failed."); }
  };

  const feature = async (id, currentlyFeatured) => {
    try {
      if (currentlyFeatured) {
        await api.post("/quotes/unfeature", {}, { headers: adminHeaders() });
        toast.success("Unpinned featured quote.");
      } else {
        await api.post(`/quotes/${id}/feature`, {}, { headers: adminHeaders() });
        toast.success("Pinned as featured quote on Ask MLS.");
      }
      load();
    } catch { toast.error("Feature action failed."); }
  };

  return (
    <div className="space-y-8">
      <div className="card-flat p-6" data-testid="quote-create-card">
        <h3 className="font-serif text-xl mb-4">Add a new quote</h3>
        <Textarea
          rows={2}
          placeholder="Quote text"
          value={draft.text}
          onChange={(e) => setDraft({ ...draft, text: e.target.value })}
          data-testid="new-quote-text"
        />
        <div className="grid md:grid-cols-[1fr_180px_120px] gap-3 mt-3">
          <Input
            placeholder="Attribution"
            value={draft.attribution}
            onChange={(e) => setDraft({ ...draft, attribution: e.target.value })}
            data-testid="new-quote-attribution"
          />
          <Select value={draft.year_level || "none"} onValueChange={(v) => setDraft({ ...draft, year_level: v === "none" ? "" : v })}>
            <SelectTrigger data-testid="new-quote-year"><SelectValue placeholder="Year level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No year</SelectItem>
              <SelectItem value="2nd Year">2nd Year</SelectItem>
              <SelectItem value="3rd Year">3rd Year</SelectItem>
              <SelectItem value="4th Year">4th Year</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Order"
            value={draft.order}
            onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
          />
        </div>
        <Button className="mt-4" onClick={create} data-testid="create-quote-btn">
          <Plus className="w-4 h-4 mr-1" /> Add quote
        </Button>
      </div>

      <div className="space-y-3">
        {quotes.map((q, idx) => (
          <div key={q.id} className={`card-flat p-5 ${q.is_featured ? "border-terracotta/50 bg-terracotta-light/20" : ""}`} data-testid={`quote-row-${q.id}`}>
            {q.is_featured && (
              <p className="font-mono text-[10px] tracking-[0.24em] uppercase text-terracotta-dark mb-2 flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" strokeWidth={1.75} /> Featured on Ask MLS
              </p>
            )}
            <Textarea
              rows={2}
              value={q.text}
              onChange={(e) => {
                const next = [...quotes]; next[idx].text = e.target.value; setQuotes(next);
              }}
              data-testid={`edit-quote-text-${q.id}`}
            />
            <div className="grid md:grid-cols-[1fr_180px_100px] gap-3 mt-3">
              <Input
                value={q.attribution}
                onChange={(e) => {
                  const next = [...quotes]; next[idx].attribution = e.target.value; setQuotes(next);
                }}
              />
              <Select
                value={q.year_level || "none"}
                onValueChange={(v) => {
                  const next = [...quotes]; next[idx].year_level = v === "none" ? "" : v; setQuotes(next);
                }}
              >
                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No year</SelectItem>
                  <SelectItem value="2nd Year">2nd Year</SelectItem>
                  <SelectItem value="3rd Year">3rd Year</SelectItem>
                  <SelectItem value="4th Year">4th Year</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={q.order}
                onChange={(e) => {
                  const next = [...quotes]; next[idx].order = Number(e.target.value); setQuotes(next);
                }}
              />
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <Button size="sm" variant="secondary" onClick={() => save(q)} data-testid={`save-quote-${q.id}`}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button
                size="sm"
                variant={q.is_featured ? "default" : "outline"}
                onClick={() => feature(q.id, q.is_featured)}
                data-testid={`feature-quote-${q.id}`}
                className={q.is_featured ? "bg-terracotta hover:bg-terracotta-dark text-white" : ""}
              >
                <Star className={`w-4 h-4 mr-1 ${q.is_featured ? "fill-current" : ""}`} />
                {q.is_featured ? "Unpin" : "Pin as featured"}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(q.id)} data-testid={`delete-quote-${q.id}`}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContributionPublisher() {
  const [text, setText] = useState("");
  const [attribution, setAttribution] = useState("Upper-Year Student");
  const [yearLevel, setYearLevel] = useState("");
  const [recent, setRecent] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [contributionFormUrl, setContributionFormUrl] = useState("");

  const load = () => api.get("/quotes").then((r) => setRecent(r.data.slice(-5).reverse()));

  useEffect(() => {
    load();
    api.get("/settings").then((r) => setContributionFormUrl(r.data.contribution_form_url || ""));
  }, []);

  const publish = async () => {
    if (!text.trim()) return toast.error("Paste a contribution first.");
    setPublishing(true);
    try {
      const maxOrder = recent.reduce((m, q) => Math.max(m, q.order || 0), 0);
      await api.post(
        "/quotes",
        {
          text: text.trim(),
          attribution: attribution.trim() || "Upper-Year Student",
          year_level: yearLevel,
          order: maxOrder + 1,
        },
        { headers: adminHeaders() }
      );
      toast.success("Published to the quote wall.");
      setText("");
      setAttribution("Upper-Year Student");
      setYearLevel("");
      load();
    } catch {
      toast.error("Publish failed.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-flat p-6 md:p-8" data-testid="contribution-publish-card">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
          <div>
            <p className="overline mb-2">Curated Publish</p>
            <h3 className="font-serif text-2xl tracking-tight">
              Publish a contribution.
            </h3>
            <p className="text-sm text-inkMuted mt-2 max-w-xl leading-relaxed">
              Review a submission from the Google Form / Sheet, paste the text
              below, and click Publish. It appears immediately on the Ask MLS
              quote wall.
            </p>
          </div>
          {contributionFormUrl && (
            <a
              href={contributionFormUrl.replace("?embedded=true", "").replace(/\/viewform.*/, "/edit")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-sage hover:text-sage-dark shrink-0"
              data-testid="open-form-responses"
            >
              <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
              Open form
            </a>
          )}
        </div>

        <Textarea
          className="mt-4"
          rows={4}
          placeholder="Paste the contribution text here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          data-testid="contribution-text-input"
        />
        <div className="grid md:grid-cols-[1fr_180px_auto] gap-3 mt-3 items-center">
          <Input
            placeholder="Attribution"
            value={attribution}
            onChange={(e) => setAttribution(e.target.value)}
            data-testid="contribution-attribution-input"
          />
          <Select value={yearLevel || "none"} onValueChange={(v) => setYearLevel(v === "none" ? "" : v)}>
            <SelectTrigger data-testid="contribution-year-select">
              <SelectValue placeholder="Year level (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No year</SelectItem>
              <SelectItem value="2nd Year">2nd Year</SelectItem>
              <SelectItem value="3rd Year">3rd Year</SelectItem>
              <SelectItem value="4th Year">4th Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={publish}
            disabled={publishing || !text.trim()}
            data-testid="publish-contribution-btn"
            className="bg-sage hover:bg-sage-dark text-white"
          >
            <Sparkles className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
            {publishing ? "Publishing…" : "Publish to wall"}
          </Button>
        </div>
      </div>

      <div>
        <p className="overline mb-3">Recently published</p>
        <div className="space-y-2">
          {recent.map((q) => (
            <div key={q.id} className="card-flat p-4" data-testid={`recent-quote-${q.id}`}>
              <p className="font-serif italic text-base leading-snug">"{q.text}"</p>
              <p className="mt-2 font-mono text-[10px] tracking-[0.2em] uppercase text-inkMuted">
                — {q.attribution}
                {q.year_level && <span className="text-sage"> · {q.year_level}</span>}
              </p>
            </div>
          ))}
          {recent.length === 0 && (
            <p className="text-sm text-inkMuted">No quotes yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AnnouncementManager() {
  const [rows, setRows] = useState([]);
  const today = new Date().toISOString().slice(0, 10);
  const [draft, setDraft] = useState({ title: "", body: "", date: today, source: "Society of United Medical Laboratory Science", category: "Reminder" });

  const load = () => api.get("/announcements").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!draft.title || !draft.body || !draft.date) return toast.error("Title, body, and date required.");
    try {
      await api.post("/announcements", draft, { headers: adminHeaders() });
      toast.success("Announcement posted.");
      setDraft({ title: "", body: "", date: today, source: draft.source, category: "Reminder" });
      load();
    } catch { toast.error("Failed to post."); }
  };

  const save = async (a) => {
    try {
      await api.put(`/announcements/${a.id}`, {
        title: a.title, body: a.body, date: a.date, source: a.source, category: a.category || "Reminder",
      }, { headers: adminHeaders() });
      toast.success("Saved.");
      load();
    } catch { toast.error("Save failed."); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`, { headers: adminHeaders() });
      toast.success("Deleted.");
      load();
    } catch { toast.error("Delete failed."); }
  };

  return (
    <div className="space-y-8">
      <div className="card-flat p-6" data-testid="ann-create-card">
        <h3 className="font-serif text-xl mb-4">Post an announcement</h3>
        <div className="grid md:grid-cols-[1fr_180px_180px] gap-3">
          <Input
            placeholder="Title"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            data-testid="new-ann-title"
          />
          <Input
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            data-testid="new-ann-date"
          />
          <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v })}>
            <SelectTrigger data-testid="new-ann-category"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ANN_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea
          className="mt-3"
          rows={3}
          placeholder="Body"
          value={draft.body}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          data-testid="new-ann-body"
        />
        <Input
          className="mt-3"
          placeholder="Source (org / office)"
          value={draft.source}
          onChange={(e) => setDraft({ ...draft, source: e.target.value })}
          data-testid="new-ann-source"
        />
        <Button className="mt-4" onClick={create} data-testid="create-ann-btn">
          <Plus className="w-4 h-4 mr-1" /> Post announcement
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map((a, idx) => (
          <div key={a.id} className="card-flat p-5" data-testid={`ann-row-${a.id}`}>
            <div className="grid md:grid-cols-[1fr_180px_180px] gap-3">
              <Input
                value={a.title}
                onChange={(e) => {
                  const next = [...rows]; next[idx].title = e.target.value; setRows(next);
                }}
              />
              <Input
                type="date"
                value={a.date?.slice(0, 10) || ""}
                onChange={(e) => {
                  const next = [...rows]; next[idx].date = e.target.value; setRows(next);
                }}
              />
              <Select
                value={a.category || "Reminder"}
                onValueChange={(v) => {
                  const next = [...rows]; next[idx].category = v; setRows(next);
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ANN_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              className="mt-3"
              rows={3}
              value={a.body}
              onChange={(e) => {
                const next = [...rows]; next[idx].body = e.target.value; setRows(next);
              }}
            />
            <Input
              className="mt-3"
              value={a.source}
              onChange={(e) => {
                const next = [...rows]; next[idx].source = e.target.value; setRows(next);
              }}
            />
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => save(a)} data-testid={`save-ann-${a.id}`}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(a.id)} data-testid={`delete-ann-${a.id}`}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkManager() {
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState({ label: "", url: "", note: "", section: "quick", order: 0 });

  const load = () => api.get("/links").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!draft.label || !draft.url) return toast.error("Label and URL required.");
    try {
      await api.post("/links", draft, { headers: adminHeaders() });
      toast.success("Link added.");
      setDraft({ label: "", url: "", note: "", section: draft.section, order: 0 });
      load();
    } catch { toast.error("Failed to add link."); }
  };

  const save = async (l) => {
    try {
      await api.put(`/links/${l.id}`, {
        label: l.label, url: l.url, note: l.note, section: l.section, order: Number(l.order) || 0,
      }, { headers: adminHeaders() });
      toast.success("Saved.");
      load();
    } catch { toast.error("Save failed."); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this link?")) return;
    try {
      await api.delete(`/links/${id}`, { headers: adminHeaders() });
      toast.success("Deleted.");
      load();
    } catch { toast.error("Delete failed."); }
  };

  return (
    <div className="space-y-8">
      <div className="card-flat p-6" data-testid="link-create-card">
        <h3 className="font-serif text-xl mb-4">Add a new link</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <Input
            placeholder="Label (e.g. Student Portal)"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            data-testid="new-link-label"
          />
          <Input
            placeholder="URL (https://...)"
            value={draft.url}
            onChange={(e) => setDraft({ ...draft, url: e.target.value })}
            data-testid="new-link-url"
          />
        </div>
        <div className="grid md:grid-cols-[1fr_200px_100px] gap-3 mt-3">
          <Input
            placeholder="Short note (optional)"
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          />
          <Select value={draft.section} onValueChange={(v) => setDraft({ ...draft, section: v })}>
            <SelectTrigger data-testid="new-link-section"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="quick">Quick Links (Home)</SelectItem>
              <SelectItem value="useful">Useful Links (Resource Hub)</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Order"
            value={draft.order}
            onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
          />
        </div>
        <Button className="mt-4" onClick={create} data-testid="create-link-btn">
          <Plus className="w-4 h-4 mr-1" /> Add link
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map((l, idx) => (
          <div key={l.id} className="card-flat p-5" data-testid={`link-row-${l.id}`}>
            <div className="grid md:grid-cols-2 gap-3">
              <Input
                value={l.label}
                onChange={(e) => {
                  const next = [...rows]; next[idx].label = e.target.value; setRows(next);
                }}
              />
              <Input
                value={l.url}
                onChange={(e) => {
                  const next = [...rows]; next[idx].url = e.target.value; setRows(next);
                }}
              />
            </div>
            <div className="grid md:grid-cols-[1fr_200px_100px] gap-3 mt-3">
              <Input
                value={l.note}
                onChange={(e) => {
                  const next = [...rows]; next[idx].note = e.target.value; setRows(next);
                }}
              />
              <Select value={l.section} onValueChange={(v) => {
                const next = [...rows]; next[idx].section = v; setRows(next);
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick Links (Home)</SelectItem>
                  <SelectItem value="useful">Useful Links (Resource Hub)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={l.order}
                onChange={(e) => {
                  const next = [...rows]; next[idx].order = Number(e.target.value); setRows(next);
                }}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => save(l)} data-testid={`save-link-${l.id}`}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(l.id)} data-testid={`delete-link-${l.id}`}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotoManager() {
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState({ image_url: "", caption: "", submitter: "", year: "", order: 0 });

  const load = () => api.get("/photos").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!draft.image_url) return toast.error("Image URL is required.");
    try {
      await api.post("/photos", draft, { headers: adminHeaders() });
      toast.success("Photo added to the gallery.");
      setDraft({ image_url: "", caption: "", submitter: "", year: "", order: 0 });
      load();
    } catch { toast.error("Failed to add photo."); }
  };

  const save = async (p) => {
    try {
      await api.put(`/photos/${p.id}`, {
        image_url: p.image_url, caption: p.caption, submitter: p.submitter,
        year: p.year, order: Number(p.order) || 0,
      }, { headers: adminHeaders() });
      toast.success("Saved.");
      load();
    } catch { toast.error("Save failed."); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      await api.delete(`/photos/${id}`, { headers: adminHeaders() });
      toast.success("Deleted.");
      load();
    } catch { toast.error("Delete failed."); }
  };

  return (
    <div className="space-y-8">
      <div className="card-flat p-6" data-testid="photo-create-card">
        <h3 className="font-serif text-xl mb-4">Add a new photo</h3>
        <p className="text-xs text-inkMuted mb-4">
          Paste a direct image URL. For Google Drive: right-click the file → Share → Copy link, then use{" "}
          <code className="font-mono">https://drive.google.com/uc?id=&lt;FILE_ID&gt;</code>. Facebook / Instagram images may block hotlinking; upload to a public host.
        </p>
        <Input
          placeholder="Image URL (https://…)"
          value={draft.image_url}
          onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
          data-testid="new-photo-url"
        />
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          <Input
            placeholder="Submitter (e.g. Juan D., '22)"
            value={draft.submitter}
            onChange={(e) => setDraft({ ...draft, submitter: e.target.value })}
            data-testid="new-photo-submitter"
          />
          <Input
            placeholder="Year / Batch (e.g. Batch 2022)"
            value={draft.year}
            onChange={(e) => setDraft({ ...draft, year: e.target.value })}
            data-testid="new-photo-year"
          />
          <Input
            type="number"
            placeholder="Order"
            value={draft.order}
            onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
          />
        </div>
        <Textarea
          className="mt-3"
          rows={2}
          placeholder="Caption (optional)"
          value={draft.caption}
          onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
          data-testid="new-photo-caption"
        />

        {draft.image_url && (
          <div className="mt-4">
            <p className="overline mb-2">Preview</p>
            <div className="rounded-xl overflow-hidden border border-ink/10 bg-white max-w-sm">
              <img
                src={draft.image_url}
                alt="Preview"
                className="w-full h-auto block"
                onError={(e) => { e.currentTarget.style.opacity = "0.2"; }}
              />
            </div>
          </div>
        )}

        <Button className="mt-4" onClick={create} data-testid="create-photo-btn">
          <Plus className="w-4 h-4 mr-1" /> Add to gallery
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map((p, idx) => (
          <div key={p.id} className="card-flat p-5" data-testid={`photo-row-${p.id}`}>
            <div className="grid md:grid-cols-[160px_1fr] gap-4">
              <div className="rounded-lg overflow-hidden border border-ink/10 bg-white aspect-square">
                <img
                  src={p.image_url}
                  alt={p.caption || "photo"}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.opacity = "0.2"; }}
                />
              </div>
              <div>
                <Input
                  value={p.image_url}
                  onChange={(e) => {
                    const next = [...rows]; next[idx].image_url = e.target.value; setRows(next);
                  }}
                />
                <div className="grid md:grid-cols-3 gap-3 mt-3">
                  <Input
                    value={p.submitter}
                    onChange={(e) => {
                      const next = [...rows]; next[idx].submitter = e.target.value; setRows(next);
                    }}
                  />
                  <Input
                    value={p.year}
                    onChange={(e) => {
                      const next = [...rows]; next[idx].year = e.target.value; setRows(next);
                    }}
                  />
                  <Input
                    type="number"
                    value={p.order}
                    onChange={(e) => {
                      const next = [...rows]; next[idx].order = Number(e.target.value); setRows(next);
                    }}
                  />
                </div>
                <Textarea
                  className="mt-3"
                  rows={2}
                  value={p.caption}
                  onChange={(e) => {
                    const next = [...rows]; next[idx].caption = e.target.value; setRows(next);
                  }}
                />
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => save(p)} data-testid={`save-photo-${p.id}`}>
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(p.id)} data-testid={`delete-photo-${p.id}`}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsManager() {
  const [s, setS] = useState({ ask_form_url: "", check_in_form_url: "", pulse_sheet_url: "", contribution_form_url: "", photo_form_url: "", org_name: "" });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get("/settings").then((r) => { setS(r.data); setLoaded(true); });
  }, []);

  const save = async () => {
    if (!loaded) return;
    try {
      await api.put("/settings", s, { headers: adminHeaders() });
      toast.success("Settings saved.");
    } catch { toast.error("Save failed."); }
  };

  return (
    <div className="card-flat p-6 space-y-4" data-testid="settings-card">
      <h3 className="font-serif text-xl">Embeds & organization</h3>

      <div>
        <p className="text-sm font-medium mb-1">Ask MLS — Google Form URL</p>
        <p className="text-xs text-inkMuted mb-2">
          Use the embed URL (…/viewform?embedded=true).
        </p>
        <Input
          value={s.ask_form_url}
          onChange={(e) => setS({ ...s, ask_form_url: e.target.value })}
          data-testid="setting-ask-form-url"
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-1">Are-We-Okay Check-in — Google Form URL</p>
        <p className="text-xs text-inkMuted mb-2">
          Paste the embed URL (…/viewform?embedded=true).
        </p>
        <Input
          value={s.check_in_form_url}
          onChange={(e) => setS({ ...s, check_in_form_url: e.target.value })}
          data-testid="setting-checkin-form-url"
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-1">Batch Pulse — Google Sheet / Data Studio URL</p>
        <p className="text-xs text-inkMuted mb-2">
          Paste the published sheet or Looker Studio embed URL.
        </p>
        <Input
          value={s.pulse_sheet_url}
          onChange={(e) => setS({ ...s, pulse_sheet_url: e.target.value })}
          data-testid="setting-pulse-url"
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-1">Upper-Year Contribution Form URL</p>
        <p className="text-xs text-inkMuted mb-2">
          Public form where upperclassmen submit their "wish I knew" quotes. Admins approve manually via the Quotes tab.
        </p>
        <Input
          value={s.contribution_form_url}
          onChange={(e) => setS({ ...s, contribution_form_url: e.target.value })}
          data-testid="setting-contribution-form-url"
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-1">Photo Submission Form URL</p>
        <p className="text-xs text-inkMuted mb-2">
          Public form for seniors to submit old photos. Admins publish approved photos via the Photos tab.
        </p>
        <Input
          value={s.photo_form_url}
          onChange={(e) => setS({ ...s, photo_form_url: e.target.value })}
          data-testid="setting-photo-form-url"
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-1">Organization name</p>
        <Input
          value={s.org_name}
          onChange={(e) => setS({ ...s, org_name: e.target.value })}
          data-testid="setting-org-name"
        />
      </div>

      <Button onClick={save} disabled={!loaded} data-testid="save-settings-btn">
        <Save className="w-4 h-4 mr-1" /> {loaded ? "Save settings" : "Loading…"}
      </Button>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(!!getAdminPin());
  const navigate = useNavigate();

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const logout = () => {
    clearAdminPin();
    setAuthed(false);
    toast.success("Signed out.");
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-ink/10 bg-paper/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center bg-white">
              <Compass className="w-4 h-4 text-sage" strokeWidth={1.5} />
            </span>
            <span className="font-serif text-base">MLS Compass · Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} data-testid="admin-view-site">
              View site
            </Button>
            <Button variant="secondary" size="sm" onClick={logout} data-testid="admin-logout">
              <LogOut className="w-4 h-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10">
        <p className="overline mb-3">Content management</p>
        <h1 className="font-serif text-4xl tracking-tight mb-8">Manage MLS Compass</h1>

        <Tabs defaultValue="announcements">
          <TabsList data-testid="admin-tabs" className="flex-wrap">
            <TabsTrigger value="announcements" data-testid="tab-announcements">Announcements</TabsTrigger>
            <TabsTrigger value="contributions" data-testid="tab-contributions">Contributions</TabsTrigger>
            <TabsTrigger value="faqs" data-testid="tab-faqs">FAQs</TabsTrigger>
            <TabsTrigger value="quotes" data-testid="tab-quotes">Upper-Year Quotes</TabsTrigger>
            <TabsTrigger value="links" data-testid="tab-links">Links</TabsTrigger>
            <TabsTrigger value="photos" data-testid="tab-photos">Photos</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="announcements" className="mt-6">
            <AnnouncementManager />
          </TabsContent>
          <TabsContent value="contributions" className="mt-6">
            <ContributionPublisher />
          </TabsContent>
          <TabsContent value="faqs" className="mt-6">
            <FAQManager />
          </TabsContent>
          <TabsContent value="quotes" className="mt-6">
            <QuoteManager />
          </TabsContent>
          <TabsContent value="links" className="mt-6">
            <LinkManager />
          </TabsContent>
          <TabsContent value="photos" className="mt-6">
            <PhotoManager />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <SettingsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
