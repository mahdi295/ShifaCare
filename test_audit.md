# ShifaCare Project - Comprehensive Test Audit

This document outlines the manual testing procedures for the ShifaCare healthcare platform. Each section covers a specific module or feature set.

## Status Overview
- **Total Tests:** 85+
- **Passed:** 0
- **Failed:** 0
- **Pending:** All

---

## 1. Authentication & Identity Management
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| AUTH-01 | Registration | Create a new patient account | 1. Go to Register page<br>2. Fill valid details<br>3. Submit | Success message & redirect to login/dashboard | ⚪ Pending |
| AUTH-02 | Login | Authenticate existing user | 1. Go to Login page<br>2. Enter credentials<br>3. Submit | User session started, redirect to dashboard | ⚪ Pending |
| AUTH-03 | Forgot Password | Request reset link (dev mode) | 1. Go to Forgot Password<br>2. Enter registered email | Amber box with clickable reset link button | ⚪ Pending |
| AUTH-04 | Reset Password | Change password via link | 1. Click link from dev reset<br>2. Enter new password | Password updated successfully, redirected to login | ⚪ Pending |
| AUTH-05 | Reset Password (Expired) | Use expired/used token | 1. Visit a stale reset link | "Link Expired" screen with "Request New Link" button | ⚪ Pending |
| AUTH-06 | Profile Update | Modify user details | 1. Go to Profile<br>2. Update name/phone<br>3. Save | Profile saved and reflected in UI | ⚪ Pending |
| AUTH-07 | Avatar Upload | Change profile picture | 1. Go to Profile<br>2. Upload image<br>3. Save | Avatar updated via Cloudinary, displays correctly | ⚪ Pending |
| AUTH-08 | Avatar Delete | Remove profile picture | 1. Go to Profile<br>2. Delete avatar | Avatar removed, shows default | ⚪ Pending |
| AUTH-09 | Change Password | Update from Profile | 1. Profile > Change Password<br>2. Old + new + confirm | Password changed, can login with new password | ⚪ Pending |
| AUTH-10 | Logout | Terminate session | 1. Click Logout in Navbar | Session cleared, redirect to Home/Login | ⚪ Pending |
| AUTH-11 | Email case-insensitive | Login with different case | 1. Register as `User@Example.com`<br>2. Login as `user@example.com` | Login succeeds | ⚪ Pending |

## 2. User Roles & Access Control
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| ACC-01 | Sidebar Filtering | Role-based menu links | 1. Login as Patient<br>2. Check sidebar<br>3. Repeat for Doctor/Admin | Patient only sees Appts/Presc/Payments/Profile. Doctor also sees Earnings. Admin sees everything including management links. | ⚪ Pending |
| ACC-02 | Route Guarding | Protected URL access | 1. Logged in as Patient<br>2. Manually go to /dashboard/users | Redirected to dashboard (Not authorized) | ⚪ Pending |
| ACC-03 | Admin self-protection | Admin can't deactivate self | 1. Admin Profile > try to deactivate own account | Action blocked by backend | ⚪ Pending |

## 3. Admin Management (Admin Role Only)
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| ADM-01 | Create Staff | Admin creates Doctor | 1. Go to Admin > Doctors<br>2. Fill name/email/password/department<br>3. Submit | Doctor account created, user + doctor profile in DB | ⚪ Pending |
| ADM-02 | User Activation | Toggle user active status | 1. Go to User Management<br>2. Disable a user | User cannot login (403 on login attempt) | ⚪ Pending |
| ADM-03 | Revenue Chart | View earnings analytics | 1. Go to Revenue page | Area chart (12 months), Bar chart (top 5 docs), Pie chart (status breakdown) | ⚪ Pending |
| ADM-04 | Analytics Cards | View summary stats | 1. Go to Admin Overview | Cards show total users, doctors, appointments, departments, monthly revenue | ⚪ Pending |
| ADM-05 | Confirm Payment | Manual payment confirmation | 1. Go to Pending Payments<br>2. Confirm a transaction | Payment status updates to "successful" | ⚪ Pending |
| ADM-06 | CSV Export | Export data to CSV | 1. Go to All Appointments / Users / Revenue<br>2. Click "Export CSV" | Browser downloads .csv file | ⚪ Pending |

