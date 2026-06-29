# ShifaCare Backend

Express + MongoDB REST API for the ShifaCare Hospital Management System.

## Tech Stack

- Node.js (ES modules — `"type": "module"`)
- Express.js 4
- MongoDB + Mongoose 8
- JWT authentication (httpOnly cookie + Bearer header)
- bcryptjs (password hashing, 10 rounds)
- SSLCommerz (payment gateway for Bangladesh)
- Cloudinary (image uploads — face-crop, 400x400)
- Nodemailer (password reset emails — dev fallback returns link in API)
- Groq API (AI chatbot — Llama 3.3 70B via function-calling)
- Multer (file upload — images only, 2MB max)
- Helmet (security headers), CORS, express-rate-limit

## Project Structure

```
backend/
├── index.js              # Entry: helmet, CORS, rate-limit, route mounting
├── config/db.js          # MongoDB connection via Mongoose
├── controllers/          # Business logic (9 files)
│   ├── authController.js
│   ├── adminController.js
│   ├── appointmentController.js
│   ├── chatbotController.js
│   ├── departmentController.js
│   ├── doctorController.js
│   ├── paymentController.js
│   ├── prescriptionController.js
│   └── slotController.js
├── middleware/
│   ├── auth.js           # JWT verification + role authorization
│   ├── error.js          # Global error handler
│   └── upload.js         # Multer + Cloudinary upload config
├── models/               # Mongoose schemas (6 models)
│   ├── User.js
│   ├── Doctor.js
│   ├── Department.js
│   ├── Appointment.js
│   ├── Payment.js
│   └── Prescription.js
├── routes/               # Express routers (8 groups)
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── appointmentRoutes.js
│   ├── chatbotRoutes.js
│   ├── departmentRoutes.js
│   ├── doctorRoutes.js
│   ├── paymentRoutes.js
│   └── prescriptionRoutes.js
├── utils/
│   ├── asyncHandler.js   # Async route wrapper
│   ├── clinicKnowledge.js # Static clinic info for chatbot
│   ├── errorResponse.js  # Custom error class
│   └── slotGenerator.js  # 30-min slot generation
├── seed.js               # Demo data seeder
├── .env.example
└── package.json
```

## API Endpoints

### Auth — `/api/v1/auth` (rate-limited: 200/min)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/register` | Public | Patient self-registration (role forced to patient) |
| POST | `/login` | Public | Login (any role) |
| GET | `/logout` | Public | Clear auth cookie |
| POST | `/forgotpassword` | Public | Send/return reset token (SHA-256, 10-min expiry) |
| PUT | `/resetpassword/:token` | Public | Reset password with token |
| GET | `/me` | Private | Get current user |
| PUT | `/updateprofile` | Private | Update name/phone/address |
| PUT | `/updatepassword` | Private | Change password (requires old password) |
| PUT | `/avatar` | Private | Upload avatar to Cloudinary |
| DELETE | `/avatar` | Private | Remove avatar |
| POST | `/create-staff` | Admin | Create doctor account (User + optional password) |

### Appointments — `/api/v1/appointments`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/` | Patient | Book appointment (auto-assigns serial number) |
| GET | `/me` | All roles | Get my appointments (role-filtered) |
| GET | `/today` | Doctor/Admin | Today's appointments sorted by slot |
| GET | `/:id` | Private | Get single appointment |
| PUT | `/:id/cancel` | Patient/Admin | Cancel appointment (blocked if paid — must use refund) |
| PUT | `/:id/status` | Doctor/Admin | Update status (confirmed/completed/cancelled) |
| PUT | `/:id/reschedule` | Patient/Admin | **Reschedule** to new date + slot (resets serial) |

### Payments — `/api/v1/payments`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/init/:appointmentId` | Patient | Start SSLCommerz payment session |
| POST | `/success/:tran_id` | Public | SSLCommerz success callback (validates `val_id` via API) |
| POST | `/fail/:tran_id` | Public | SSLCommerz fail callback |
| POST | `/cancel/:tran_id` | Public | SSLCommerz cancel callback |
| POST | `/ipn` | Public | SSLCommerz IPN (validates via API + amount cross-check) |
| GET | `/me` | Patient/Admin | Payment history |
| POST | `/:id/refund` | Patient/Admin | **Request refund** (patient) or **approve** (admin) |
| GET | `/refund-requests` | Admin | List all refund requests |

### Doctors — `/api/v1/doctors`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Public | List all doctors (filter by department/availability) |
| GET | `/:id` | Public | Doctor detail (populates department + user info) |
| GET | `/:id/slots?date=` | Public | Available 30-min slots for a date |
| GET | `/me/earnings` | Doctor | **Own earnings** — total, this month, last month, growth %, monthly chart data, recent 10 payments |
| POST | `/` | Admin | Add doctor profile (User must already exist) |
| PUT | `/:id` | Admin/Doctor | Update doctor profile |
| DELETE | `/:id` | Admin | Delete doctor |
| PUT | `/:id/toggle-availability` | Admin/Doctor | Toggle availability |

