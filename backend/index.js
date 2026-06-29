import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import errorHandler from './middleware/error.js';
import { connectCloudinary } from './middleware/upload.js';

dotenv.config();

if (process.env.NODE_ENV !== 'test') connectDB();
connectCloudinary();

import auth          from './routes/authRoutes.js';
import departments   from './routes/departmentRoutes.js';
import doctors       from './routes/doctorRoutes.js';
import appointments  from './routes/appointmentRoutes.js';
import prescriptions from './routes/prescriptionRoutes.js';
import payments      from './routes/paymentRoutes.js';
import admin         from './routes/adminRoutes.js';
import chatbot        from './routes/chatbotRoutes.js';

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ── Rate limiter ──────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── CORS ──────────────────────────────────────────────────────────────────────
// FIX: In production, CLIENT_URL is something like https://shifacare.vercel.app
// We build the allowed list from env + common dev ports.
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = Array.from(new Set([
  clientUrl,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://sandbox.sslcommerz.com',
  'https://sslcommerz.com',
  'https://www.sslcommerz.com',
]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, SSLCommerz server callbacks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((o) => origin.startsWith(o))) return callback(null, true);
      console.warn(`CORS blocked: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',          authLimiter, auth);
app.use('/api/v1/departments',   departments);
app.use('/api/v1/doctors',       doctors);
app.use('/api/v1/appointments',  appointments);
app.use('/api/v1/prescriptions', prescriptions);
app.use('/api/v1/payments',      payments);
app.use('/api/v1/admin',         admin);
app.use('/api/v1/chatbot',       chatbot);

app.get('/', (req, res) => res.json({ success: true, message: 'ShifaCare API running' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});