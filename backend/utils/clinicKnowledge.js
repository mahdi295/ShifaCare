// ─────────────────────────────────────────────────────────────────────────────
// Static clinic knowledge for the AI chatbot.
// EDIT THIS with your real info — the chatbot reads this text directly.
// Live data (doctors, departments, fees, slots) is fetched separately from
// the database — you don't need to duplicate that here.
// ─────────────────────────────────────────────────────────────────────────────

const CLINIC_KNOWLEDGE = `
ShifaCare Hospital — General Information

ABOUT:
ShifaCare is a hospital management platform connecting patients with doctors
across multiple departments. Patients can browse doctors, book appointments,
pay online, get prescriptions, and manage everything from one dashboard.

LOCATION & HOURS:
- Address: [FILL IN YOUR ADDRESS]
- Working days: [FILL IN, e.g. Saturday–Thursday]
- Working hours: [FILL IN, e.g. 9:00 AM – 9:00 PM]
- Emergency contact: [FILL IN PHONE NUMBER]

HOW BOOKING WORKS:
1. Patient browses doctors by department or searches directly.
2. Patient selects an available time slot for a doctor.
3. Patient confirms booking (status starts as "pending").
4. Patient pays the consultation fee online via SSLCommerz (bKash, cards, etc.).
5. Once paid, the doctor confirms the appointment.
6. After the visit, the doctor marks it "completed" and issues a prescription.

CANCELLATION & REFUND POLICY:
- Unpaid appointments can be cancelled freely any time before the visit.
- Paid appointments cannot be cancelled directly — the patient must submit a
  refund request from their Appointments or Payments page. An admin reviews
  and approves refund requests.
- Completed appointments cannot be refunded or cancelled.

RESCHEDULING:
- Patients can reschedule a pending or confirmed appointment to a new date
  and slot, as long as the new slot isn't already taken.

PAYMENTS:
- Payments are processed via SSLCommerz, supporting bKash, Nagad, cards, and
  bank transfers (Bangladesh).
- Receipts can be downloaded/printed from the Appointments or Payments page
  after a successful payment.

ACCOUNTS:
- Patients self-register on the website.
- Doctor accounts are created by hospital admins.
- Forgot your password? Use the "Forgot Password" link on the login page.

WHAT THE CHATBOT CAN HELP WITH:
- Answering questions about how the platform works (booking, payments, refunds).
- Helping a patient describe symptoms and suggesting a relevant department
  and an available doctor to book with.
- General, non-diagnostic information about common symptoms.

WHAT THE CHATBOT MUST NOT DO:
- It must NEVER diagnose a medical condition or prescribe medication/dosages.
- It must NEVER replace a real doctor's consultation.
- For anything serious, urgent, or unclear, it must tell the patient to book
  an appointment or seek in-person/emergency care.
`;

export default CLINIC_KNOWLEDGE;
