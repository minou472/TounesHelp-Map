# TounesHelp-Map

A comprehensive platform for connecting people in need with volunteers and organizations in Tunisia. The platform features an interactive map, case management system, chatbot assistance, and administrative tools.

## Features

### 🗺️ Interactive Map

- View active help cases on an interactive map of Tunisia
- Filter cases by category, governorate, and status
- Real-time updates of case statuses

### 📋 Case Management

- Submit help requests with detailed information
- Upload photos and location data
- Track case progress from submission to resolution
- Moderation system for case validation

### 🤖 AI Chatbot

- Intelligent chatbot (Espoir/Hope) for user assistance
- Multi-language support (French, Arabic, English)
- Contextual help and case information
- Automatic language detection

### 👥 User Management

- Role-based access (Users, Volunteers, Organizations, Admins)
- User registration and authentication
- Profile management

### 🛠️ Admin Dashboard

- User management (view, create, edit, block, delete users)
- Case moderation and management
- Statistics and analytics
- System monitoring

## Tech Stack

### Frontend

- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React i18next** for internationalization
- **Leaflet** for interactive maps

### Backend

- **Next.js** with TypeScript
- **Prisma** ORM with PostgreSQL
- **NextAuth.js** for authentication
- **Next-intl** for server-side internationalization
- **Zod** for validation

### Database

- **PostgreSQL** with Prisma migrations
- **Redis** for caching (optional)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/minou472/TounesHelp-Map.git
   cd TounesHelp-Map
   ```

2. **Install dependencies**

   ```bash
   # Frontend
   cd src
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. **Database Setup**

   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Environment Variables**

   Create `.env.local` in the backend directory:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/touneshelp"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   Create `.env` in the src directory:

   ```env
   VITE_API_URL="http://localhost:3000"
   ```

5. **Run the application**

   ```bash
   # Backend (in backend directory)
   npm run dev

   # Frontend (in src directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Project Structure

```
TounesHelp-Map/
├── src/                          # Frontend (Vite + React)
│   ├── app/
│   │   ├── components/
│   │   │   ├── admin/           # Admin dashboard components
│   │   │   ├── touneshelp/      # Main app components
│   │   │   └── ui/              # Reusable UI components
│   │   ├── data/                # Static data and mock data
│   │   ├── lib/                 # Utilities and API functions
│   │   └── routes.ts            # Route definitions
│   ├── i18n/                    # Internationalization
│   └── styles/                  # Global styles
├── backend/                      # Backend (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/             # API routes
│   │   │   └── globals.css
│   │   ├── lib/                 # Utilities and auth
│   │   └── middleware.ts
│   ├── i18n/                    # Server-side i18n
│   └── prisma/                  # Database schema and migrations
├── guidelines/                  # Project guidelines
└── touneshelp-map/              # Additional map-related code
```

## API Documentation

### Authentication

- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout

### Cases

- `GET /api/cases` - List cases with filters
- `GET /api/cases/:id` - Get case details
- `POST /api/cases` - Create new case
- `PATCH /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

### Users (Admin only)

- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Chatbot

- `POST /api/chatbot` - Send message to chatbot

### Statistics

- `GET /api/stats` - Get platform statistics

## Internationalization

The platform supports three languages:

- **French (fr)** - Default language
- **Arabic (ar)** - RTL support
- **English (en)**

Language detection is automatic based on:

1. Local storage preference
2. Browser language
3. HTML tag fallback

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

## Deployment

### Frontend

```bash
npm run build
npm run preview
```

### Backend

```bash
npm run build
npm start
```

### Docker (Optional)

```bash
docker-compose up -d
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- Project Link: [https://github.com/minou472/TounesHelp-Map](https://github.com/minou472/TounesHelp-Map)
- Email: contact@touneshelp.tn

## Acknowledgments

- Built with ❤️ for the Tunisian community
- Special thanks to all contributors and volunteers
- Icons by Lucide React
- Maps powered by OpenStreetMap and Leaflet
