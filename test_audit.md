# ShifaCare Project - Comprehensive Test Audit

This document outlines the manual testing procedures for the ShifaCare healthcare platform. Each section covers a specific module or feature set.

## 📋 Status Overview
- **Total Tests:** 50+
- **Passed:** 0
- **Failed:** 0
- **Pending:** All

---

## 1. Authentication & Identity Management
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| AUTH-01 | Registration | Create a new patient account | 1. Go to Register page<br>2. Fill valid details<br>3. Submit | Success message & Redirect to login/dashboard | ⚪ Pending |
| AUTH-02 | Login | Authenticate existing user | 1. Go to Login page<br>2. Enter credentials<br>3. Submit | User session started, redirect to dashboard | ⚪ Pending |
| AUTH-03 | Forgot Password | Request reset link | 1. Go to Forgot Password<br>2. Enter registered email | Email notification sent (check console/mailtrap) | ⚪ Pending |
| AUTH-04 | Reset Password | Change password via link | 1. Click link in email<br>2. Enter new password | Password updated successfully | ⚪ Pending |
| AUTH-05 | Profile Update | Modify user details | 1. Go to Profile<br>2. Update name/phone<br>3. Save | Profile saved and reflected in UI | ⚪ Pending |
| AUTH-06 | Avatar Upload | Change profile picture | 1. Go to Profile<br>2. Upload image<br>3. Save | Avatar updated and displays correctly | ⚪ Pending |
| AUTH-07 | Logout | Terminate session | 1. Click Logout in Navbar | Session cleared, redirect to Home/Login | ⚪ Pending |

## 2. User Roles & Access Control
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| ACC-01 | Sidebar Filtering | Role-based menu links | 1. Login as Patient<br>2. Check sidebar<br>3. Repeat for Doctor/Admin | Patient only sees Appts/Presc/Payments. Admin sees everything. | ⚪ Pending |
| ACC-02 | Route Guarding | Protected URL access | 1. Logged in as Patient<br>2. Manually go to /dashboard/users | Redirected to dashboard or home (Not authorized) | ⚪ Pending |

## 3. Admin Management (Admin Role Only)
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| ADM-01 | Create Staff | Admin creates Doctor/Staff | 1. Go to Admin Dashboard<br>2. Create new Staff/Doctor | Account created, login possible for new user | ⚪ Pending |
| ADM-02 | User Activation | Toggle user active status | 1. Go to User Management<br>2. Disable a user | User should not be able to login | ⚪ Pending |
| ADM-03 | Revenue Chart | View earnings analytics | 1. Go to Revenue page | Chart displays correct monthly data | ⚪ Pending |
| ADM-04 | Analytics Cards | View summary stats | 1. Go to Admin Overview | Cards show total users, doctors, revenue | ⚪ Pending |
| ADM-05 | Confirm Payment | Manual payment confirmation | 1. Go to Pending Payments<br>2. Confirm a transaction | Payment status updates to "Success" | ⚪ Pending |

## 3. Doctor Management
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| DOC-01 | Add Doctor | Admin adds new doctor | 1. Admin Dash > Doctors<br>2. Add details & specialities | Doctor appears in public listings | ⚪ Pending |
| DOC-02 | Doctor Availability | Toggle online status | 1. Doctor Profile > Toggle | Availability status updates in real-time | ⚪ Pending |
| DOC-03 | Doctor Details | Public profile view | 1. Click on Doctor Card | Shows Bio, Fee, Speciality, and Slots | ⚪ Pending |
| DOC-04 | Earnings Tracking | Doctor views revenue | 1. Doctor Dash > Earnings | Shows breakdown of completed appointments | ⚪ Pending |

