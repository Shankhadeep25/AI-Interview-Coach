<div align="center">

# 🧠 AI Interview Coach

**Ace every interview with AI-powered coaching**

An end-to-end SaaS platform that leverages Google Gemini AI to analyze resumes against job descriptions, generate personalized interview questions, evaluate answers in real time, and craft professional cover letters — all from a single dashboard.

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Razorpay](https://img.shields.io/badge/Razorpay-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

[Live Demo (Coming Soon)](#) · [Report Bug](https://github.com/Shankhadeep25/AI-Interview-Coach/issues) · [Request Feature](https://github.com/Shankhadeep25/AI-Interview-Coach/issues)

</div>

---

## 📖 About

AI Interview Coach solves a real problem: most candidates prepare for interviews blindly, without knowing how well their resume matches a role or how their answers compare to what interviewers expect. This platform closes that gap by using **Google Gemini 2.5 Flash** to deliver instant, structured feedback on resumes, generate role-specific interview questions across four categories, score answers against ideal benchmarks, and auto-generate tailored cover letters — all behind a freemium model with Razorpay-powered upgrades.

> **🚧 Deployment Status:** The application is not yet deployed. URLs will be updated here once live.

---

## 📑 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Folder Structure](#-folder-structure)
- [API Documentation](#-api-documentation)
- [Razorpay Integration](#-razorpay-integration)
- [Gemini AI Usage](#-gemini-ai-usage)
- [Screenshots](#-screenshots)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Resume Analyzer** | AI-powered match scoring (0–100%) with strengths, gaps, keyword analysis, and resume improvement suggestions |
| 💬 **AI Interview Questions** | 10 personalized questions per session — Technical, Behavioral, Situational, and HR — with difficulty levels and hints |
| ⭐ **Answer Evaluator** | Real-time scoring (0–10) with detailed feedback, identified strengths, improvement areas, and a model answer |
| ✉️ **Cover Letter Generator** | Professional, role-specific cover letters with email subject lines, generated in seconds |
| 💳 **Pro Plan (Razorpay)** | Secure payment checkout with two-phase verification (HMAC signature + payment status fetch) |
| 📊 **Dashboard** | Centralized view of all sessions, match scores, interview progress, and plan status |
| 📧 **Contact Form** | Backend-powered email delivery with auto-reply via Nodemailer (Gmail SMTP) |
| 🔐 **Secure Auth** | JWT authentication with httpOnly cookies — tokens never exposed to JavaScript |
| 🛡️ **Input Validation** | Zod-based request validation with XSS sanitization on all user inputs |
| ⚡ **Rate Limiting** | Global (100 req/15min) and AI-specific (10 req/min) rate limiters to prevent abuse |

---

## 🏗️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js (App Router) | 14.2.x |
| **UI Framework** | Tailwind CSS | 3.4.x |
| **Language** | TypeScript | 5.x |
| **Backend** | Express.js | 4.21.x |
| **Runtime** | Node.js | 18+ |
| **Database** | MongoDB (Mongoose ODM) | 8.9.x |
| **AI Engine** | Google Gemini 2.5 Flash | @google/generative-ai 0.21.x |
| **Payments** | Razorpay Standard Checkout | 2.9.x |
| **Auth** | JSON Web Tokens (httpOnly cookies) | jsonwebtoken 9.x |
| **Validation** | Zod | 4.4.x |
| **Email** | Nodemailer (Gmail SMTP) | 8.x |
| **Testing** | Jest + Supertest + mongodb-memory-server | 30.x |
| **Deployment** | TBD | — |

---

## 🔀 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                   Next.js 14 · Tailwind CSS                     │
│           Axios (withCredentials) + httpOnly cookies             │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTPS / REST
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXPRESS.JS SERVER (:5000)                    │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │  Auth    │  │ Analyze  │  │ Interview │  │   Payment     │  │
│  │  Routes  │  │  Routes  │  │  Routes   │  │   Routes      │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬────────┘  │
│       │              │              │               │           │
│  ┌────▼──────────────▼──────────────▼───────────────▼────────┐  │
│  │              Middleware Layer                              │  │
│  │  JWT Auth · Zod Validation · Rate Limiting · Error Handler│  │
│  └────┬──────────────┬──────────────┬───────────────┬────────┘  │
│       │              │              │               │           │
│       ▼              ▼              ▼               ▼           │
│  ┌─────────┐  ┌────────────┐  ┌──────────┐  ┌────────────┐     │
│  │ MongoDB │  │ Gemini API │  │ Razorpay │  │ Nodemailer │     │
│  │ (Atlas) │  │  (Google)  │  │   SDK    │  │  (Gmail)   │     │
│  └─────────┘  └────────────┘  └──────────┘  └────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed and configured:

| Requirement | Purpose | Link |
|------------|---------|------|
| **Node.js 18+** | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| **npm** or **yarn** | Package manager | Bundled with Node.js |
| **MongoDB** | Database (local or Atlas) | [mongodb.com/atlas](https://www.mongodb.com/atlas) |
| **Gemini API Key** | AI-powered analysis | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **Razorpay Account** | Payment processing (optional) | [dashboard.razorpay.com](https://dashboard.razorpay.com/) |
| **Gmail App Password** | Contact form emails (optional) | [Google App Passwords](https://myaccount.google.com/apppasswords) |
| **Git** | Version control | [git-scm.com](https://git-scm.com/) |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Shankhadeep25/AI-Interview-Coach.git
cd AI-Interview-Coach
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create the environment file from the provided template:

```bash
cp .env.example .env
```

Open `.env` and fill in your actual credentials:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-interview-coach
JWT_SECRET=your_super_secret_jwt_key_change_this
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
COOKIE_NAME=aic_token
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
```

Start the backend server:

```bash
npm run dev    # → http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create the frontend environment file:

```bash
# Create .env.local manually or copy from example
```

Add the following to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

Start the frontend dev server:

```bash
npm run dev    # → http://localhost:3000
```

### 4. Open the App

Navigate to **[http://localhost:3000](http://localhost:3000)**, create an account, and start your first resume analysis.

> **💡 Tip:** Both servers must be running simultaneously. The frontend communicates with the backend via REST API using httpOnly cookies for authentication.

---

## ⚙️ Environment Variables

### Backend (`.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Express server port | No | `5000` |
| `MONGODB_URI` | MongoDB connection string | **Yes** | — |
| `JWT_SECRET` | Secret key for signing JWTs (use a long random string) | **Yes** | — |
| `GEMINI_API_KEY` | Google Gemini API key from AI Studio | **Yes** | — |
| `CLIENT_URL` | Frontend origin URL (used for CORS) | No | `http://localhost:3000` |
| `NODE_ENV` | Environment mode (`development` / `production` / `test`) | No | `development` |
| `COOKIE_NAME` | Name of the httpOnly auth cookie | No | `aic_token` |
| `RAZORPAY_KEY_ID` | Razorpay public key (starts with `rzp_test_` or `rzp_live_`) | Yes* | — |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key (**⚠️ never expose to frontend**) | Yes* | — |
| `EMAIL_USER` | Gmail address for sending contact form emails | Yes* | — |
| `EMAIL_PASS` | Gmail 16-character app password | Yes* | — |

> *Required only if using the corresponding feature (payments / contact form).

### Frontend (`.env.local`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend server URL | No | `http://localhost:5000` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key (safe for client-side) | Yes* | — |

---

## 📁 Folder Structure

```
AI-Interview-Coach/
├── backend/
│   ├── .env.example              # Environment variable template
│   ├── package.json
│   └── src/
│       ├── index.js              # Server entry point (connects DB + starts Express)
│       ├── app.js                # Express app (CORS, middleware, routes)
│       ├── config/
│       │   ├── database.js       # MongoDB/Mongoose connection
│       │   └── razorpay.js       # Razorpay SDK initialization
│       ├── controllers/
│       │   ├── authController.js       # Register, login, logout, getMe
│       │   ├── analyzeController.js    # Resume analysis + cover letter
│       │   ├── interviewController.js  # Question generation + evaluation
│       │   ├── paymentController.js    # Razorpay order + verification
│       │   └── contactController.js    # Contact form email
│       ├── middleware/
│       │   ├── authMiddleware.js  # JWT cookie verification
│       │   ├── validate.js       # Zod schema validation middleware
│       │   └── errorHandler.js   # Global error handler
│       ├── models/
│       │   ├── User.js           # User schema (bcrypt, plan, sessionsUsed)
│       │   ├── Session.js        # Analysis/interview session schema
│       │   └── Payment.js        # Payment audit trail schema
│       ├── routes/
│       │   ├── auth.js           # /api/auth/*
│       │   ├── analyze.js        # /api/analyze/*
│       │   ├── interview.js      # /api/interview/*
│       │   ├── payment.js        # /api/payment/*
│       │   └── contact.js        # /api/contact
│       ├── services/
│       │   └── geminiService.js  # Gemini API: analyze, questions, evaluate, cover letter
│       ├── validators/
│       │   ├── authValidator.js       # Zod schemas for register/login
│       │   ├── analyzeValidator.js    # Zod schemas for analyze endpoints
│       │   ├── interviewValidator.js  # Zod schemas for interview endpoints
│       │   ├── paymentValidator.js    # Zod schemas for payment endpoints
│       │   └── contactValidator.js    # Zod schemas for contact form
│       └── __tests__/
│           ├── setup.js          # Jest + mongodb-memory-server setup
│           ├── unit/             # Unit tests
│           └── integration/      # Integration tests (Supertest)
│
├── frontend/
│   ├── package.json
│   └── src/
│       ├── app/
│       │   ├── layout.tsx        # Root layout (Navbar + Footer + Toaster)
│       │   ├── page.tsx          # Landing page (Hero, Features, How It Works, CTA)
│       │   ├── globals.css       # Global styles + Tailwind directives
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx      # Login page
│       │   │   └── register/page.tsx   # Registration page
│       │   ├── dashboard/page.tsx      # User dashboard (sessions, stats)
│       │   ├── analyze/page.tsx        # Resume analysis interface
│       │   ├── interview/
│       │   │   └── [sessionId]/page.tsx  # Mock interview with live evaluation
│       │   └── (pages)/
│       │       ├── about/        # About Us
│       │       ├── pricing/      # Plans + Razorpay checkout
│       │       ├── contact/      # Contact form
│       │       ├── privacy/      # Privacy Policy
│       │       ├── terms/        # Terms & Conditions
│       │       └── refund/       # Refund/Cancellation Policy
│       ├── components/
│       │   ├── Navbar.tsx             # Navigation bar (auth-aware)
│       │   ├── Footer.tsx             # Footer with legal/info links
│       │   ├── HeroCTA.tsx            # Auth-aware hero CTA button
│       │   ├── AnalysisSummary.tsx     # Match score + analysis display
│       │   ├── QuestionCard.tsx        # Interview question display
│       │   ├── EvaluationCard.tsx      # Answer evaluation feedback
│       │   ├── ScoreCircle.tsx         # Circular progress indicator
│       │   └── PayButton.tsx           # Razorpay checkout button
│       └── lib/
│           ├── api.ts            # Axios client (auth, analyze, interview, payment, contact)
│           └── types.ts          # TypeScript interfaces
│
├── .gitignore
└── README.md
```

---

## 📡 API Documentation

All endpoints are prefixed with `/api`. Protected routes require a valid JWT in the `aic_token` httpOnly cookie.

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Create a new account (name, email, password) | ✗ |
| `POST` | `/api/auth/login` | Authenticate and receive JWT cookie | ✗ |
| `POST` | `/api/auth/logout` | Clear auth cookie | ✗ |
| `GET` | `/api/auth/me` | Get current authenticated user profile | ✔ |

### Resume Analysis

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/analyze` | Analyze resume against a job description (returns match score, strengths, gaps, keywords) | ✔ |
| `POST` | `/api/analyze/cover-letter` | Generate a professional cover letter from an existing session | ✔ |
| `GET` | `/api/analyze/sessions` | List all analysis sessions for the current user | ✔ |
| `GET` | `/api/analyze/sessions/:id` | Get full details of a specific session | ✔ |

### Interview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/interview/generate` | Generate 10 personalized interview questions from a session | ✔ |
| `POST` | `/api/interview/evaluate` | Evaluate a user's answer against ideal points (score 0–10) | ✔ |
| `POST` | `/api/interview/complete` | Mark interview as completed and calculate average score | ✔ |

### Payment

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/payment/create-order` | Create a Razorpay order for Pro plan (₹499) | ✔ |
| `POST` | `/api/payment/verify-payment` | Verify payment signature + capture status, upgrade to Pro | ✔ |

### Contact

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/contact` | Submit contact form (sends email via Nodemailer) | ✗ |

### Health Check

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | Server health check (returns status + timestamp) | ✗ |

---

## 💳 Razorpay Integration

> **⚠️ Important:** The application is configured in **Razorpay Test Mode**. No real money is charged.

### How It Works

1. **Create Order** — Backend creates a Razorpay order with the amount hardcoded server-side (₹499 = 49900 paise). The amount is never accepted from the client.
2. **Checkout Modal** — Frontend opens the Razorpay Standard Checkout modal using the order ID returned from Step 1.
3. **Signature Verification** — After payment, Razorpay returns `order_id`, `payment_id`, and `signature`. The backend validates the HMAC-SHA256 signature using the secret key.
4. **Status Confirmation** — Backend fetches the payment from Razorpay API and confirms `status === 'captured'` before upgrading the user.

### Test Credentials

Use these credentials to test payments in Razorpay Test Mode:

| Method | Details |
|--------|---------|
| **Card** | `4111 1111 1111 1111` · CVV: `123` · Expiry: any future date |
| **UPI** | `success@razorpay` |
| **Net Banking** | Select any bank — all succeed in test mode |

### Switching to Live Mode

1. Replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with live keys from [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
2. Update the frontend `NEXT_PUBLIC_RAZORPAY_KEY_ID` to the live public key
3. Ensure your Razorpay account has completed KYC verification

---

## 🤖 Gemini AI Usage

The application uses **Google Gemini 2.5 Flash** through the `@google/generative-ai` SDK. Four distinct AI features are powered by Gemini, each with carefully engineered prompts:

| Feature | Function | Input | Output |
|---------|----------|-------|--------|
| **Resume Analysis** | `analyzeResumeAndJD()` | Resume text + Job description | Match score, summary, verdict, strengths, gaps, keyword analysis, improvement suggestions |
| **Question Generation** | `generateInterviewQuestions()` | Resume + JD from session | 10 questions across Technical, Behavioral, Situational, and HR categories with difficulty levels, hints, and ideal answer points |
| **Answer Evaluation** | `evaluateAnswer()` | Question + User answer + Ideal points | Score (0–10), detailed feedback, strengths, improvements, and a model 10/10 answer |
| **Cover Letter** | `generateCoverLetter()` | Resume + JD + Company + Title | Professional email subject line + 3–4 paragraph cover letter |

All Gemini responses are returned as structured JSON. The service layer includes a `parseGeminiJSON()` utility that strips markdown code fences before parsing, ensuring robust handling of Gemini's response format variations.

> **🔑 Get your API key:** Visit [aistudio.google.com](https://aistudio.google.com/apikey) to generate a free Gemini API key.

---

## 📸 Screenshots

<!-- Replace these placeholders with actual screenshots once available -->

### Landing Page
![Landing Page](screenshots/landing.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Resume Analysis
![Resume Analysis](screenshots/analysis.png)

### Interview Practice
![Interview Practice](screenshots/interview.png)

### Answer Evaluation
![Answer Evaluation](screenshots/evaluation.png)

### Payment Checkout
![Payment Flow](screenshots/payment.png)

> **📷 Note:** Screenshots will be added once the application is deployed. To see the UI locally, follow the [Getting Started](#-getting-started) instructions.

---

## 🧪 Testing

The backend includes a test suite powered by **Jest**, **Supertest**, and **mongodb-memory-server** (in-memory MongoDB for isolated test runs).

```bash
cd backend

# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
```

Test structure:
```
__tests__/
├── setup.js          # Global setup (in-memory MongoDB)
├── unit/             # Unit tests (validators, services, middleware)
└── integration/      # Integration tests (full API route testing with Supertest)
```

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes using [Conventional Commits](https://www.conventionalcommits.org/)
   ```bash
   git commit -m "feat: add new AI feedback visualization"
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open** a Pull Request with a clear description of your changes

### Commit Convention

| Prefix | Purpose |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting (no logic change) |
| `refactor:` | Code restructuring |
| `test:` | Adding or updating tests |
| `chore:` | Build config, dependencies |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Shankhadeep Dey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author

<div align="center">

**Shankhadeep Dey**

[![GitHub](https://img.shields.io/badge/GitHub-Shankhadeep25-181717?style=for-the-badge&logo=github)](https://github.com/Shankhadeep25)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/shankhadeep-dey/)

---

Built with ❤️ and ☕ · Powered by Google Gemini AI

</div>
