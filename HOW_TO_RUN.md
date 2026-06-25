# How to Run ShifaCare Locally

## Backend

```bash
cd backend
npm install
npm run dev
```

The backend starts on `http://localhost:5000`. 

**Note for Payments:** For SSLCommerz IPN to work locally, use `ngrok http 5000` and set `BACKEND_URL` in `.env` to the ngrok URL.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173` (or the next free port if 5173 is in use).

## Optional: Seed demo data

```bash
cd backend
npm run seed
```

## Notes

- Frontend uses Vite + React + Tailwind.
- Backend uses Express + MongoDB + JWT auth.
- `frontend/.env` is optional and only needed if you want to override `VITE_API_URL`.
- There are three user roles: `patient` (self-register), `doctor` (admin creates), `admin` (set manually in MongoDB Atlas).
