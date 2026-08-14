from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_PIN = os.environ.get('ADMIN_PIN', 'mls-compass-2026')

app = FastAPI(title="MLS Compass API")
api_router = APIRouter(prefix="/api")


# --------- Models ---------
class FAQ(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    page: str  # "roadmap" | "ask-mls"
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class FAQCreate(BaseModel):
    question: str
    answer: str
    page: str
    order: int = 0


class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    page: Optional[str] = None
    order: Optional[int] = None


class Quote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    attribution: str = "Upper-Year Student"
    year_level: str = ""  # "" | "2nd Year" | "3rd Year" | "4th Year"
    is_featured: bool = False
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class QuoteCreate(BaseModel):
    text: str
    attribution: str = "Upper-Year Student"
    year_level: str = ""
    order: int = 0


class QuoteUpdate(BaseModel):
    text: Optional[str] = None
    attribution: Optional[str] = None
    year_level: Optional[str] = None
    order: Optional[int] = None


class AdminLogin(BaseModel):
    pin: str


# --------- Auth dependency ---------
async def require_admin(x_admin_pin: Optional[str] = Header(default=None)):
    if not x_admin_pin or x_admin_pin != ADMIN_PIN:
        raise HTTPException(status_code=401, detail="Invalid admin PIN")
    return True


# --------- Routes ---------
@api_router.get("/")
async def root():
    return {"message": "MLS Compass API"}


@api_router.post("/admin/login")
async def admin_login(payload: AdminLogin):
    if payload.pin != ADMIN_PIN:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    return {"ok": True, "pin": payload.pin}


# --- FAQs ---
@api_router.get("/faqs", response_model=List[FAQ])
async def list_faqs(page: Optional[str] = None):
    query = {"page": page} if page else {}
    docs = await db.faqs.find(query, {"_id": 0}).to_list(500)
    docs.sort(key=lambda d: d.get("order", 0))
    return [FAQ(**d) for d in docs]


@api_router.post("/faqs", response_model=FAQ)
async def create_faq(payload: FAQCreate, _: bool = Depends(require_admin)):
    faq = FAQ(**payload.model_dump())
    await db.faqs.insert_one(faq.model_dump())
    return faq


@api_router.put("/faqs/{faq_id}", response_model=FAQ)
async def update_faq(faq_id: str, payload: FAQUpdate, _: bool = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.faqs.find_one_and_update(
        {"id": faq_id}, {"$set": update}, return_document=True, projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return FAQ(**result)


@api_router.delete("/faqs/{faq_id}")
async def delete_faq(faq_id: str, _: bool = Depends(require_admin)):
    res = await db.faqs.delete_one({"id": faq_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return {"ok": True}


# --- Quotes ---
@api_router.get("/quotes", response_model=List[Quote])
async def list_quotes():
    docs = await db.quotes.find({}, {"_id": 0}).to_list(500)
    docs.sort(key=lambda d: d.get("order", 0))
    return [Quote(**d) for d in docs]


@api_router.post("/quotes", response_model=Quote)
async def create_quote(payload: QuoteCreate, _: bool = Depends(require_admin)):
    q = Quote(**payload.model_dump())
    await db.quotes.insert_one(q.model_dump())
    return q


@api_router.put("/quotes/{quote_id}", response_model=Quote)
async def update_quote(quote_id: str, payload: QuoteUpdate, _: bool = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.quotes.find_one_and_update(
        {"id": quote_id}, {"$set": update}, return_document=True, projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Quote not found")
    return Quote(**result)


@api_router.delete("/quotes/{quote_id}")
async def delete_quote(quote_id: str, _: bool = Depends(require_admin)):
    res = await db.quotes.delete_one({"id": quote_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"ok": True}


@api_router.post("/quotes/{quote_id}/feature", response_model=Quote)
async def feature_quote(quote_id: str, _: bool = Depends(require_admin)):
    # Atomic: unset all is_featured, then set this one
    target = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if not target:
        raise HTTPException(status_code=404, detail="Quote not found")
    await db.quotes.update_many({"is_featured": True}, {"$set": {"is_featured": False}})
    result = await db.quotes.find_one_and_update(
        {"id": quote_id}, {"$set": {"is_featured": True}},
        return_document=True, projection={"_id": 0}
    )
    return Quote(**result)


@api_router.post("/quotes/unfeature", response_model=dict)
async def unfeature_all(_: bool = Depends(require_admin)):
    await db.quotes.update_many({"is_featured": True}, {"$set": {"is_featured": False}})
    return {"ok": True}


# --------- Announcements ---------
class Announcement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    body: str
    date: str  # ISO date string
    source: str = "Society of United Medical Laboratory Science"
    category: str = "Reminder"  # "Academic" | "Event" | "Reminder"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AnnouncementCreate(BaseModel):
    title: str
    body: str
    date: str
    source: str = "Society of United Medical Laboratory Science"
    category: str = "Reminder"


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    date: Optional[str] = None
    source: Optional[str] = None
    category: Optional[str] = None


@api_router.get("/announcements", response_model=List[Announcement])
async def list_announcements():
    docs = await db.announcements.find({}, {"_id": 0}).to_list(500)
    docs.sort(key=lambda d: d.get("date", ""), reverse=True)
    return [Announcement(**d) for d in docs]


@api_router.post("/announcements", response_model=Announcement)
async def create_announcement(payload: AnnouncementCreate, _: bool = Depends(require_admin)):
    a = Announcement(**payload.model_dump())
    await db.announcements.insert_one(a.model_dump())
    return a


@api_router.put("/announcements/{ann_id}", response_model=Announcement)
async def update_announcement(ann_id: str, payload: AnnouncementUpdate, _: bool = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.announcements.find_one_and_update(
        {"id": ann_id}, {"$set": update}, return_document=True, projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return Announcement(**result)


@api_router.delete("/announcements/{ann_id}")
async def delete_announcement(ann_id: str, _: bool = Depends(require_admin)):
    res = await db.announcements.delete_one({"id": ann_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"ok": True}


# --------- Links ---------
class SiteLink(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    label: str
    url: str
    note: str = ""
    section: str  # "quick" or "useful"
    order: int = 0


class SiteLinkCreate(BaseModel):
    label: str
    url: str
    note: str = ""
    section: str
    order: int = 0


class SiteLinkUpdate(BaseModel):
    label: Optional[str] = None
    url: Optional[str] = None
    note: Optional[str] = None
    section: Optional[str] = None
    order: Optional[int] = None


@api_router.get("/links", response_model=List[SiteLink])
async def list_links(section: Optional[str] = None):
    query = {"section": section} if section else {}
    docs = await db.links.find(query, {"_id": 0}).to_list(500)
    docs.sort(key=lambda d: (d.get("section", ""), d.get("order", 0)))
    return [SiteLink(**d) for d in docs]


@api_router.post("/links", response_model=SiteLink)
async def create_link(payload: SiteLinkCreate, _: bool = Depends(require_admin)):
    l = SiteLink(**payload.model_dump())
    await db.links.insert_one(l.model_dump())
    return l


@api_router.put("/links/{link_id}", response_model=SiteLink)
async def update_link(link_id: str, payload: SiteLinkUpdate, _: bool = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.links.find_one_and_update(
        {"id": link_id}, {"$set": update}, return_document=True, projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Link not found")
    return SiteLink(**result)


@api_router.delete("/links/{link_id}")
async def delete_link(link_id: str, _: bool = Depends(require_admin)):
    res = await db.links.delete_one({"id": link_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Link not found")
    return {"ok": True}


# --------- Photos ---------
class Photo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_url: str
    caption: str = ""
    submitter: str = ""
    year: str = ""  # e.g. "Batch 2022" or "2019-2020"
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class PhotoCreate(BaseModel):
    image_url: str
    caption: str = ""
    submitter: str = ""
    year: str = ""
    order: int = 0


class PhotoUpdate(BaseModel):
    image_url: Optional[str] = None
    caption: Optional[str] = None
    submitter: Optional[str] = None
    year: Optional[str] = None
    order: Optional[int] = None


@api_router.get("/photos", response_model=List[Photo])
async def list_photos():
    docs = await db.photos.find({}, {"_id": 0}).to_list(500)
    docs.sort(key=lambda d: (d.get("order", 0), d.get("created_at", "")))
    return [Photo(**d) for d in docs]


@api_router.post("/photos", response_model=Photo)
async def create_photo(payload: PhotoCreate, _: bool = Depends(require_admin)):
    p = Photo(**payload.model_dump())
    await db.photos.insert_one(p.model_dump())
    return p


@api_router.put("/photos/{photo_id}", response_model=Photo)
async def update_photo(photo_id: str, payload: PhotoUpdate, _: bool = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.photos.find_one_and_update(
        {"id": photo_id}, {"$set": update}, return_document=True, projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Photo not found")
    return Photo(**result)


@api_router.delete("/photos/{photo_id}")
async def delete_photo(photo_id: str, _: bool = Depends(require_admin)):
    res = await db.photos.delete_one({"id": photo_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found")
    return {"ok": True}


# --------- Photo Stories ---------
class PhotoStory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    year: str = ""
    cover_image_url: str = ""
    photo_ids: List[str] = Field(default_factory=list)
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class PhotoStoryCreate(BaseModel):
    title: str
    description: str = ""
    year: str = ""
    cover_image_url: str = ""
    photo_ids: List[str] = Field(default_factory=list)
    order: int = 0


class PhotoStoryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    year: Optional[str] = None
    cover_image_url: Optional[str] = None
    photo_ids: Optional[List[str]] = None
    order: Optional[int] = None


@api_router.get("/stories", response_model=List[PhotoStory])
async def list_stories():
    docs = await db.stories.find({}, {"_id": 0}).to_list(500)
    docs.sort(key=lambda d: (d.get("order", 0), d.get("created_at", "")))
    return [PhotoStory(**d) for d in docs]


@api_router.post("/stories", response_model=PhotoStory)
async def create_story(payload: PhotoStoryCreate, _: bool = Depends(require_admin)):
    s = PhotoStory(**payload.model_dump())
    await db.stories.insert_one(s.model_dump())
    return s


@api_router.put("/stories/{story_id}", response_model=PhotoStory)
async def update_story(story_id: str, payload: PhotoStoryUpdate, _: bool = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.stories.find_one_and_update(
        {"id": story_id}, {"$set": update}, return_document=True, projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Story not found")
    return PhotoStory(**result)


@api_router.delete("/stories/{story_id}")
async def delete_story(story_id: str, _: bool = Depends(require_admin)):
    res = await db.stories.delete_one({"id": story_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Story not found")
    return {"ok": True}


# --------- Officers ---------
class Officer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    photo_url: str = ""
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class OfficerCreate(BaseModel):
    name: str
    role: str
    photo_url: str = ""
    order: int = 0


class OfficerUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    photo_url: Optional[str] = None
    order: Optional[int] = None


@api_router.get("/officers", response_model=List[Officer])
async def list_officers():
    docs = await db.officers.find({}, {"_id": 0}).to_list(500)
    docs.sort(key=lambda d: (d.get("order", 0), d.get("created_at", "")))
    return [Officer(**d) for d in docs]


@api_router.post("/officers", response_model=Officer)
async def create_officer(payload: OfficerCreate, _: bool = Depends(require_admin)):
    o = Officer(**payload.model_dump())
    await db.officers.insert_one(o.model_dump())
    return o


@api_router.put("/officers/{officer_id}", response_model=Officer)
async def update_officer(officer_id: str, payload: OfficerUpdate, _: bool = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.officers.find_one_and_update(
        {"id": officer_id}, {"$set": update}, return_document=True, projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Officer not found")
    return Officer(**result)


@api_router.delete("/officers/{officer_id}")
async def delete_officer(officer_id: str, _: bool = Depends(require_admin)):
    res = await db.officers.delete_one({"id": officer_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Officer not found")
    return {"ok": True}


# --------- Analytics ---------
class VisitLog(BaseModel):
    path: str
    session_id: str


@api_router.post("/visits/log")
async def log_visit(payload: VisitLog):
    doc = {
        "id": str(uuid.uuid4()),
        "path": payload.path[:120],
        "session_id": payload.session_id[:64],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.visits.insert_one(doc)
    return {"ok": True}


@api_router.get("/analytics/summary")
async def analytics_summary(_: bool = Depends(require_admin)):
    from collections import Counter
    from datetime import timedelta
    docs = await db.visits.find({}, {"_id": 0}).to_list(20000)

    total = len(docs)
    unique_sessions = len({d.get("session_id", "") for d in docs if d.get("session_id")})

    path_counts = Counter(d.get("path", "/") for d in docs)
    by_path = [
        {"path": p, "count": c}
        for p, c in sorted(path_counts.items(), key=lambda kv: -kv[1])
    ]

    # Last 7 days daily counts (UTC)
    today = datetime.now(timezone.utc).date()
    days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
    day_counts = {d.isoformat(): 0 for d in days}
    for d in docs:
        ts = d.get("timestamp", "")
        if ts[:10] in day_counts:
            day_counts[ts[:10]] += 1
    last_7 = [{"date": k, "count": v} for k, v in day_counts.items()]

    return {
        "total_visits": total,
        "unique_visitors": unique_sessions,
        "by_path": by_path,
        "last_7_days": last_7,
    }


@api_router.get("/analytics/export")
async def analytics_export(days: int = 30, _: bool = Depends(require_admin)):
    from collections import Counter, defaultdict
    from datetime import timedelta
    from fastapi.responses import Response
    import io, csv

    days = max(1, min(days, 365))
    today = datetime.now(timezone.utc).date()
    cutoff = today - timedelta(days=days - 1)
    cutoff_iso = cutoff.isoformat()

    docs = await db.visits.find(
        {"timestamp": {"$gte": cutoff_iso}}, {"_id": 0}
    ).to_list(50000)

    total = len(docs)
    unique_sessions = len({d.get("session_id", "") for d in docs if d.get("session_id")})

    # Daily buckets
    day_visits = {(cutoff + timedelta(days=i)).isoformat(): 0 for i in range(days)}
    day_uniques = defaultdict(set)
    for d in docs:
        day = d.get("timestamp", "")[:10]
        if day in day_visits:
            day_visits[day] += 1
            day_uniques[day].add(d.get("session_id", ""))

    # Per-page
    path_counts = Counter(d.get("path", "/") for d in docs)

    # Build CSV
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["MLS Compass · Analytics Export"])
    w.writerow(["Generated (UTC)", datetime.now(timezone.utc).isoformat()])
    w.writerow(["Window (days)", days])
    w.writerow(["Total visits", total])
    w.writerow(["Unique visitors", unique_sessions])
    w.writerow([])
    w.writerow(["Daily breakdown"])
    w.writerow(["Date", "Visits", "Unique visitors"])
    for day, count in day_visits.items():
        w.writerow([day, count, len(day_uniques[day])])
    w.writerow([])
    w.writerow(["Visits by page"])
    w.writerow(["Path", "Visits"])
    for path, count in sorted(path_counts.items(), key=lambda kv: -kv[1]):
        w.writerow([path, count])

    filename = f"mls-compass-analytics-{today.isoformat()}-{days}d.csv"
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# --------- Settings (single doc, id="site") ---------
class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site"
    ask_form_url: str = ""
    check_in_form_url: str = ""
    pulse_sheet_url: str = ""
    contribution_form_url: str = ""
    photo_form_url: str = ""
    org_name: str = "Society of United Medical Laboratory Science"


class SettingsUpdate(BaseModel):
    ask_form_url: Optional[str] = None
    check_in_form_url: Optional[str] = None
    pulse_sheet_url: Optional[str] = None
    contribution_form_url: Optional[str] = None
    photo_form_url: Optional[str] = None
    org_name: Optional[str] = None


@api_router.get("/settings", response_model=Settings)
async def get_settings():
    doc = await db.settings.find_one({"id": "site"}, {"_id": 0})
    if not doc:
        default = Settings().model_dump()
        await db.settings.insert_one(default)
        return Settings(**default)
    return Settings(**doc)


@api_router.put("/settings", response_model=Settings)
async def update_settings(payload: SettingsUpdate, _: bool = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.settings.update_one({"id": "site"}, {"$set": update}, upsert=True)
    doc = await db.settings.find_one({"id": "site"}, {"_id": 0})
    return Settings(**doc)


# --------- Seed data ---------
SEED_FAQS = [
    # Roadmap FAQs
    {"page": "roadmap", "order": 1, "question": "What if I don't understand the lesson?",
     "answer": "Confusion is normal, especially in the first few weeks. Try reviewing the topic in a different resource (textbook chapter, a short video, or your own notes rewritten in your own words). If it still doesn't click, message a classmate or approach your instructor during consultation hours. The earlier you ask, the easier it stays."},
    {"page": "roadmap", "order": 2, "question": "How do I prepare for laboratory?",
     "answer": "Read the lab manual the night before, not on the way to class. Write a one-page 'flight plan': the objective, the procedure in your own words, key reagents, and expected results. Bring your lab gown, ID, permanent marker, and a small notebook you don't mind getting stained."},
    {"page": "roadmap", "order": 3, "question": "What if I am falling behind?",
     "answer": "First: don't disappear. Reach out to a classmate for missed notes, then talk to your instructor. Most professors are more understanding when you approach them early. If it's affecting your well-being, the guidance office can help you plan a way forward without judgment."},
    {"page": "roadmap", "order": 4, "question": "Who should I approach when I have a concern?",
     "answer": "Academic concerns → your subject instructor or class adviser. Grades or requirements → the MLS department office. Personal or emotional concerns → guidance/counseling. If you're not sure, submit it on the Ask MLS page and a student representative will help route it."},
    {"page": "roadmap", "order": 5, "question": "Is it normal to feel overwhelmed?",
     "answer": "Yes. First-year MLS is a lot — new subjects, new schedule, new people, and the added weight of practical exams. Feeling overwhelmed doesn't mean you're not cut out for this. It means you're adjusting. Talk to someone, rest, and take it one deadline at a time."},
    {"page": "roadmap", "order": 6, "question": "What should I prioritize when several requirements are due?",
     "answer": "Sort them by two questions: (1) which has the highest weight on my grade, and (2) which is due soonest. Start with anything that scores both high. Break large outputs into small 30-minute chunks so you're not staring at a blank page at 2 AM."},

    # Ask MLS FAQs
    {"page": "ask-mls", "order": 1, "question": "Is Ask MLS anonymous?",
     "answer": "Yes. When the Google Form is embedded, it will be set to not collect emails or identifying info unless you choose to include your name. Only the student representatives handling submissions will read them."},
    {"page": "ask-mls", "order": 2, "question": "How long does it take to get a response?",
     "answer": "Most submissions get a response or redirection within 3–5 school days. Time-sensitive concerns (like an exam happening tomorrow) are prioritized."},
    {"page": "ask-mls", "order": 3, "question": "Can I submit more than one question?",
     "answer": "Absolutely. Submit each one separately so it's easier to track and route to the right office."},
    {"page": "ask-mls", "order": 4, "question": "What if my question is about a specific instructor?",
     "answer": "Submit it in the 'Student Concerns' category. Concerns involving specific people are handled with discretion and, when needed, forwarded to the appropriate faculty adviser or department office."},
    {"page": "ask-mls", "order": 5, "question": "Can upper-year students also submit?",
     "answer": "Yes. Ask MLS is for the whole MLS student body. You can also contribute a 'Things I Wish I Knew Before MLS' piece from the same page."},
]

SEED_QUOTES = [
    {"order": 1, "text": "Don't wait until the night before to study. Even 30 focused minutes a day beats a panicked all-nighter.", "attribution": "Upper-Year Student"},
    {"order": 2, "text": "Ask questions early. It gets harder when you let confusion pile up week after week.", "attribution": "Upper-Year Student"},
    {"order": 3, "text": "You don't have to be perfect during your first semester. You just have to keep showing up.", "attribution": "Upper-Year Student"},
    {"order": 4, "text": "Make one friend in every subject. It's not just social — it's a survival system for missed classes and unclear announcements.", "attribution": "Upper-Year Student"},
    {"order": 5, "text": "Learn how to rest without guilt. Burnout is not a badge; it's a warning sign.", "attribution": "Upper-Year Student"},
    {"order": 6, "text": "Label everything in the lab. Trust me — you will regret it if you don't.", "attribution": "Upper-Year Student"},
]

SEED_ANNOUNCEMENTS = [
    {
        "title": "Welcome to MLS Compass",
        "body": "This is your student-led resource hub. Bookmark this page — announcements, forms, and reminders will appear here first.",
        "date": datetime.now(timezone.utc).date().isoformat(),
        "source": "Society of United Medical Laboratory Science",
    },
]

SEED_LINKS = [
    # Quick links (Home)
    {"label": "Student Portal", "url": "https://myportal.spcdavao.edu.ph/login", "note": "Grades & enrollment", "section": "quick", "order": 1},
    {"label": "Official School Website", "url": "https://www.facebook.com/SANPEDROCOLLEGEOfficial?", "note": "Home page", "section": "quick", "order": 2},
    {"label": "Institutional Email", "url": "ictc@spcdavao.edu.ph", "note": "Google Workspace", "section": "quick", "order": 3},
    {"label": "Library", "url": "https://www.facebook.com/spclrc?", "note": "Catalog & databases", "section": "quick", "order": 4},
    {"label": "Guidance & Counseling", "url": "https://www.facebook.com/SPCGCTC?", "note": "Support services", "section": "quick", "order": 5},
    {"label": "MLS Department", "url": "https://www.facebook.com/share/1DQyefPVyB/?mibextid=wwXIfr", "note": "Department office", "section": "quick", "order": 6},
    # Useful links (Resource Hub)
    {"label": "Student Portal", "url": "https://myportal.spcdavao.edu.ph/login", "note": "Grades, enrollment", "section": "useful", "order": 1},
    {"label": "Official School Website", "url": "https://www.facebook.com/SANPEDROCOLLEGEOfficial?", "note": "Home page", "section": "useful", "order": 2},
    {"label": "Institutional Email", "url": "ictc@spcdavao.edu.ph", "note": "Google Workspace", "section": "useful", "order": 3},
    {"label": "Library", "url": "https://www.facebook.com/spclrc?", "note": "Catalog & databases", "section": "useful", "order": 4},
    {"label": "Guidance / Student Support", "url": "https://www.facebook.com/SPCGCTC?", "note": "Counseling services", "section": "useful", "order": 5},
    {"label": "Department Resources", "url": "https://www.facebook.com/share/18wRXNepJ7/?mibextid=wwXIfr", "note": "MLS Department office", "section": "useful", "order": 6},
]

SEED_SETTINGS = {
    "id": "site",
    "ask_form_url": "<iframe src='https://docs.google.com/forms/d/e/1FAIpQLSckhpdWmz_M4KX_9giLJkX4l5IvIzSzk_O3r5tcQ9txOL93rg/viewform?embedded=true",
    "check_in_form_url": "<iframe src='https://docs.google.com/forms/d/e/1FAIpQLSetWqXQI4N2W-YjEMb_ZKMwEBG59hiWfWSFbzPKkI3Cuvxgiw/viewform?embedded=true' width='640' height='723' frameborder='0' marginheight='0' marginwidth='0'>Loading...</iframe>",
    "pulse_sheet_url": "<iframe src='https://docs.google.com/spreadsheets/d/e/2PACX-1vTyt313treeKO4o7fXfcXur8VUQ8vLP-ez4ToISohYyRVpDsg2czW_gU-ks3Cx5PAS0MnPMxgZ23tbO/pubhtml?widget=true&amp;headers=false'></iframe>",
    "org_name": "Society of United Medical Laboratory Science",



@app.on_event("startup")
async def seed_data():
    if await db.faqs.count_documents({}) == 0:
        for f in SEED_FAQS:
            await db.faqs.insert_one(FAQ(**f).model_dump())
    if await db.quotes.count_documents({}) == 0:
        for q in SEED_QUOTES:
            await db.quotes.insert_one(Quote(**q).model_dump())
    if await db.announcements.count_documents({}) == 0:
        for a in SEED_ANNOUNCEMENTS:
            await db.announcements.insert_one(Announcement(**a).model_dump())
    if await db.links.count_documents({}) == 0:
        for l in SEED_LINKS:
            await db.links.insert_one(SiteLink(**l).model_dump())
    if await db.settings.count_documents({"id": "site"}) == 0:
        await db.settings.insert_one(SEED_SETTINGS)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