## 4. Doctor Management
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| DOC-01 | Add Doctor | Admin adds new doctor | 1. Admin Dash > Doctors<br>2. Add details & specialities | Doctor appears in public listings | ⚪ Pending |
| DOC-02 | Edit Doctor | Update doctor info | 1. Admin > Doctors > Edit | Changes reflected everywhere | ⚪ Pending |
| DOC-03 | Delete Doctor | Remove doctor | 1. Admin > Doctors > Delete | Doctor removed from system | ⚪ Pending |
| DOC-04 | Doctor Availability | Toggle online status | 1. Doctor Profile > Toggle | Availability status updates, affects booking | ⚪ Pending |
| DOC-05 | Doctor Details | Public profile view | 1. Click on Doctor Card | Shows Bio, Fee, Degree, Experience, Speciality, Schedule, and Slots | ⚪ Pending |
| DOC-06 | Earnings Tracking | Doctor views revenue | 1. Doctor Dash > Earnings | Shows total, this month, last month, growth %, monthly chart, recent payments | ⚪ Pending |

## 5. Department Management
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| DEP-01 | List Departments | Public listing | 1. Visit Departments Page | Shows all active departments with images | ⚪ Pending |
| DEP-02 | Add Department | Admin creates | 1. Admin > Departments > Add | New department appears in public view | ⚪ Pending |
| DEP-03 | Edit Department | Update name/description | 1. Admin > Departments > Edit | Changes reflected | ⚪ Pending |
| DEP-04 | Delete Department | Remove (no doctors) | 1. Admin > Departments > Delete (empty dept) | Department removed | ⚪ Pending |
| DEP-05 | Delete Blocked Department | Remove (has doctors) | 1. Admin > Departments > Delete (dept with doctors) | Error: "Cannot delete, doctors assigned" | ⚪ Pending |

## 6. Appointment System
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| APP-01 | Slot Generation | View available timings | 1. Visit Doctor details for a date | 30-min slots generated based on schedule, booked slots excluded | ⚪ Pending |
| APP-02 | Book Appointment | Patient books a slot | 1. Select slot<br>2. Enter symptoms<br>3. Confirm booking | Appointment created with 'pending' status, serial number assigned | ⚪ Pending |
| APP-03 | Duplicate Booking | Same doctor+date+slot | 1. Book again same slot | Error: slot already taken | ⚪ Pending |
| APP-04 | Past Date Rejection | Book in past | 1. Try to book for yesterday | Error: cannot book past dates | ⚪ Pending |
| APP-05 | Cancel Appointment (Unpaid) | Cancel free appointment | 1. My Appointments > Cancel | Status changes to 'cancelled' | ⚪ Pending |
| APP-06 | Cancel Appointment (Paid) | Cancel paid appt | 1. Try to cancel a paid appointment | Cancel button hidden; must use refund flow | ⚪ Pending |
| APP-07 | Reschedule | Change date+slot | 1. My Appointments > Reschedule<br>2. Pick new date+slot | Date and slot updated, status reset to pending, serial recalculated | ⚪ Pending |
| APP-08 | Confirm Appointment | Doctor check-in | 1. Doctor Dash > Confirm | Status → 'confirmed' | ⚪ Pending |
| APP-09 | Complete Appointment | Doctor issues prescription | 1. Doctor > Prescribe<br>2. Fill + Submit | Status → 'completed', Prescription created | ⚪ Pending |
| APP-10 | Today's View | Dashboard overview | 1. Check Today's Appts | Shows only appointments for current date | ⚪ Pending |
| APP-11 | Video Call | Jitsi consultation | 1. On confirmed appointment > Join Video Call | Jitsi Meet opens in new tab with appointment-specific room | ⚪ Pending |

## 7. Payments (SSLCommerz Integration)
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| PAY-01 | Initiate Payment | Trigger SSLCommerz | 1. Go to Unpaid Appt<br>2. Click Pay Now | Redirects to SSLCommerz Gateway Page | ⚪ Pending |
| PAY-02 | Payment Success | Handle success callback | 1. Complete Sandbox payment | Redirect to dashboard, 'paid' status, receipt available | ⚪ Pending |
| PAY-03 | Payment Fail | Handle failure callback | 1. Fail payment in Gateway | Redirect to dashboard with error toast, status stays 'pending' | ⚪ Pending |
| PAY-04 | Payment Cancel | Handle cancel callback | 1. Cancel payment in Gateway | Redirect to dashboard, status → 'cancelled' | ⚪ Pending |
| PAY-05 | Payment Receipt | View/download receipt | 1. On paid appt > Receipt button | Modal with styled receipt, print button | ⚪ Pending |
| PAY-06 | Refund Request | Patient requests refund | 1. Paid appt > Request Refund<br>2. Enter reason | Payment status → 'refund_requested' | ⚪ Pending |
| PAY-07 | Admin Refund | Admin processes refund | 1. Admin > Refund Requests > Approve | Payment → 'refunded', Appointment → 'cancelled' | ⚪ Pending |
| PAY-08 | Block direct cancel on paid | Paid can't be cancelled directly | 1. Pay for an appointment<br>2. Try to Cancel (button hidden)<br>3. API call returns 400 | Cancel hidden; API rejects with "use refund instead" | ⚪ Pending |
| PAY-09 | IPN spoofing rejected | Fake IPN POST | 1. POST to `/api/v1/payments/ipn` with fake `tran_id` + `status=VALID` | Payment NOT marked successful (val_id validation fails) | ⚪ Pending |
| PAY-10 | Payment History | View transactions | 1. Payments page | 4 stat cards, filterable history list with status badges | ⚪ Pending |