### Admin — `/api/v1/admin` (all admin-only)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/analytics` | Dashboard stats (counts, revenue, recent) |
| GET | `/users` | All users (filter by role, search by name/email) |
| PUT | `/users/:id/toggle` | Activate/deactivate user (cannot self-deactivate) |
| GET | `/payments/pending` | Pending payments |
| PUT | `/payments/:id/confirm` | Manual payment confirmation |
| GET | `/appointments` | **All appointments** (filter by status/date, search by patient/doctor name) |
| GET | `/revenue-chart` | **Monthly revenue** (12mo), **top 5 doctors** by revenue, **status breakdown** counts |
| GET | `/refunds` | **All refund requests** (refund_requested + refunded) |

### Departments — `/api/v1/departments`
| Method | Route | Access |
|--------|-------|--------|
| GET | `/` | Public |
| GET | `/:id` | Public (includes doctors in department) |
| POST | `/` | Admin |
| PUT | `/:id` | Admin |
| DELETE | `/:id` | Admin (blocked if doctors assigned to this department) |

### Prescriptions — `/api/v1/prescriptions` (all private)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/` | Doctor | Create prescription (auto-completes appointment, checks for duplicate) |
| GET | `/me` | Doctor/Patient | Role-filtered prescription list |
| GET | `/:id` | Private | Single prescription detail |

### Chatbot — `/api/v1/chatbot` (rate-limited: 20/min)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/message` | Public | Send message to Groq AI assistant (injects live DB data + clinic knowledge; function-calling for deeper lookups) |

## Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| email | String | unique, lowercase, validated |
| role | String | enum: patient/doctor/admin |
| password | String | minlength 6, bcrypt hashed, select:false |
| avatar | String | Cloudinary URL |
| phone | String | |
| address | String | |
| isActive | Boolean | default: true |
| resetPasswordToken | String | SHA-256 hash |
| resetPasswordExpire | Date | 10-min expiry |

### Doctor
| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | ref: User |
| department | ObjectId | ref: Department |
| specialization | String | |
| experience | Number | years |
| degree | String | MBBS, MD, etc. |
| fees | Number | consultation fee |
| about | String | max 500 chars |
| isAvailable | Boolean | default: true |
| rating | Number | default: 0 |
| totalReviews | Number | default: 0 |
| schedule | Array | { day, startTime, endTime } |

### Appointment
| Field | Type | Notes |
|-------|------|-------|
| patient | ObjectId | ref: User |
| doctor | ObjectId | ref: Doctor |
| appointmentDate | Date | |
| slot | String | "09:00 AM" format |
| status | String | pending → confirmed → completed / cancelled |
| paymentStatus | String | unpaid / paid |
| fees | Number | |
| symptoms | String | required |
| notes | String | |
| serialNumber | Number | auto-assigned queue position |
| Indexes | | doctor+date+status, patient+date |

### Payment
| Field | Type | Notes |
|-------|------|-------|
| appointment | ObjectId | ref: Appointment |
| patient | ObjectId | ref: User |
| amount | Number | |
| transactionId | String | unique |
| status | String | pending → successful/failed/cancelled → refund_requested → refunded |
| method | String | bkash, nagad, card, etc. |
| paidAt | Date | |
| refundReason | String | |
| refundRequestedAt | Date | |
| refundedAt | Date | |

### Prescription
| Field | Type | Notes |
|-------|------|-------|
| appointment | ObjectId | ref: Appointment |
| doctor | ObjectId | ref: Doctor |
| patient | ObjectId | ref: User |
| diagnosis | String | |
| medicines | Array | { name, dosage, duration, instructions } |
| advice | String | |
| followUpDate | Date | |

### Department
| Field | Type | Notes |
|-------|------|-------|
| name | String | unique, required |
| description | String | |
| image | String | default: no-image.jpg |

## Payment Model — Status Flow

```
pending ──► successful ──► refund_requested ──► refunded
       ↘ failed
       ↘ cancelled
```

## Security

- **Password**: bcrypt 10 rounds, pre-save hook
- **JWT**: httpOnly cookie (CSRF-resistant) + Bearer header fallback
- **CORS**: Whitelist origins from CLIENT_URL + sslcommerz.com
- **Rate limiting**: 200 req/min general API, 20/min chatbot
- **Helmet**: Security headers (CSP disabled for inline styles)
- **Role enforcement**: Register always sets `role: patient`; admin-only for staff creation
- **Account deactivation**: isActive flag → 403 on login
- **Paid cancel protection**: Rejected with 400 — must use refund flow
- **IPN validation**: Cross-checks `val_id` with SSLCommerz API + amount match
- **Token security**: SHA-256 hash in DB, 10-min expiry, user enumeration prevented

## Running Locally

```bash
cp .env.example .env   # fill in your values
npm install
npm run dev            # starts on :5000 (with nodemon)
npm run seed           # optional: demo data (15 depts, 15 docs, 5 patients, 1 admin)
```

## Environment Variables

See `.env.example` for all required variables including:
- `PORT` (default 5000), `NODE_ENV`
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — strong random string (min 32 chars), `JWT_EXPIRE`, `COOKIE_EXPIRE`
- `CLIENT_URL` — frontend URL (for CORS + redirects)
- `BACKEND_URL` — this server's URL (for SSLCommerz callbacks, set ngrok URL for local testing)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SSL_STORE_ID`, `SSL_STORE_PASS`, `SSL_IS_LIVE` (false for sandbox)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`, `FROM_NAME` — optional email
- `GROQ_API_KEY`, `GROQ_MODEL` — required for AI chatbot
