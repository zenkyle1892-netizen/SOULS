# MLS Compass — PRD

**Created:** 2026-02

## Original Problem Statement
Clean, mobile-friendly student resource hub for BSMLS students. Editorial scientific aesthetic, five public pages + admin. Central message: *"No MLS student should feel like they have to figure everything out alone."*

## Architecture
- **Frontend:** React 19 + React Router 7 + Shadcn UI + Tailwind, Spectral serif + IBM Plex Sans/Mono.
- **Backend:** FastAPI + Motor (MongoDB). CRUD under `/api`. Admin gated via `X-Admin-Pin` header (env `ADMIN_PIN`).
- **DB collections:** `faqs`, `quotes`, `announcements`, `links`, `settings`.

## Implemented (2026-02)

### Iteration 1
- 5 public pages + admin panel; 11 seed FAQs, 6 quotes; PIN-gated CRUD.
- Full testing agent PASS.

### Iteration 2
- **Announcements Board** on Home + admin CRUD; org default: *Society of United Medical Laboratory Science*; 1 seed welcome announcement.
- **Real Google Form iframe** on Ask MLS (seeded URL provided by user).
- **Batch Pulse section** on Support page — Google Sheet / Data Studio iframe, admin-editable.
- **Dynamic Quick Links + Useful Links** now DB-backed and admin-editable; Student Portal seeded to `https://myportal.spcdavao.edu.ph/login`.
- **Admin panel expanded** to 5 tabs: Announcements, FAQs, Quotes, Links, Settings.
- Fixed SettingsManager race (Save disabled until initial load).
- Testing agent 100% PASS (13/13 backend, all frontend flows).

## Backlog / Next
- **P1:** Provide check-in Google Form iframe URL (admin can paste under Settings → Check-in Form URL) and Batch Pulse sheet URL.
- **P2:** Batch Pulse dashboard native (option to skip Google Forms and store check-ins in DB with monthly charts).
- **P2:** Content moderation / triage view for Ask MLS responses (once form responses are exported).
- **P2:** Public "Upper-Year Contribution" form so upperclassmen can self-submit quotes for admin approval.
- **P3:** Migrate FastAPI `@app.on_event` → lifespan handlers; split routers into modules.
