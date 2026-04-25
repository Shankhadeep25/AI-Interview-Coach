# AI Interview Coach

AI-powered interview preparation platform built with Next.js, Express, MongoDB, and Google Gemini AI.

## Features

- **Resume Analyzer** — AI match scoring against job descriptions
- **Interview Questions** — Personalized questions (Technical, Behavioral, Situational, HR)
- **Answer Evaluator** — Instant scoring with detailed feedback and model answers
- **Cover Letter Generator** — Professional cover letters tailored to each role

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini 2.5 Flash |
| Auth | JWT (httpOnly cookies) |

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- Gemini API key from [aistudio.google.com](https://aistudio.google.com/apikey)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — add your GEMINI_API_KEY and MONGODB_URI
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### 3. Open
Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ai-interview-coach/
├── backend/
│   └── src/
│       ├── controllers/    # Route handlers
│       ├── middleware/      # JWT auth
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routes
│       ├── services/        # Gemini AI service
│       ├── config/          # DB connection
│       └── index.js         # Entry point
├── frontend/
│   └── src/
│       ├── app/             # Next.js pages
│       ├── components/      # React components
│       └── lib/             # API client, types
├── .gitignore
└── README.md
```

## Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret for signing JWTs |
| GEMINI_API_KEY | Google Gemini API key |
| CLIENT_URL | Frontend URL for CORS |
| NODE_ENV | development or production |
| COOKIE_NAME | Auth cookie name (default: aic_token) |

### Frontend (.env.local)
| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_API_URL | Backend URL (default: http://localhost:5000) |
