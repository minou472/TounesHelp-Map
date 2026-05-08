# TounesHelp-Map — Feature Implementation Plan

This plan covers four feature areas requested by the user:
1. **File Uploads** — real previews, ≥1 file constraint, edit/add/remove
2. **Case Page Display** — media gallery below description, "show 3 + expand"
3. **Location Auto-fill** — reverse geocoding on map click in CreateCase
4. **User Profile & Dashboard** — profile view/edit, personal location map, nearby case suggestions, i18n for all 3 languages

---

## Proposed Changes

### A — File Uploads (CreateCasePage + UserDashboard edit dialog)

#### [MODIFY] [CreateCasePage.tsx](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/src/app/components/touneshelp/CreateCasePage.tsx)

- Replace the current icon-only file list in **Step 5 (Media)** with a real **thumbnail grid preview**:
  - Images → `<img>` tag using `URL.createObjectURL(file)`
  - Videos → `<video>` tag using `URL.createObjectURL(file)` with controls
  - Each preview tile has an `X` remove button
- Enforce **≥ 1 file** constraint before allowing navigation to Step 6 / submitting:
  - If `formData.images.length === 0` and `uploadedFiles.length === 0` on Step 5 → show toast and block "Next"
  - On final submit → re-validate the same condition
- In **Step 6 (Review)**: show the same thumbnail preview grid for already-uploaded images (from `formData.images` URLs), not just a file count

#### [MODIFY] [UserDashboard.tsx](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/src/app/components/touneshelp/UserDashboard.tsx)

- Expand the **Edit Case dialog** to include a media section:
  - Display existing uploaded images (from `editingCase.images`) as a removable thumbnail grid
  - Provide a file picker to **add new files** (respecting the 10-file limit)
  - Upload new files inline (using `uploadFile`) before calling `updateCase`
  - Prevent saving if the resulting images array would be empty (≥1 constraint)
- Extend `editForm` state with `existingImages: string[]` and `newFiles: File[]`
- Call `updateCase(id, { images: [...keptImages, ...newlyUploadedUrls] })` on save

---

### B — Case Page Display (CaseDetailPage)

#### [MODIFY] [CaseDetailPage.tsx](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/src/app/components/touneshelp/CaseDetailPage.tsx)

- Move the media display **below the case description** (currently the hero image is at the top — keep it, but also add a media section below the description text)
- Implement a **"show 3 + expand"** gallery:
  - Default: show first 3 images/video thumbnails
  - A `+N more` button reveals the rest inline (no modal needed, just expand)
- If `videoUrl` is present, include a `<video>` player in the gallery
- Add i18n keys: `case_detail.show_more`, `case_detail.show_less`, `case_detail.video`

---

### C — Location Auto-fill on Map Click (CreateCasePage)

#### [MODIFY] [CreateCasePage.tsx](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/src/app/components/touneshelp/CreateCasePage.tsx)

- On map click (Step 2), after updating `latitude`/`longitude`, call Google Maps **Geocoding API** (`google.maps.Geocoder`) to reverse-geocode the clicked coordinates
- Parse the result to extract:
  - **City** (locality or sublocality component)
  - **Delegation** (administrative_area_level_3 or equivalent)
  - **Governorate** (administrative_area_level_1)
- Auto-fill `formData.city` and `formData.governorate` (matched against `tunisiaGovernorates` list)
- Show a small "📍 Auto-rempli" badge next to the fields when auto-filled
- Add translation keys: `create_case.labels.autofilled`, `create_case.labels.delegation`

---

### D — User Profile & Dashboard

#### [MODIFY] [UserDashboard.tsx](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/src/app/components/touneshelp/UserDashboard.tsx)

**Profile section (view + edit)**
- Add a **Profile Card** at the top of the dashboard (above the stats row) showing:
  - Name, email, phone, bio (read from `localStorage` / auth user)
  - An **Edit Profile** button that opens a dialog with editable fields: Name, Phone, Bio
  - On save → call `updateUser(id, { name, phone, bio })` (PUT `/api/users/:id`)
- Auth guard: redirect to `/connexion` if `user` is null

**Personal location map** (independent, not on the public map)
- Add a collapsible **"My Location"** section with a Google Map (same API key, small height ~250px)
- User can click to drop a personal pin; coordinates saved to `localStorage` as `touneshelp_user_location: {lat, lng, city, governorate}`
- This location is **never** sent to the main cases API; it's purely local/profile-level

**Nearby case suggestions**
- After loading `allCases`, compute distance (Haversine formula) from the stored user location to each case's `coordinates`
- Display the 3–5 closest cases (within ~100km) in a **"Cas près de chez vous"** section at the bottom of the dashboard
- Falls back gracefully if no user location is saved (shows a prompt to set location)

