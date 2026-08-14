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
import { Compass, LogOut, Plus, Trash2, Save, ArrowLeft } from "lucide-react";

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
  const [draft, setDraft] = useState({ text: "", attribution: "Upper-Year Student", order: 0 });

  const load = () => api.get("/quotes").then((r) => setQuotes(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!draft.text) return toast.error("Quote text required.");
    try {
      await api.post("/quotes", draft, { headers: adminHeaders() });
      toast.success("Quote added.");
      setDraft({ text: "", attribution: "Upper-Year Student", order: 0 });
      load();
    } catch { toast.error("Failed to add quote."); }
  };

  const save = async (q) => {
    try {
      await api.put(`/quotes/${q.id}`, {
        text: q.text, attribution: q.attribution, order: Number(q.order) || 0,
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
        <div className="grid md:grid-cols-[1fr_120px] gap-3 mt-3">
          <Input
            placeholder="Attribution"
            value={draft.attribution}
            onChange={(e) => setDraft({ ...draft, attribution: e.target.value })}
            data-testid="new-quote-attribution"
          />
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
          <div key={q.id} className="card-flat p-5" data-testid={`quote-row-${q.id}`}>
            <Textarea
              rows={2}
              value={q.text}
              onChange={(e) => {
                const next = [...quotes]; next[idx].text = e.target.value; setQuotes(next);
              }}
              data-testid={`edit-quote-text-${q.id}`}
            />
            <div className="grid md:grid-cols-[1fr_120px] gap-3 mt-3">
              <Input
                value={q.attribution}
                onChange={(e) => {
                  const next = [...quotes]; next[idx].attribution = e.target.value; setQuotes(next);
                }}
              />
              <Input
                type="number"
                value={q.order}
                onChange={(e) => {
                  const next = [...quotes]; next[idx].order = Number(e.target.value); setQuotes(next);
                }}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => save(q)} data-testid={`save-quote-${q.id}`}>
                <Save className="w-4 h-4 mr-1" /> Save
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

function AnnouncementManager() {
  const [rows, setRows] = useState([]);
  const today = new Date().toISOString().slice(0, 10);
  const [draft, setDraft] = useState({ title: "", body: "", date: today, source: "Society of United Medical Laboratory Science" });

  const load = () => api.get("/announcements").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!draft.title || !draft.body || !draft.date) return toast.error("Title, body, and date required.");
    try {
      await api.post("/announcements", draft, { headers: adminHeaders() });
      toast.success("Announcement posted.");
      setDraft({ title: "", body: "", date: today, source: draft.source });
      load();
    } catch { toast.error("Failed to post."); }
  };

  const save = async (a) => {
    try {
      await api.put(`/announcements/${a.id}`, {
        title: a.title, body: a.body, date: a.date, source: a.source,
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
        <div className="grid md:grid-cols-[1fr_180px] gap-3">
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
            <div className="grid md:grid-cols-[1fr_180px] gap-3">
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

function SettingsManager() {
  const [s, setS] = useState({ ask_form_url: "", check_in_form_url: "", pulse_sheet_url: "", contribution_form_url: "", org_name: "" });
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
            <TabsTrigger value="faqs" data-testid="tab-faqs">FAQs</TabsTrigger>
            <TabsTrigger value="quotes" data-testid="tab-quotes">Upper-Year Quotes</TabsTrigger>
            <TabsTrigger value="links" data-testid="tab-links">Links</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="announcements" className="mt-6">
            <AnnouncementManager />
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
          <TabsContent value="settings" className="mt-6">
            <SettingsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
