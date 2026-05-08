# TounesHelp Feature Implementation Tasks

## Phase 1 — Research & Setup
- [x] Read CreateCasePage, UserDashboard, CaseDetailPage, backendApi, schemas, locales

## Phase 2 — i18n Keys
- [x] Add new keys to fr.json
- [x] Add new keys to ar.json
- [x] Add new keys to en.json (create if needed)

## Phase 3 — File Uploads (CreateCasePage)
- [x] Real thumbnail preview (image + video) before upload
- [x] ≥1 file constraint at Step 5 (block Next)
- [x] ≥1 file constraint at submit
- [x] Review step shows image thumbnails
- [x] Map click → reverse geocode → auto-fill City + Governorate

## Phase 4 — Case Detail Gallery
- [x] Media section below description
- [x] Show 3 files + expand button

## Phase 5 — UserDashboard
- [x] Profile card (view + edit dialog)
- [x] Auth guard (redirect if not logged in)
- [x] Personal location map (localStorage)
- [x] Nearby cases suggestions (Haversine)
- [x] Edit case dialog: add/remove media with ≥1 constraint

## Phase 6 — Backend
- [x] Allow self-update in PATCH /api/users/:id
- [x] Add updateCurrentUser() to backendApi.ts
