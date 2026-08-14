import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import { api } from "@/lib/api";

import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Roadmap from "@/pages/Roadmap";
import Resources from "@/pages/Resources";
import Support from "@/pages/Support";
import AskMLS from "@/pages/AskMLS";
import Gallery from "@/pages/Gallery";
import Admin from "@/pages/Admin";

function getSessionId() {
  let s = localStorage.getItem("mls_session_id");
  if (!s) {
    s = (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("mls_session_id", s);
  }
  return s;
}

function ScrollAndTrack() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (pathname.startsWith("/admin")) return;
    api.post("/visits/log", { path: pathname, session_id: getSessionId() }).catch(() => {});
  }, [pathname]);
  return null;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollAndTrack />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/support" element={<Support />} />
            <Route path="/ask" element={<AskMLS />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
