# Interview AI — yt-genai

A full-stack AI-powered interview preparation app. Upload your resume PDF, provide a job description and self-description, and get a tailored interview report with technical/behavioral questions, skill gap analysis, and a preparation plan. You can also generate a polished, ATS-friendly resume PDF.

## Stack
- **Frontend**: React 19 + Vite + React Router + SASS (`Frontend/`)
- **Backend**: Node.js + Express 5 + MongoDB + Google Generative AI (`Backend/`)
- **Auth**: JWT stored in cookies
- **PDF input**: `pdf-parse` (text extraction from uploaded resume)
- **PDF output**: `puppeteer` + Gemini-generated HTML

## Running locally
1. Set the required environment variables (see below).
2. In `Backend/`: `npm install && npm run dev` → starts Express on port 3000
3. In `Frontend/`: `npm install && npm run dev` → starts Vite on port 5173 (proxies `/api` to port 3000)

## Required environment variables (Backend)
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `GOOGLE_GENAI_API_KEY` | Google Generative AI API key |

## API routes
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/logout` | Logout (blacklists token) |
| GET | `/api/auth/get-me` | Get current user |
| POST | `/api/interview/` | Upload resume PDF + generate interview report |
| GET | `/api/interview/` | Get all reports for logged-in user |
| GET | `/api/interview/report/:id` | Get a single report |
| POST | `/api/interview/resume/pdf/:id` | Generate and download a resume PDF |

## User preferences
<!-- Add user preferences here -->
