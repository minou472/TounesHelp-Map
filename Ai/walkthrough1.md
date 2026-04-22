# Fix: Case Submission & Admin Visibility

## Problem
1. Submitting a case didn't save it to the database
2. Admin couldn't see cases, users, and visitors

## Root Causes Found & Fixed

### 1. Zod Validation Too Strict (Backend)
**File:** [route.ts](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/backend/src/app/api/cases/route.ts)

The `createCaseSchema` had overly strict validation that silently rejected submissions:
- `description` required 20+ chars → relaxed to 10+
- `fullDescription` required 50+ chars → made optional, defaults to description
- `victimPhone`/`creatorPhone` required 8+ chars → relaxed to 4+
- `victimEmail` didn't accept empty strings → now accepts `""` via `.or(z.literal(""))`

### 2. Authentication Was Mandatory for Case Creation
The `POST /api/cases` endpoint returned 401 if user wasn't logged in, blocking visitors from submitting cases. Made auth **optional** — authenticated users get their case linked to their account, anonymous visitors can still submit.

### 3. SQLite `mode: "insensitive"` Error (Backend)
**Files:** [cases/route.ts](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/backend/src/app/api/cases/route.ts), [users/route.ts](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/backend/src/app/api/users/route.ts)

Both cases and users search queries used `mode: "insensitive"` which is a **PostgreSQL-only** feature. SQLite Prisma throws a 500 error on these queries. Removed `mode: "insensitive"` from all search filters.

### 4. Frontend Swallowed Error Messages
**File:** [CreateCasePage.tsx](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/src/app/components/touneshelp/CreateCasePage.tsx)

The catch block showed a generic internationalized error toast instead of the actual backend error message. Now shows the real error from the API response.

### 5. Empty Optional Fields Sent as Empty Strings
**File:** [backendApi.ts](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/src/app/lib/backendApi.ts)

`createCase()` sent empty strings for optional fields like `victimEmail` and `videoUrl`, which failed Zod's `.email()` validation. Now cleans up empty optional fields to `undefined` before sending.

## Verification Results

### Case Submission ✅
- Logged in as admin → created a case → **saved successfully** to database
- Case appears in the Cases page with status "Souffrance"

### Admin Cases Page (`/admin/cas`) ✅
- **2 cases visible** in the table
- Shows: title, victim, creator, governorate, status, date, action buttons
- Status change and delete buttons functional

### Admin Users Page (`/admin/utilisateurs`) ✅
- **2 users visible**: Admin TounesHelp (Administrateur) and Test User (Utilisateur)
- Shows: name, email, role, status, registration date

### Admin Stats Page (`/admin/stats`) ✅
- Dashboard shows real data from the database
- Charts for cases by status, category, and governorate all rendering
