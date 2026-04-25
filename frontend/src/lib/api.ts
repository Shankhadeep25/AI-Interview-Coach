import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true, // send httpOnly cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// On 401 response, redirect to login (but not if already on auth pages or checking auth status)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      const requestUrl = error.config?.url || '';

      // Don't redirect if:
      // - Already on login/register pages (would cause infinite loop)
      // - The failing request is /auth/me (expected to fail when not logged in)
      const isAuthPage = path === '/login' || path === '/register';
      const isAuthCheck = requestUrl.includes('/auth/me');

      if (!isAuthPage && !isAuthCheck) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const auth = {
  register: (name: string, email: string, password: string) =>
    api.post('/api/auth/register', { name, email, password }),

  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  logout: () => api.post('/api/auth/logout'),

  me: () => api.get('/api/auth/me'),
};

// ─── Analyze ─────────────────────────────────────────────────────────────────
export const analyze = {
  run: (data: {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    resumeText: string;
  }) => api.post('/api/analyze', data),

  coverLetter: (sessionId: string) =>
    api.post('/api/analyze/cover-letter', { sessionId }),

  getSessions: () => api.get('/api/analyze/sessions'),

  getSession: (id: string) => api.get(`/api/analyze/sessions/${id}`),
};

// ─── Interview ───────────────────────────────────────────────────────────────
export const interview = {
  generate: (sessionId: string) =>
    api.post('/api/interview/generate', { sessionId }),

  evaluate: (data: {
    sessionId: string;
    questionId: string;
    question: string;
    type: string;
    userAnswer: string;
    idealAnswerPoints: string[];
  }) => api.post('/api/interview/evaluate', data),

  complete: (sessionId: string) =>
    api.post('/api/interview/complete', { sessionId }),
};

export default api;