## 8. Prescriptions
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| PRE-01 | Create Prescription | Doctor adds prescription | 1. Doctor Dash > Appt<br>2. Add diagnosis + medicines + advice + follow-up | Data saved, Appointment status → 'completed' | ⚪ Pending |
| PRE-02 | View Prescription | Patient views details | 1. Patient Dash > Prescriptions | Shows diagnosis, medicines (name/dosage/duration/instructions), advice, follow-up | ⚪ Pending |
| PRE-03 | Prescription List | Filter prescriptions | 1. Search/filter prescriptions | Correct records filtered in list | ⚪ Pending |
| PRE-04 | Duplicate Prevention | Double prescription | 1. Try to prescribe for already-prescribed appointment | Error: prescription already exists | ⚪ Pending |

## 9. AI Assistant Chatbot
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| BOT-01 | Open widget | Floating chat bubble works | 1. Click bottom-right chat bubble | Chat window opens with welcome message | ⚪ Pending |
| BOT-02 | Platform FAQ | Ask about booking/refund | 1. Ask "How do refunds work?" | Accurate answer matching refund policy | ⚪ Pending |
| BOT-03 | Symptom triage | Describe a mild symptom | 1. Say "I have a skin rash for 3 days"<br>2. Answer follow-ups | Bot asks 2-3 follow-ups, then suggests Dermatology + a real available doctor | ⚪ Pending |
| BOT-04 | Emergency redirect | Describe emergency symptom | 1. Say "severe chest pain and can't breathe" | Bot immediately tells user to call emergency / go to ER, skips triage | ⚪ Pending |
| BOT-05 | No diagnosis | Push for a diagnosis | 1. Ask "What disease do I have?" | Bot declines to diagnose, recommends booking a doctor | ⚪ Pending |
| BOT-06 | Live data accuracy | Ask for doctors in a department | 1. Ask "Which cardiologists are available?" | Names/fees match what's actually in the DB right now | ⚪ Pending |
| BOT-07 | Missing API key | Server has no GROQ_API_KEY | 1. Remove key, restart backend<br>2. Send a chat message | Friendly "chatbot not configured" message, no crash | ⚪ Pending |
| BOT-08 | Rate limit | Spam messages | 1. Send 20+ messages within a minute | After 20, get "too many messages" response (429) | ⚪ Pending |
| BOT-09 | Conversation persistence | History across messages | 1. Send multiple messages | Bot remembers context within session (localStorage) | ⚪ Pending |

## 10. Global UI/UX
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| UI-01 | Hero Slider | Image rotation | 1. Stay on Home Page | 3 images slide automatically (3s interval) | ⚪ Pending |
| UI-02 | Page Transitions | Smooth navigation | 1. Click different links | Fade/slide effects visible (Framer Motion) | ⚪ Pending |
| UI-03 | Responsive Design | Mobile layout | 1. Open on mobile / DevTools | Layout adjusts, menu becomes hamburger with language toggle | ⚪ Pending |
| UI-04 | Skeleton Loaders | Loading states | 1. Slow network load | Placeholders visible while fetching data | ⚪ Pending |
| UI-05 | Language Switcher | EN / বাং toggle | 1. Click EN/বাং in Navbar | Navbar, Footer, About, Login, Register switch language immediately | ⚪ Pending |
| UI-06 | Mobile Language Toggle | Language on mobile | 1. Open mobile menu | Language toggle button visible in hamburger menu | ⚪ Pending |
| UI-07 | Toast Notifications | Action feedback | 1. Perform any action (book, pay, etc.) | Sonner toast appears with appropriate color (success/error/info) | ⚪ Pending |

