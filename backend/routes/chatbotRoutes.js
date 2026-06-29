import express from 'express';
import rateLimit from 'express-rate-limit';
import { chatbotMessage } from '../controllers/chatbotController.js';

const router = express.Router();

// Stricter limit than general API — each call costs Groq API usage.
const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many messages. Please wait a moment and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/message', chatbotLimiter, chatbotMessage);

export default router;