#### [MODIFY] [backendApi.ts](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/src/app/lib/backendApi.ts)

- Add `updateCurrentUser(data: UpdateUserData)` function that calls `PATCH /api/users/:id` using the current user's ID from localStorage

#### [MODIFY] [backend/src/app/api/users/[id]/route.ts](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/backend/src/app/api/users/)

- Ensure `PATCH /api/users/:id` accepts `bio` and is accessible by the authenticated user themselves (not just admins)
- Currently `requireAdmin` is used — add a check: allow if `authUser.userId === id`

---

### E — i18n (all 3 locales: fr, en, ar)

#### [MODIFY] [fr.json](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/src/i18n/locales/fr.json)
#### [MODIFY] [ar.json](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/src/i18n/locales/ar.json)
#### [MODIFY] [en.json](file:///c:/Users/HP/OneDrive/Desktop/projects/TounesHelp-Map/src/i18n/locales/en.json)

New keys to add (across all 3 locales):

| Key | FR | AR | EN |
|-----|----|----|-----|
| `dashboard.my_profile` | Mon Profil | ملفي الشخصي | My Profile |
| `dashboard.edit_profile` | Modifier le profil | تعديل الملف الشخصي | Edit Profile |
| `dashboard.my_location` | Ma localisation | موقعي | My Location |
| `dashboard.set_location_prompt` | Définissez votre localisation pour voir les cas proches | حدد موقعك لرؤية الحالات القريبة | Set your location to see nearby cases |
| `dashboard.nearby_cases` | Cas près de chez vous | حالات قريبة منك | Cases Near You |
| `dashboard.no_nearby_cases` | Aucun cas proche trouvé | لا توجد حالات قريبة | No nearby cases found |
| `dashboard.name` | Nom | الاسم | Name |
| `dashboard.phone` | Téléphone | الهاتف | Phone |
| `dashboard.bio` | Bio | نبذة | Bio |
| `dashboard.profile_saved` | Profil mis à jour | تم تحديث الملف الشخصي | Profile updated |
| `create_case.labels.autofilled` | Auto-rempli | مملوء تلقائيا | Auto-filled |
| `create_case.labels.delegation` | Délégation | المعتمدية | Delegation |
| `create_case.messages.min_one_file` | Au moins 1 fichier requis | يجب رفع ملف واحد على الأقل | At least 1 file is required |
| `case_detail.show_more` | Voir plus | عرض المزيد | Show more |
| `case_detail.show_less` | Voir moins | عرض أقل | Show less |
| `case_detail.video` | Vidéo | فيديو | Video |

---

## Open Questions

> [!IMPORTANT]
> **Geocoding API**: The map click reverse-geocode will use `google.maps.Geocoder` which is already available since the Maps JS API is loaded. No extra API key is needed — same key `AIzaSyAmk4IjHlJsQb8gchi-9SXxRD0vGaCsxaI`. Please confirm this is acceptable.

> [!IMPORTANT]
> **Profile update endpoint**: Currently `PATCH /api/users/:id` requires admin. I'll modify it to also allow the authenticated user to update their own profile. This means a small backend change to `backend/src/app/api/users/[id]/route.ts`. Please confirm.

> [!NOTE]
> **Personal location storage**: User location (lat/lng/city) will be stored in `localStorage` only. It won't be persisted in the database (the User model would need a new column). If you'd like it persisted in the DB, let me know and I'll add a migration.

> [!NOTE]
> **en.json**: I need to check if this locale file exists. If not, I'll create it with the same structure as fr.json.

---

## Verification Plan

### Automated / Dev Server
- `npm run dev` (frontend Vite) + `npm run dev` in `backend/` to confirm no TypeScript errors
- Test flow: Create case → Step 5 with no files → confirm "Next" is blocked → add 1 file → confirm preview renders → remove file → re-blocked → add file → upload → Step 6 shows preview

### Manual Verification
1. **File preview** — select image and video files in Step 5 and verify thumbnail renders
2. **≥1 file constraint** — try to advance from Step 5 with 0 files; try submitting with 0 uploaded
3. **Case page gallery** — open a case with >3 images and verify "+N more" expansion
4. **Map auto-fill** — click on the map in Step 2; verify City and Governorate fields auto-populate
5. **Dashboard profile card** — verify name/email/phone shows; click Edit → change name → save → verify update
6. **Nearby cases** — set user location; verify cases sorted by distance appear at bottom of dashboard
7. **i18n** — switch language to Arabic and French; verify all new strings appear correctly with RTL support