## 11. Database & Integrity (Verification via MongoDB/Compass)
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| DB-01 | User Roles | Correct role assignment | 1. Check User document in DB | role is 'patient', 'doctor', or 'admin' | ⚪ Pending |
| DB-02 | Appointment Link | Doc/Pat relationship | 1. Check Appointment document | 'doctor' and 'patient' IDs are valid ObjectId refs | ⚪ Pending |
| DB-03 | Transaction IDs | SSLCommerz IDs | 1. Check Payment document | transactionId format: PS-[timestamp]-[userid] | ⚪ Pending |
| DB-04 | Soft Side Effects | Automatic status updates | 1. Pay for appointment<br>2. Check DB | paymentStatus becomes 'paid' automatically | ⚪ Pending |
| DB-05 | Refund Fields | Refund tracking | 1. Process a refund<br>2. Check Payment document | refundReason, refundRequestedAt, refundedAt populated | ⚪ Pending |
| DB-06 | Compound Indexes | Query performance | 1. Check Appointment indexes | doctor+date+status and patient+date indexes exist | ⚪ Pending |

## Testing Prerequisites
1. **Database:** Ensure MongoDB is connected and seeded (`npm run seed` in backend).
2. **Environment:** `.env` files for both frontend and backend must be configured.
3. **SSLCommerz:** Use Sandbox credentials for payment testing.
4. **Groq API key:** Set `GROQ_API_KEY` in `backend/.env` to test the AI chatbot.
5. **Ngrok:** Required for local SSLCommerz IPN callbacks.
6. **Frontend Build:** `npm run build` should complete without errors.

## Notes
- Use the Browser Console (F12) to check for API errors.
- Monitor Backend terminal for server-side logs.
- Document any bugs found in a separate `bugs.md` or as notes below.

---

## Step-by-Step Testing Walkthrough

Follow this exactly, in order. At each step, copy what you see (especially terminal text) and investigate if something looks wrong.

### 0. Prerequisites
1. `backend/.env` — fill in MONGO_URI, JWT_SECRET, CLOUDINARY_*, SSL_STORE_*, GROQ_API_KEY
2. `backend/.env` — set BACKEND_URL to your ngrok URL for payment testing
3. Run `npm run seed` in backend if you want demo data

### 1. Start backend
```bash
cd backend
npm run dev
```
✅ Expected: `Server running in development mode on port 5000` and `MongoDB Connected`.

### 2. Start frontend
```bash
cd frontend
npm run dev
```
✅ Expected: `VITE ... ready` and `Local: http://localhost:5173/`.

### 3. Test production build
```bash
cd frontend
npm run build
```
✅ Expected: ends with `✓ built in X.XXs`, no errors. (~2880 modules, 5 vendor chunks)

### 4. Test language switcher
- Click EN / বাং button in Navbar → Nav links, Footer, About, Login, Register switch instantly.

### 5. Test chatbot
1. Set `GROQ_API_KEY`, restart backend.
2. Click chat bubble → ask "Which doctors are available?" → lists real doctors.
3. Ask "I have stomach pain" → bot asks 2-3 questions → suggests dept + doctor.
4. Ask "What disease do I have?" → bot declines to diagnose.
5. Say "severe chest pain" → bot redirects to emergency services.
6. Remove GROQ_API_KEY → bot shows "not configured" message (no crash).

### 6. Test registration & auth
1. Register at `/register`, login at `/login`.
2. Forgot password → dev amber box with clickable reset link.
3. Click link → reset password → redirected to login.

### 7. Test appointment booking
1. Browse doctors → pick date/slot → book → status "pending".
2. Duplicate booking → rejected.
3. Reschedule → new date/slot → updated.
4. Cancel unpaid → status "cancelled".

### 8. Test payment
1. Start ngrok, set BACKEND_URL, restart backend.
2. Pay → SSLCommerz → success → redirects with toast.
3. Receipt button appears → print/download.

### 9. Test refund
1. Paid appointment → Request Refund → status "refund_requested".
2. Admin → Refund Requests → Approve → status "refunded", appointment cancelled.

### 10. Test doctor flow
1. Login as doctor → confirm appointment → prescribe → auto-completes.
2. My Earnings page shows stats + chart.

### 11. Test admin flow
1. All Appointments page with filters.
2. Revenue page with charts + CSV export.
3. Users/Doctors/Departments CRUD.

### 12. Test video consultation
- On confirmed appointment → Join Video Call → Jitsi Meet opens.

### 13. Test CSV export (admin)
- All Appointments / Users / Revenue pages → Export CSV → file downloads.

### 14. Test responsive design
- Mobile DevTools → hamburger menu with language toggle, touch-friendly.
