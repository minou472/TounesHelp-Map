# TounesHelp Frontend

React + Vite application for the TounesHelp platform.

## Quick Start

```bash
# Backend APIs
cd touneshelp-map
npm run dev

# Frontend
cd my-app
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

## Stack

- React 19
- Vite 8
- TailwindCSS 4
- react-router-dom 7
- i18next (ar/en/fr)
- Zustand
- react-hook-form + Zod
- react-leaflet

## Production

```bash
cd my-app
npm run build
npm run preview
```

## Structure

```
my-app/
├── vite.config.ts
├── src/
│   ├── App.tsx (router + auth)
│   ├── globals.css (Tailwind)
│   ├── components/
│   ├── lib/ (stores, api)
│   ├── i18n/
│   └── pages/
```

Proxy `/api/*` → backend automatic.
