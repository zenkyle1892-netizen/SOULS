"""MLS Compass Iteration 3 backend tests: quote year_level+feature, announcement category, settings pulse url."""
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


# ---------- Quote year_level + feature ----------
class TestQuoteYearLevelAndFeature:
    created_ids = []

    @classmethod
    def teardown_class(cls):
        for qid in cls.created_ids:
            requests.delete(f"{API}/quotes/{qid}", headers=AUTH)
        # ensure none featured at the end
        requests.post(f"{API}/quotes/unfeature", headers=AUTH)

    def test_create_quote_with_year_level(self):
        payload = {"text": "TEST_iter3 2nd year quote", "attribution": "TEST Student",
                   "year_level": "2nd Year", "order": 900}
        r = requests.post(f"{API}/quotes", json=payload, headers=AUTH)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["year_level"] == "2nd Year"
        assert data["is_featured"] is False
        assert "id" in data
        self.__class__.created_ids.append(data["id"])
        # persistence
        r2 = requests.get(f"{API}/quotes")
        assert r2.status_code == 200
        found = next((q for q in r2.json() if q["id"] == data["id"]), None)
        assert found is not None
        assert found["year_level"] == "2nd Year"

    def test_create_quote_empty_year_level(self):
        r = requests.post(f"{API}/quotes",
                          json={"text": "TEST_iter3 no year", "attribution": "TEST", "year_level": "", "order": 901},
                          headers=AUTH)
        assert r.status_code == 200
        data = r.json()
        assert data["year_level"] == ""
        self.__class__.created_ids.append(data["id"])

    def test_update_quote_year_level(self):
        r = requests.post(f"{API}/quotes",
                          json={"text": "TEST_iter3 upd", "attribution": "TEST", "order": 902},
                          headers=AUTH)
        qid = r.json()["id"]
        self.__class__.created_ids.append(qid)
        r2 = requests.put(f"{API}/quotes/{qid}", json={"year_level": "3rd Year"}, headers=AUTH)
        assert r2.status_code == 200
        assert r2.json()["year_level"] == "3rd Year"
        # persistence
        r3 = requests.get(f"{API}/quotes")
        found = next(q for q in r3.json() if q["id"] == qid)
        assert found["year_level"] == "3rd Year"

    def test_feature_requires_auth(self):
        # need an id first
        quotes = requests.get(f"{API}/quotes").json()
        qid = quotes[0]["id"]
        r = requests.post(f"{API}/quotes/{qid}/feature")
        assert r.status_code == 401

    def test_unfeature_requires_auth(self):
        r = requests.post(f"{API}/quotes/unfeature")
        assert r.status_code == 401

    def test_feature_sets_only_one(self):
        # unfeature all first
        requests.post(f"{API}/quotes/unfeature", headers=AUTH)
        quotes = requests.get(f"{API}/quotes").json()
        assert len(quotes) >= 2
        q1_id = quotes[0]["id"]
        q2_id = quotes[1]["id"]

        # feature q1
        r = requests.post(f"{API}/quotes/{q1_id}/feature", headers=AUTH)
        assert r.status_code == 200
        assert r.json()["is_featured"] is True

        all_q = requests.get(f"{API}/quotes").json()
        featured = [q for q in all_q if q["is_featured"]]
        assert len(featured) == 1
        assert featured[0]["id"] == q1_id

        # feature q2 -- q1 must be unset
        r2 = requests.post(f"{API}/quotes/{q2_id}/feature", headers=AUTH)
        assert r2.status_code == 200
        all_q2 = requests.get(f"{API}/quotes").json()
        featured2 = [q for q in all_q2 if q["is_featured"]]
        assert len(featured2) == 1
        assert featured2[0]["id"] == q2_id

        # unfeature all
        r3 = requests.post(f"{API}/quotes/unfeature", headers=AUTH)
        assert r3.status_code == 200
        all_q3 = requests.get(f"{API}/quotes").json()
        assert not any(q["is_featured"] for q in all_q3)

    def test_feature_nonexistent_quote(self):
        r = requests.post(f"{API}/quotes/nonexistent-id-xyz/feature", headers=AUTH)
        assert r.status_code == 404


# ---------- Announcements: category ----------
class TestAnnouncementCategory:
    created_ids = []

    @classmethod
    def teardown_class(cls):
        for aid in cls.created_ids:
            requests.delete(f"{API}/announcements/{aid}", headers=AUTH)

    def test_create_with_category(self):
        for cat in ["Academic", "Event", "Reminder"]:
            r = requests.post(f"{API}/announcements",
                              json={"title": f"TEST_iter3_{cat}", "body": "b",
                                    "date": "2026-01-15", "category": cat},
                              headers=AUTH)
            assert r.status_code == 200, r.text
            data = r.json()
            assert data["category"] == cat
            self.__class__.created_ids.append(data["id"])

    def test_update_category(self):
        r = requests.post(f"{API}/announcements",
                          json={"title": "TEST_iter3_upd", "body": "b",
                                "date": "2026-01-15", "category": "Reminder"},
                          headers=AUTH)
        aid = r.json()["id"]
        self.__class__.created_ids.append(aid)
        r2 = requests.put(f"{API}/announcements/{aid}", json={"category": "Event"}, headers=AUTH)
        assert r2.status_code == 200
        assert r2.json()["category"] == "Event"
        # persistence
        r3 = requests.get(f"{API}/announcements")
        found = next(a for a in r3.json() if a["id"] == aid)
        assert found["category"] == "Event"

    def test_list_returns_category(self):
        r = requests.get(f"{API}/announcements")
        assert r.status_code == 200
        for a in r.json():
            assert "category" in a


# ---------- Settings pulse url ----------
class TestSettingsPulse:
    def test_pulse_sheet_url_uses_pubhtml(self):
        r = requests.get(f"{API}/settings")
        assert r.status_code == 200
        assert "/pubhtml" in r.json()["pulse_sheet_url"]