## 4. Appointment System
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| APP-01 | Slot Generation | View available timings | 1. Visit Doctor details | Slots are generated based on schedule | ⚪ Pending |
| APP-02 | Book Appointment | Patient books a slot | 1. Select slot<br>2. Confirm booking | Appointment created with 'Pending' status | ⚪ Pending |
| APP-03 | Cancel Appointment | User cancels booking | 1. Go to My Appointments<br>2. Click Cancel | Status changes to 'Cancelled' | ⚪ Pending |
| APP-04 | Complete Appointment | Doctor issues prescription | 1. Doctor Dash > Appt<br>2. Fill & Submit Prescription Form | Status changes to 'Completed', Prescription record created, Doctor earnings updated | ⚪ Pending |
| APP-05 | Today's View | Dashboard overview | 1. Check Today's Appts | Shows only appointments for current date | ⚪ Pending |

## 5. Payments (SSLCommerz Integration)
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| PAY-01 | Initiate Payment | Trigger SSLCommerz | 1. Go to Unpaid Appt<br>2. Click Pay Now | Redirects to SSLCommerz Gateway | ⚪ Pending |
| PAY-02 | Payment Success | Handle success callback | 1. Complete Sandbox payment | Redirect to success page, status 'Paid' | ⚪ Pending |
| PAY-03 | Payment Fail | Handle failure callback | 1. Fail payment in Gateway | Redirect to fail page, status 'Pending' | ⚪ Pending |
| PAY-04 | Refund Request | Patient requests refund | 1. Appt > Request Refund | Request sent to Admin for review | ⚪ Pending |
| PAY-05 | Admin Refund | Admin processes refund | 1. Admin > Refund Requests<br>2. Approve | Refund status updated in DB | ⚪ Pending |

## 6. Prescriptions
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| PRE-01 | Create Prescription | Doctor adds prescription | 1. Doctor Dash > Appt<br>2. Fill Presc. Form | Data saved, Appointment status becomes 'Completed' | ⚪ Pending |
| PRE-02 | View Prescription | Patient views details | 1. Patient Dash > Prescriptions | Shows medications, advice from doctor | ⚪ Pending |
| PRE-03 | Prescription List | Filter prescriptions | 1. Search/Filter presc. | Correct records filtered in list | ⚪ Pending |

## 7. Departments
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| DEP-01 | List Departments | Public listing | 1. Visit Departments Page | Shows all active departments | ⚪ Pending |
| DEP-02 | Dept Management | Admin CRUD | 1. Admin Dash > Depts<br>2. Add/Edit/Delete | Changes reflect in public view | ⚪ Pending |

## 8. Global UI/UX
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| UI-01 | Hero Slider | Image rotation | 1. Stay on Home Page | Images slide automatically | ⚪ Pending |
| UI-02 | Page Transitions | Smooth navigation | 1. Click different links | Fade/Slide effects visible | ⚪ Pending |
| UI-03 | Responsive Design | Mobile layout | 1. Open on mobile/DevTools | Layout adjusts, menu becomes hamburger | ⚪ Pending |
| UI-04 | Skeleton Loaders | Loading states | 1. Slow network load | Placeholders visible while fetching | ⚪ Pending |

## 9. Database & Integrity (Verification via MongoDB/Compass)
| ID | Feature | Description | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| DB-01 | User Roles | Correct role assignment | 1. Check User document in DB | role is 'patient', 'doctor', or 'admin' | ⚪ Pending |
| DB-02 | Appointment Link | Doc/Pat relationship | 1. Check Appointment document | 'doctor' and 'patient' IDs are correct | ⚪ Pending |
| DB-03 | Transaction IDs | SSLCommerz IDs | 1. Check Payment document | transactionId format: PS-[timestamp]-[userid] | ⚪ Pending |
| DB-04 | Soft Side Effects | Automatic status updates | 1. Pay for appointment<br>2. Check DB | paymentStatus becomes 'paid' automatically | ⚪ Pending |

---

## 🛠 Testing Prerequisites
1.  **Database:** Ensure MongoDB is connected and seeded (`npm run seed` in backend).
2.  **Environment:** `.env` files for both frontend and backend must be configured.
3.  **SSLCommerz:** Use Sandbox credentials for payment testing.
4.  **Mailtrap/SMTP:** Configure for testing password resets.

## 📝 Notes
- Use the Browser Console (F12) to check for API errors.
- Monitor Backend terminal for server-side logs.
- Document any bugs found in a separate `bugs.md` or as notes below.
