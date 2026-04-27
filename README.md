<div align="center">

# 🧠 AI Interview Coach

**Ace every interview with AI-powered coaching**

An end-to-end SaaS platform that uses Google Gemini AI to analyze resumes, generate personalized interview questions, evaluate answers in real time, and craft professional cover letters.

[![Next.js](https://img.shields.io/badge/Next.js_14-000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express.js-000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Razorpay](https://img.shields.io/badge/Razorpay-0C2451?logo=razorpay&logoColor=white)](https://razorpay.com/)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Resume Analyzer** | AI-powered match scoring against job descriptions with strengths, gaps, and keyword analysis |
| 💬 **AI Interview Questions** | Personalized questions tailored to the role — Technical, Behavioral, Situational, and HR |
| ⭐ **Answer Evaluator** | Instant scoring with detailed feedback, improvement suggestions, and model answers |
| ✉️ **Cover Letter Generator** | Professional cover letters customized to the role and company |
| 💳 **Pro Plan (Razorpay)** | Secure payment integration with Razorpay Standard Checkout |
| 📧 **Contact Form** | Backend-powered contact form with auto-reply emails via Nodemailer |
| 🔐 **Auth System** | JWT-based authentication with httpOnly cookies — no token in localStorage |

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **AI Engine** | Google Gemini 2.5 Flash |
| **Payments** | Razorpay Standard Checkout |
| **Auth** | JWT with httpOnly cookies |
| **Email** | Nodemailer (Gmail SMTP) |

## 📁 Project Structure

```
ai-interview-coach/
├── backend/
│   └── src/
│       ├── config/             # Database & Razorpay SDK
│       │   ├── database.js
│       │   └── razorpay.js
│       ├── controllers/        # Business logic
│       │   ├── authController.js
│       │   ├── analyzeController.js
│       │   ├── interviewController.js
│       │   ├── paymentController.js
│       │   └── contactController.js
│       ├── middleware/          # JWT auth middleware
│       │   └── authMiddleware.js
│       ├── models/             # Mongoose schemas
│       │   ├── User.js
│       │   ├── Session.js
│       │   └── Payment.js
│       ├── routes/             # Express route definitions
│       │   ├── auth.js
│       │   ├── analyze.js
│       │   ├── interview.js
│       │   ├── payment.js
│       │   └── contact.js
│       ├── services/           # Gemini AI service
│       │   └── geminiService.js
│       └── index.js            # Server entry point
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (auth)/         # Login & Register pages
│       │   ├── (pages)/        # Static pages (about, pricing, etc.)
│       │   ├── analyze/        # Resume analysis page
│       │   ├── dashboard/      # User dashboard
│       │   ├── interview/      # Mock interview page
│       │   ├── layout.tsx      # Root layout (Navbar + Footer)
│       │   └── page.tsx        # Landing page
│       ├── components/         # Reusable UI components
│       │   ├── Navbar.tsx
│       │   ├── Footer.tsx
│       │   ├── PayButton.tsx
│       │   ├── AnalysisSummary.tsx
│       │   ├── EvaluationCard.tsx
│       │   ├── QuestionCard.tsx
│       │   ├── ScoreCircle.tsx
│       │   └── HeroCTA.tsx
│       └── lib/                # API client & TypeScript types
│           ├── api.ts
│           └── types.ts
│
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ → [Download](https://nodejs.org/)
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))
- **Gemini API Key** → [aistudio.google.com](https://aistudio.google.com/apikey)
- **Razorpay Account** → [dashboard.razorpay.com](https://dashboard.razorpay.com/) (for payments)

### 1. Clone the Repository

```bash
git clone https://github.com/Shankhadeep25/AI-Interview-Coach.git
cd AI-Interview-Coach
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your actual keys:

```env
MONGODB_URI=mongodb://localhost:27017/ai-interview-coach
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Start the backend:

```bash
npm run dev    # Runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

Start the frontend:

```bash
npm run dev    # Runs on http://localhost:3000
```

### 4. Open the App

Navigate to **[http://localhost:3000](http://localhost:3000)** and create an account to get started.

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Login & receive JWT cookie |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current user profile |

### Resume Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Analyze resume against job description |
| POST | `/api/analyze/cover-letter` | Generate a cover letter |
| GET | `/api/analyze/sessions` | List all user sessions |
| GET | `/api/analyze/sessions/:id` | Get session details |

### Interview
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interview/generate` | Generate interview questions |
| POST | `/api/interview/evaluate` | Evaluate a user's answer |
| POST | `/api/interview/complete` | Mark interview as completed |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-order` | Create Razorpay order (₹499) |
| POST | `/api/payment/verify-payment` | Verify payment & upgrade to Pro |

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Send contact form email |

## ⚙️ Environment Variables

### Backend (`.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for signing JWTs | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `CLIENT_URL` | Frontend URL for CORS | No (default: http://localhost:3000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `COOKIE_NAME` | Auth cookie name | No (default: aic_token) |
| `RAZORPAY_KEY_ID` | Razorpay public key | Yes (for payments) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key (⚠️ backend only) | Yes (for payments) |
| `EMAIL_USER` | Gmail address for contact form | Yes (for contact) |
| `EMAIL_PASS` | Gmail app password (16 chars) | Yes (for contact) |

### Frontend (`.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend URL | No (default: http://localhost:5000) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key | Yes (for payments) |

## 💰 Pricing Plans

| Plan | Price | Features |
|------|-------|----------|
| **Free** | ₹0 | 5 sessions/month, resume analysis, interview questions, basic evaluation |
| **Pro** | ₹499/month | Unlimited sessions, detailed evaluations, model answers, priority support |

## 📄 Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, features, how it works, CTA |
| Dashboard | `/dashboard` | User sessions, stats, quick actions |
| Analyze | `/analyze` | Resume-JD analysis interface |
| Interview | `/interview/[id]` | Mock interview with AI evaluation |
| Pricing | `/pricing` | Plans with integrated Razorpay checkout |
| About Us | `/about` | Mission, values, product description |
| Contact Us | `/contact` | Contact form + direct info |
| Privacy Policy | `/privacy` | Data collection & usage policies |
| Terms & Conditions | `/terms` | Legal terms of service |
| Refund Policy | `/refund` | Cancellation & refund details |

## 🔒 Security

- Passwords hashed with **bcrypt** (10 salt rounds)
- JWT stored in **httpOnly cookies** — not accessible via JavaScript
- Razorpay **Key Secret** never exposed to the frontend
- Payment verification uses **HMAC signature validation** + payment status fetch
- Rate limiting on all endpoints (100 req/15min global, 10 req/min for AI)
- CORS restricted to the configured frontend origin

## 📝 License

This project is for educational and portfolio purposes.

---

<div align="center">

Built with ❤️ by [Shankhadeep](https://github.com/Shankhadeep25) • Powered by Google Gemini AI

</div>
