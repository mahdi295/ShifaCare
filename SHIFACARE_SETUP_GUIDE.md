# ShifaCare Setup Guide

This guide describes how to install, configure, seed, and run the ShifaCare project locally.

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- Git
- A code editor such as VS Code
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- SSLCommerz sandbox account (for payment testing)

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
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

> Get a free Groq API key at https://console.groq.com/keys — needed for the AI chatbot.
> Never commit this key or paste it in chat; if it leaks, revoke and regenerate it immediately.

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

This clears the existing collections and inserts sample data for Users, Departments, Doctors, Appointments, Payments, and Prescriptions.

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

## 7. Create an admin account

The project does not ship with an admin user by default. Register a user via the frontend and then promote them in MongoDB Atlas:

1. Register at `http://localhost:5173/register`
2. Open MongoDB Atlas → Browse Collections → `users` collection
3. Find your new user document
4. Change `"role": "patient"` to `"role": "admin"`
5. Save and log in again

## 8. User roles

| Role      | How to create               |
|-----------|-----------------------------|
| `patient` | Self-register on the website |
| `doctor`  | Admin uses the Admin Dashboard → Doctors page |
| `admin`   | Manually set role in MongoDB Atlas |

## 9. Useful notes

- The backend is written in ES modules (`type: module`).
- Tailwind is processed using `postcss.config.cjs` in the frontend.
- The frontend style entry is `src/styles/index.css` imported by `src/main.jsx`.
- The backend CORS origin is configured to allow the frontend dev URL.

## 10. Troubleshooting

- If port `5000` is busy, stop the process using it or change `PORT` in `backend/.env`.
- If MongoDB cannot connect, confirm `MONGO_URI` and Atlas network access settings.
- If frontend styles are missing, verify `frontend/postcss.config.cjs` exists and `tailwindcss` is installed.

## 11. Testing Payments (Local IPN with Ngrok)

SSLCommerz uses **IPN (Instant Payment Notification)** to confirm payments. Since SSLCommerz servers cannot reach `localhost`, you must use a tunneling service like **ngrok** for local testing:

1.  **Install Ngrok:** Download and install from [ngrok.com](https://ngrok.com/).
2.  **Start Tunnel:** Run `ngrok http 5000` (or your backend port).
3.  **Copy URL:** Copy the `https://...` forwarding URL provided by ngrok.
4.  **Update `.env`:** Set `BACKEND_URL` in `backend/.env` to your ngrok URL.
    ```env
    BACKEND_URL=https://your-unique-id.ngrok-free.app
    ```
5.  **Restart Backend:** The `paymentIPN` and callbacks will now work correctly for SSLCommerz sandbox.
