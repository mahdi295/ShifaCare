# ShifaCare Backend

Express + MongoDB REST API for the ShifaCare Hospital Management System.

## Tech Stack

- Node.js (ES modules)
- Express.js
- MongoDB + Mongoose
- JWT authentication (cookie-based)
- SSLCommerz (payment gateway)
- Cloudinary (image uploads)
- Nodemailer (password reset emails)

## API Endpoints

### Auth — `/api/v1/auth`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/register` | Public | Patient self-registration |
| POST | `/login` | Public | Login (any role) |
| GET | `/logout` | Public | Clear auth cookie |
| POST | `/forgotpassword` | Public | Send/return reset token |
| PUT | `/resetpassword/:token` | Public | Reset password with token |
| GET | `/me` | Private | Get current user |
| PUT | `/updateprofile` | Private | Update name/phone/address |
| PUT | `/updatepassword` | Private | Change password |
| PUT | `/avatar` | Private | Upload avatar (Cloudinary) |
| DELETE | `/avatar` | Private | Remove avatar |
| POST | `/create-staff` | Admin | Create doctor account |

### Appointments — `/api/v1/appointments`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/` | Patient | Book appointment |
| GET | `/me` | All roles | Get my appointments (role-filtered) |
| GET | `/today` | Doctor/Admin | Today's appointments |
| GET | `/:id` | Private | Get single appointment |
| PUT | `/:id/cancel` | Patient/Admin | Cancel appointment |
| PUT | `/:id/status` | Doctor/Admin | Update status (confirmed/completed/cancelled) |
| PUT | `/:id/reschedule` | Patient/Admin | **Reschedule** to new date + slot |

### Payments — `/api/v1/payments`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/init/:appointmentId` | Patient | Start SSLCommerz payment |
| POST | `/success/:tran_id` | Public | SSLCommerz success callback |
| POST | `/fail/:tran_id` | Public | SSLCommerz fail callback |
| POST | `/cancel/:tran_id` | Public | SSLCommerz cancel callback |
| POST | `/ipn` | Public | SSLCommerz IPN |
| GET | `/me` | Patient/Admin | Payment history |
| POST | `/:id/refund` | Patient/Admin | **Request or approve refund** |
| GET | `/refund-requests` | Admin | List refund requests |

### Doctors — `/api/v1/doctors`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Public | List all doctors |
| GET | `/:id` | Public | Doctor detail |
| GET | `/:id/slots` | Public | Available slots for date |
| GET | `/me/earnings` | Doctor | **Own earnings + monthly chart** |
| POST | `/` | Admin | Add doctor |
| PUT | `/:id` | Admin/Doctor | Update doctor profile |
| DELETE | `/:id` | Admin | Delete doctor |
| PUT | `/:id/toggle-availability` | Admin/Doctor | Toggle availability |

### Admin — `/api/v1/admin`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/analytics` | Admin | Dashboard stats |
| GET | `/users` | Admin | All users (filterable) |
| PUT | `/users/:id/toggle` | Admin | Activate/deactivate user |
| GET | `/payments/pending` | Admin | Pending payments |
| PUT | `/payments/:id/confirm` | Admin | Manual payment confirm |
| GET | `/appointments` | Admin | **All appointments** (filter/search) |
| GET | `/revenue-chart` | Admin | **Monthly revenue + top doctors + status breakdown** |
| GET | `/refunds` | Admin | **All refund requests** |

### Departments — `/api/v1/departments`
| Method | Route | Access |
|--------|-------|--------|
| GET | `/` | Public |
| GET | `/:id` | Public |
| POST | `/` | Admin |
| PUT | `/:id` | Admin |
| DELETE | `/:id` | Admin |

### Prescriptions — `/api/v1/prescriptions`
| Method | Route | Access |
|--------|-------|--------|
| POST | `/` | Doctor |
| GET | `/me` | Doctor/Patient |
| GET | `/:id` | Private |

## Payment Model — Status Flow

```
pending → successful → refund_requested → refunded
       ↘ failed
       ↘ cancelled
```

## Running Locally

```bash
cp .env.example .env   # fill in your values
npm install
npm run dev            # starts on :5000
npm run seed           # optional demo data
```

## Environment Variables

See `.env.example` for all required variables including:
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — strong random string
- `CLIENT_URL` — frontend URL (for CORS + redirects)
- `BACKEND_URL` — this server's URL (for SSLCommerz callbacks)
- `CLOUDINARY_*` — Cloudinary credentials
- `SSL_STORE_ID` / `SSL_STORE_PASS` — SSLCommerz sandbox credentials
- `SMTP_*` — optional email for password reset
