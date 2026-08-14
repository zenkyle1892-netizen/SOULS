"""MLS Compass Iteration 4 backend tests: ICTC links + featured 'Ask questions early' quote."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL')
if not BASE_URL:
    with open('/app/frontend/.env') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                BASE_URL = line.split('=', 1)[1].strip()
                break
BASE_URL = BASE_URL.rstrip('/')
API = f"{BASE_URL}/api"
AUTH = {"X-Admin-Pin": "mls2026"}


class TestICTCLinks:
    def test_quick_links_has_ictc(self):
        r = requests.get(f"{API}/links", params={"section": "quick"})
        assert r.status_code == 200
        links = r.json()
        ictc = [l for l in links if "ICTC" in l.get("label", "") or "Institutional Email" in l.get("label", "")]
        assert len(ictc) >= 1, f"No ICTC link found in quick section. Got: {[l.get('label') for l in links]}"
        found = ictc[0]
        assert found["label"] == "Request Institutional Email (ICTC)", found["label"]
        assert found["url"].startswith("mailto:ictc@spcdavao.edu.ph"), found["url"]

    def test_useful_links_has_ictc(self):
        r = requests.get(f"{API}/links", params={"section": "useful"})
        assert r.status_code == 200
        links = r.json()
        ictc = [l for l in links if "ICTC" in l.get("label", "") or "Institutional Email" in l.get("label", "")]
        assert len(ictc) >= 1, f"No ICTC link in useful section. Got: {[l.get('label') for l in links]}"
        assert ictc[0]["url"].startswith("mailto:ictc@spcdavao.edu.ph"), ictc[0]["url"]


class TestFeaturedQuote:
    def test_exactly_one_featured_ask_questions_early(self):
        r = requests.get(f"{API}/quotes")
        assert r.status_code == 200
        quotes = r.json()
        featured = [q for q in quotes if q.get("is_featured")]
        assert len(featured) == 1, f"Expected exactly 1 featured quote, got {len(featured)}: {[q.get('text','')[:60] for q in featured]}"
        fq = featured[0]
        assert "ask questions early" in fq["text"].lower(), fq["text"]
        assert fq.get("year_level") == "3rd Year", fq.get("year_level")
