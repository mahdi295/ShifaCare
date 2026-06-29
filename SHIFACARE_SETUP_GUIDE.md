# ShifaCare Setup Guide

This guide describes how to install, configure, seed, and run the ShifaCare project locally.

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- Git
- A code editor such as VS Code
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (free tier works)
- SSLCommerz sandbox account (for payment testing)
- Groq API key (free at https://console.groq.com/keys — for AI chatbot)

## 1. Clone the repository

```bash
git clone <your-repo-url> shifacare
cd shifacare
```

## 2. Configure backend environment

Copy the backend example env file and fill in your values:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your actual values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/shifacare
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
COOKIE_EXPIRE=30
CLIENT_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
SSL_STORE_ID=your_ssl_store_id
SSL_STORE_PASS=your_ssl_store_password
SSL_IS_LIVE=false

# Email (optional — dev fallback returns reset URL in API response)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
FROM_EMAIL=your@email.com
FROM_NAME=ShifaCare

# AI Chatbot (Groq)
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

> Never commit `.env` to git — it's already in `.gitignore`.

### Frontend env file (optional)

Create `frontend/.env` if you want to override the API URL:

```env
VITE_API_URL=/api/v1
```

## 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

If you encounter peer dependency warnings in the frontend, run:

```bash
npm install --legacy-peer-deps
```

## 4. Seed the database (optional but recommended)

A seeder is included at `backend/seed.js`.

```bash
cd backend
npm run seed
```

This clears existing collections and inserts sample data:
- **15 departments** — Cardiology, ENT, Neurology, Ophthalmology, Orthopedics, Pediatrics, Dermatology, Gynecology, Dentistry, Urology, Nephrology, Pulmonology, Oncology, General Medicine, Psychiatry
- **15 doctors** — Each with 3-day schedule (Sat/Mon/Wed), different specializations and fees
- **1 admin** — `admin@shifacare.com` / `Admin@2024`
- **5 patients** — `rahim@gmail.com`, `fatema@gmail.com`, etc.
- **3 appointments** — mixed statuses (confirmed/pending), some paid
- **2 payments** — successful via card and bKash
- **1 prescription** — with 2 medicines + follow-up

> Use this only in development or when you want a fresh demo dataset.

## 5. Run the servers

Open two terminals.

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

Default URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

If `5173` is occupied, Vite may use the next free port such as `5174`.

## 6. Verify the app

Open the frontend URL in your browser. If backend requests return `401`, the frontend is working — you need to log in or seed sample data first.

### Demo accounts (after seeding):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@shifacare.com` | `Admin@2024` |
| Patient | `rahim@gmail.com` | `Admin@2024` |
| Doctor | `arafat@shifacare.com` | `Admin@2024` |

## 7. Create an admin account

The project does not ship with an admin user by default. Register a user via the frontend and then promote them in MongoDB Atlas:

1. Register at `http://localhost:5173/register`
2. Open MongoDB Atlas → Browse Collections → `users` collection
3. Find your new user document
4. Change `"role": "patient"` to `"role": "admin"`
5. Save and log in again

## 8. User roles

| Role | How to create |
|------|---------------|
| `patient` | Self-register on the website |
| `doctor` | Admin uses the Admin Dashboard → Doctors page (creates User + Doctor profile) |
| `admin` | Manually set role in MongoDB Atlas |

## 9. Useful notes

- The backend is written in ES modules (`type: module` in package.json).
- Tailwind is processed using `postcss.config.cjs` in the frontend.
- The frontend style entry is `src/styles/index.css` imported by `src/main.jsx`.
- The backend CORS origin is configured to allow the frontend dev URL + sslcommerz.com.
- Frontend uses Vite 8 — `manualChunks` is a **function** (not object form) in vite.config.js.
- The chatbot needs `GROQ_API_KEY` to work. Without it, it shows "not configured" without crashing.
- Bengali/English i18n is configured via `i18next` with locale files in `src/locales/`.

## 10. Frontend build

```bash
cd frontend
npm run build
```

Build output goes to `frontend/dist/`. The build splits vendor chunks:
- `react-vendor` — React, React Router DOM
- `ui-vendor` — Framer Motion, Lucide, Sonner
- `form-vendor` — react-hook-form, Zod
- `query-vendor` — @tanstack/react-query
- `pdf-vendor` — jsPDF

## 11. Troubleshooting

- If port `5000` is busy, stop the process using it or change `PORT` in `backend/.env`.
- If MongoDB cannot connect, confirm `MONGO_URI` and Atlas network access settings (whitelist your IP).
- If frontend styles are missing, verify `frontend/postcss.config.cjs` exists and `tailwindcss` is installed.
- If the production build fails, ensure Vite config `manualChunks` uses function form (not object form).
- If the chatbot returns "no doctors found", seed the database or check Admin → Doctors page for available doctors.
- If SSLCommerz shows "contact support", check ngrok URL is current and backend is restarted.

## 12. Testing Payments (Local IPN with Ngrok)

SSLCommerz uses **IPN (Instant Payment Notification)** to confirm payments. Since SSLCommerz servers cannot reach `localhost`, you must use a tunneling service like **ngrok** for local testing:

1. **Install Ngrok:** Download and install from [ngrok.com](https://ngrok.com/).
2. **Start Tunnel:** Run `ngrok http 5000` (or your backend port).
3. **Copy URL:** Copy the `https://...` forwarding URL provided by ngrok.
4. **Update `.env`:** Set `BACKEND_URL` in `backend/.env` to your ngrok URL.
   ```env
   BACKEND_URL=https://your-unique-id.ngrok-free.app
   ```
5. **Restart Backend:** The `paymentIPN` and callbacks will now work correctly for SSLCommerz sandbox.
6. The `paymentSuccess` and `paymentIPN` handlers validate `val_id` with SSLCommerz's validation API using `store_passwd` (corrected parameter name).

## 13. Deployment

### Backend (Render)

The project includes `render.yaml` at root level. Key settings:
- Service: `shifacare-backend`
- Runtime: Node, root: `backend/`
- Build: `npm install`, Start: `npm start`
- Set sensitive env vars (MONGO_URI, JWT_SECRET, etc.) in Render dashboard

### Frontend (Vercel)

The project includes `frontend/vercel.json`:
- SPA rewrites: all paths → `/index.html`
- Asset caching: 1 year immutable for `/assets/*`
- Security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
