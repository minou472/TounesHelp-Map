# TounesHelp-Map
A full-stack web application that bridges the gap between marginalized 
communities in Tunisia's underserved regions and the organizations, 
volunteers, and donors who can help them.

## Overview

In many regions of Tunisia, cases of poverty, infrastructure neglect, 
and social marginalization go unnoticed and unaddressed — not because 
help doesn't exist, but because there is no visible, organized way to 
connect those who suffer with those who can act.

This platform solves that. Anyone can report a case, upload photos, 
pin the exact location on a map, and list organizations or individuals 
who can provide assistance. Cases are categorized by status so the 
community always knows what is resolved, what is in progress, and what 
still needs urgent attention.

## Key Features

- **Case Reporting** — Submit detailed cases with description, photos, 
  GPS location, and contact information for the person in need
- **Interactive Map** — Visualize all cases geographically across 
  Tunisia with colour-coded status markers
- **Smart Search & Filters** — Search by keyword, filter by governorate, 
  date range, and case status simultaneously
- **Three Case Statuses** — Resolved / In Progress / Still Suffering, 
  tracked with a full audit timeline
- **Role-Based Access** — Visitor (read-only), User (submit cases), 
  Admin (moderate and manage)
- **Multilingual** — Full support for Arabic (RTL), French, and English
- **Admin Moderation** — Every submitted case is reviewed before 
  going public

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand + TanStack Query |
| Forms | React Hook Form + Zod |
| Maps | Leaflet.js + React-Leaflet |
| i18n | next-intl (AR / FR / EN) |
| Database | PostgreSQL + Prisma |
| Auth | JWT + httpOnly refresh token |
| Testing | Cypress (E2E) + Jest + RTL |
| CI/CD | GitHub Actions + Vercel |

## User Roles

| Role | Can Do |
|------|--------|
| Visitor | Browse, search, and filter cases — no account needed |
| User | Everything above + submit and manage their own cases |
| Admin | Everything above + moderate submissions, change statuses, manage users |


## Project Status

🚧 **In active development** — following a 5-sprint Agile/Scrum plan.

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 1 | Authentication & Role-Based Layouts | In Progress |
| Sprint 2 | Case Discovery, Search & Filters | Planned |
| Sprint 3 | Interactive Map & Case Creation | Planned |
| Sprint 4 | Admin Moderation & Management | Planned |
| Sprint 5 | i18n, Performance & QA | Planned |

## Contributing

This project follows a feature-branch workflow.  
Branch naming: `feat/US-XX-short-description`  
All PRs require one approval and a passing CI pipeline before merge.

## License

MIT
