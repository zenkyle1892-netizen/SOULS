"""MLS Compass Iteration 2 backend API tests."""
import os
import pytest
import requests

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/') if os.environ.get('REACT_APP_BACKEND_URL') else None
if not BASE_URL:
    # fallback: read from frontend .env
    with open('/app/frontend/.env') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                BASE_URL = line.split('=', 1)[1].strip().rstrip('/')
                break

API = f"{BASE_URL}/api"
PIN = "mls2026"
AUTH = {"X-Admin-Pin": PIN}


# ---------- Announcements ----------
class TestAnnouncements:
    def test_list_has_seed(self):
        r = requests.get(f"{API}/announcements")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        titles = [d["title"] for d in data]
        assert any("Welcome to MLS Compass" in t for t in titles)

    def test_create_requires_auth(self):
        r = requests.post(f"{API}/announcements", json={
            "title": "TEST_no_auth", "body": "x", "date": "2026-01-01"
        })
        assert r.status_code == 401

    def test_crud_flow(self):
        payload = {"title": "TEST_ann", "body": "test body", "date": "2026-01-15", "source": "TEST"}
        r = requests.post(f"{API}/announcements", json=payload, headers=AUTH)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["title"] == "TEST_ann"
        aid = created["id"]
        # verify persistence
        r2 = requests.get(f"{API}/announcements")
        assert any(a["id"] == aid for a in r2.json())
        # update
        r3 = requests.put(f"{API}/announcements/{aid}", json={"title": "TEST_ann_upd"}, headers=AUTH)
        assert r3.status_code == 200
        assert r3.json()["title"] == "TEST_ann_upd"
        # delete
        r4 = requests.delete(f"{API}/announcements/{aid}", headers=AUTH)
        assert r4.status_code == 200
        r5 = requests.get(f"{API}/announcements")
        assert not any(a["id"] == aid for a in r5.json())


# ---------- Links ----------
class TestLinks:
    def test_list_all(self):
        r = requests.get(f"{API}/links")
        assert r.status_code == 200
        assert len(r.json()) >= 12

    def test_filter_quick(self):
        r = requests.get(f"{API}/links", params={"section": "quick"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 6
        assert all(d["section"] == "quick" for d in data)
        assert any("myportal.spcdavao.edu.ph" in d["url"] for d in data if d["label"] == "Student Portal")

    def test_filter_useful(self):
        r = requests.get(f"{API}/links", params={"section": "useful"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 6
        assert all(d["section"] == "useful" for d in data)

    def test_create_requires_auth(self):
        r = requests.post(f"{API}/links", json={"label": "x", "url": "x", "section": "quick"})
        assert r.status_code == 401

    def test_crud_flow(self):
        payload = {"label": "TEST_link", "url": "https://test.example", "note": "n", "section": "quick", "order": 99}
        r = requests.post(f"{API}/links", json=payload, headers=AUTH)
        assert r.status_code == 200
        lid = r.json()["id"]
        r3 = requests.put(f"{API}/links/{lid}", json={"label": "TEST_link_upd"}, headers=AUTH)
        assert r3.status_code == 200
        assert r3.json()["label"] == "TEST_link_upd"
        r4 = requests.delete(f"{API}/links/{lid}", headers=AUTH)
        assert r4.status_code == 200


# ---------- Settings ----------
class TestSettings:
    def test_get_seeded(self):
        r = requests.get(f"{API}/settings")
        assert r.status_code == 200
        d = r.json()
        assert "docs.google.com/forms" in d["ask_form_url"]

    def test_update_requires_auth(self):
        r = requests.put(f"{API}/settings", json={"check_in_form_url": "https://x"})
        assert r.status_code == 401

    def test_update_persists(self):
        test_url = "https://forms.example.com/checkin"
        pulse = "https://sheets.example.com/pulse"
        r = requests.put(f"{API}/settings",
                         json={"check_in_form_url": test_url, "pulse_sheet_url": pulse},
                         headers=AUTH)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["check_in_form_url"] == test_url
        assert d["pulse_sheet_url"] == pulse
        # verify via GET
        r2 = requests.get(f"{API}/settings")
        assert r2.json()["check_in_form_url"] == test_url
        # cleanup - reset to empty
        requests.put(f"{API}/settings",
                     json={"check_in_form_url": "", "pulse_sheet_url": ""},
                     headers=AUTH)


# ---------- Auth sanity ----------
class TestAuth:
    def test_admin_login_success(self):
        r = requests.post(f"{API}/admin/login", json={"pin": PIN})
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_admin_login_fail(self):
        r = requests.post(f"{API}/admin/login", json={"pin": "wrong"})
        assert r.status_code == 401
