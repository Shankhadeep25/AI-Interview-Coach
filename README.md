<div align="center">

# 🧠 AI Interview Coach (Agentic GenAI Edition)

**Ace every interview with a fully autonomous, conversational AI interviewer**

An end-to-end SaaS platform that leverages Google Gemini 2.5 Flash to analyze resumes, conduct real-time conversational interviews, autonomously execute candidate code, fact-check answers, and generate comprehensive performance analytics.

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

AI Interview Coach goes beyond traditional AI wrappers by implementing a cutting-edge **Agentic Workflow**. Instead of just generating static questions, the platform acts as a stateful, conversational technical recruiter. It uses **Server-Sent Events (SSE)** to stream real-time responses and employs **Autonomous Function Calling** to execute candidate-provided code snippets (via the Piston API) and fact-check responses dynamically during the interview.

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
- [Gemini AI & Agentic Tools](#-gemini-ai--agentic-tools)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 **Conversational AI Interviewer** | A dynamic, multi-turn chat interface powered by Gemini 2.5 Flash. It adapts to user responses, asks follow-up questions, and tracks conversation state across sessions. |
| ⚡ **Real-Time SSE Streaming** | ChatGPT-like typing experience using Server-Sent Events and Async Generators to stream chunks of text instantly. |
| 🛠️ **Agentic Function Calling** | The AI autonomously decides when to use external tools. It can execute code snippets (Piston API) and fact-check technical definitions during the interview. |
| 📄 **Resume Analyzer** | AI-powered match scoring (0–100%) with strengths, gaps, keyword analysis, and resume improvement suggestions based on the provided Job Description. |
| 📊 **Performance Analytics** | A dedicated `/dashboard/analytics` page utilizing **Recharts** to visualize candidate progress (Line Charts) and skill footprints (Radar Charts). |
| ✉️ **Cover Letter Generator** | Professional, role-specific cover letters generated instantly based on interview context and resume. |
| 💳 **Pro Plan (Razorpay)** | Secure payment checkout with two-phase verification (HMAC signature + payment status fetch). |
| 🔐 **Secure Auth** | JWT authentication with httpOnly cookies — tokens never exposed to JavaScript. |

---

## 🏗️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js (App Router) | 14.2.x |
| **UI Framework** | Tailwind CSS + Recharts | 3.4.x |
| **Language** | TypeScript | 5.x |
| **Backend** | Express.js | 4.21.x |
| **Runtime** | Node.js | 18+ |
| **Database** | MongoDB (Mongoose ODM) | 8.9.x |
| **AI Engine** | Google Gemini 2.5 Flash | @google/generative-ai 0.21.x |
| **Code Execution**| Piston API | REST |
| **Payments** | Razorpay Standard Checkout | 2.9.x |
| **Auth** | JSON Web Tokens (httpOnly cookies) | jsonwebtoken 9.x |

---

## 🔀 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│             Next.js 14 · Tailwind CSS · Recharts                │
│           Axios (withCredentials) + native fetch (SSE)          │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTPS / REST / SSE Streams
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXPRESS.JS SERVER (:5000)                    │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │  Auth    │  │ Analyze  │  │ Interview │  │   Payment     │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬────────┘  │
│       │              │              │               │           │
│  ┌────▼──────────────▼──────────────▼───────────────▼────────┐  │
│  │              Middleware Layer                              │  │
│  │  JWT Auth · Zod Validation · Rate Limiting · Error Handler│  │
│  └────┬──────────────┬──────────────┬───────────────┬────────┘  │
│       │              │              │               │           │
│       ▼              ▼              ▼               ▼           │
│  ┌─────────┐  ┌────────────┐  ┌──────────┐  ┌────────────┐     │
│  │ MongoDB │  │ Gemini API │  │ Piston   │  │ Razorpay   │     │
│  │ (Atlas) │  │  (Google)  │  │   API    │  │   SDK      │     │
│  └─────────┘  └────────────┘  └──────────┘  └────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed and configured:

| Requirement | Purpose | Link |
|------------|---------|------|
| **Node.js 18+** | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| **MongoDB** | Database (local or Atlas) | [mongodb.com/atlas](https://www.mongodb.com/atlas) |
| **Gemini API Key** | AI-powered analysis | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **Razorpay Account** | Payment processing (optional) | [dashboard.razorpay.com](https://dashboard.razorpay.com/) |

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
cp .env.example .env
```

Open `.env` and fill in your actual credentials.

Start the backend server:

```bash
npm run dev    # → http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create the `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

Start the frontend dev server:

```bash
npm run dev    # → http://localhost:3000
```

### 4. Open the App

Navigate to **[http://localhost:3000](http://localhost:3000)**. (Note: Always use `localhost` rather than `127.0.0.1` to ensure JWT httpOnly cookies work across CORS origins).

---

## 🤖 Gemini AI & Agentic Tools

The application uses **Google Gemini 2.5 Flash** through the `@google/generative-ai` SDK. The interviewer is configured as a stateful agent with access to the following tools:

| Tool | Function | Description |
|---------|----------|-------|
| **`executeCode`** | Autonomous Code Execution | The AI can extract code snippets provided by the user, send them to the Piston execution engine, and analyze the stdout/stderr output in real-time. |
| **`factCheck`** | External Knowledge Retrieval | The AI can query an external mock API to verify technical facts, definitions, and frameworks mentioned by the candidate. |

**Streaming Interception:**
When the AI decides to use a tool, the backend intercepts the SSE stream, dispatches the tool action, updates the frontend UI with a dynamic status (e.g., "Executing code..."), and feeds the tool response back into the model to seamlessly resume the stream.

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m "feat: added new visualization"`)
4. **Push** to your branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<div align="center">

**Shankhadeep Dey**

[![GitHub](https://img.shields.io/badge/GitHub-Shankhadeep25-181717?style=for-the-badge&logo=github)](https://github.com/Shankhadeep25)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/shankhadeep-dey/)

---

Built with ❤️ and ☕ · Powered by Agentic Google Gemini AI

</div>
