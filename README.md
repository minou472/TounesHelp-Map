# TounesHelp-Map

TounesHelp-Map is a web platform designed to connect people who need help with volunteers across Tunisia. It allows users to report specific cases of people in need on an interactive map, making it easier to coordinate assistance and relief efforts.

## What's under the hood

The project is set up as a single repository containing both the client and the server code:

- Frontend: Built with React and Vite, using Tailwind CSS for styling and Leaflet for the map interface.
- Backend: A Next.js server handling the API routes.
- Database: Prisma ORM with SQLite for local development.

## How to run it locally

You just need Node.js installed on your machine to get started.

1. Install the dependencies in the root folder:
   npm install

2. Run the development environment:
   npm run dev

The `npm run dev` command is set up to start both the frontend and backend simultaneously. The frontend will typically run on localhost:5173, and the backend on localhost:3001. The Vite configuration already includes a proxy, so frontend API calls are automatically routed to the backend.

## Main features

- An interactive map displaying reported cases by location and category.
- A submission form for users to report new cases with photos and descriptions.
- User accounts with secure authentication.
- An admin dashboard to moderate submitted cases, block/unblock users, and track platform statistics.
- Multi-language support (French, English, Arabic).

## A note on deployment

Right now, the project uses SQLite, which works great for local testing but won't persist data if deployed on serverless platforms like Vercel. If you're looking to put this in production, you'll want to switch the database provider in `prisma/schema.prisma` to PostgreSQL or MySQL, and host the backend on a service that supports persistent Node.js servers.
