import axios from 'axios';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Doctor from '../models/Doctor.js';
import Department from '../models/Department.js';
import CLINIC_KNOWLEDGE from '../utils/clinicKnowledge.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Fast + good enough for tool-calling and chat. Change if you prefer another Groq model.
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// ── System prompt: knowledge + hard safety rules ────────────────────────────
const SYSTEM_PROMPT = `You are ShifaCare Assistant — the AI assistant embedded in the ShifaCare
hospital booking website. You work like a normal helpful AI assistant
(similar to ChatGPT/Gemini): you can chat naturally about anything the user
brings up, answer general questions, have small talk, explain things clearly,
and be genuinely useful in conversation — you are not restricted to only
hospital topics.

On top of being a normal helpful assistant, you have one special job: when
the conversation is about ShifaCare itself (booking, payments, doctors,
departments, policies) or about the user's symptoms, you must be 100%
accurate by using the tools below instead of guessing.

${CLINIC_KNOWLEDGE}

GENERAL BEHAVIOR:
- Talk naturally and helpfully about any topic the user raises, the same way
  any competent AI assistant would. Don't refuse or deflect normal questions
  just because they aren't about the hospital.
- Keep replies concise and easy to read in a chat bubble (short paragraphs,
  no walls of text). Use BDT (৳) for any fees.
- If the user is just chatting (greetings, jokes, general knowledge,
  unrelated questions), respond like a normal AI assistant would.

DATA-GROUNDING RULES (apply only to ShifaCare-specific facts):
1. You have ZERO built-in knowledge of this hospital's actual doctors,
   departments, fees, or schedules. Any time you are about to state a real
   doctor's name, a department list, a fee, or availability, you MUST call
   find_departments or find_doctors first and base your answer only on what
   the tool returns. Never invent a name, fee, or availability — if a tool
   returns nothing relevant, say so honestly and suggest browsing the
   Doctors/Departments page on the site instead.
2. For questions about how the platform works (booking, payment, refund,
   reschedule, account, policies), answer from the clinic info above. If you
   don't know something specific, say so honestly rather than guessing.

SYMPTOM / HEALTH CONVERSATIONS:
3. You are NOT a doctor. NEVER diagnose a condition, NEVER confirm a disease
   name, NEVER suggest medication names or dosages.
4. When a user describes symptoms, ask at most 2-3 short follow-up questions
   (duration, severity, related symptoms), then suggest a relevant
   department and, using find_doctors, a real currently-available doctor —
   always framing it as "for a proper check-up", not a diagnosis.
5. If the user describes anything that could be a medical emergency (severe
   chest pain, difficulty breathing, heavy bleeding, stroke signs, loss of
   consciousness, suicidal thoughts, severe allergic reaction), immediately
   tell them to call local emergency services or go to the nearest ER right
   now — skip the usual follow-up questions.`;

// ── Tools the model can call ────────────────────────────────────────────────
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'find_departments',
      description: 'List all hospital departments, optionally filtered by a search keyword (e.g. "skin", "heart", "child").',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: 'Optional keyword to filter department name/description.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_doctors',
      description: 'Find currently available doctors, optionally filtered by department name or specialization keyword. Returns name, specialization, degree, experience, fee, and department.',
      parameters: {
        type: 'object',
        properties: {
          departmentName: { type: 'string', description: 'Department name to filter by, e.g. "Cardiology".' },
          keyword: { type: 'string', description: 'Keyword to match against specialization, e.g. "skin", "child", "bone".' },
          limit: { type: 'number', description: 'Max results, default 5.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_doctor_details',
      description: 'Get full details (bio/about, rating, schedule) for one specific doctor by their id, as returned by find_doctors.',
      parameters: {
        type: 'object',
        properties: {
          doctorId: { type: 'string', description: 'The doctor id (the "id" field returned by find_doctors).' },
        },
        required: ['doctorId'],
      },
    },
  },
];

async function runTool(name, args) {
  if (name === 'find_departments') {
    const filter = args.keyword
      ? { $or: [
          { name: { $regex: args.keyword, $options: 'i' } },
          { description: { $regex: args.keyword, $options: 'i' } },
        ] }
      : {};
    const departments = await Department.find(filter).select('name description').limit(15);
    return departments.map((d) => ({ name: d.name, description: d.description }));
  }

  if (name === 'find_doctors') {
    const filter = { isAvailable: true };
    let deptIds = null;

    if (args.departmentName) {
      const depts = await Department.find({ name: { $regex: args.departmentName, $options: 'i' } }).select('_id');
      deptIds = depts.map((d) => d._id);
      filter.department = { $in: deptIds };
    }
    if (args.keyword) {
      filter.specialization = { $regex: args.keyword, $options: 'i' };
    }

    const doctors = await Doctor.find(filter)
      .populate('user', 'name')
      .populate('department', 'name')
      .limit(args.limit || 5);

    return doctors.map((doc) => ({
      id: doc._id,
      name: doc.user?.name,
      specialization: doc.specialization,
      degree: doc.degree,
      experience: doc.experience,
      fee: doc.fees,
      department: doc.department?.name,
      rating: doc.rating,
    }));
  }

  if (name === 'get_doctor_details') {
    if (!args.doctorId) return { error: 'doctorId is required' };
    const doc = await Doctor.findById(args.doctorId)
      .populate('user', 'name')
      .populate('department', 'name');
    if (!doc) return { error: 'Doctor not found' };
    return {
      id: doc._id,
      name: doc.user?.name,
      specialization: doc.specialization,
      degree: doc.degree,
      experience: doc.experience,
      fee: doc.fees,
      about: doc.about,
      department: doc.department?.name,
      rating: doc.rating,
      totalReviews: doc.totalReviews,
      isAvailable: doc.isAvailable,
      schedule: doc.schedule,
    };
  }

  return { error: 'Unknown tool' };
}

async function getLiveContextSnapshot() {
  // Always pull a small live snapshot of departments + available doctors and
  // hand it to the model as ground truth in the system prompt. This means the
  // bot has real data even if it never decides to call a tool — tools remain
  // available for deeper/filtered lookups, but the common case (just answer
  // with what doctors/departments exist) works 100% of the time, with no
  // dependency on the model "remembering" to call a function.
  try {
    const departments = await Department.find().select('name description').limit(20);
    const doctors = await Doctor.find({ isAvailable: true })
      .populate('user', 'name')
      .populate('department', 'name')
      .limit(30);

    if (departments.length === 0 && doctors.length === 0) {
      return 'LIVE DATA: No departments or doctors are currently set up in the system. If asked, tell the user no doctors are listed yet and to check back later or contact the hospital directly — do not invent any.';
    }

    const deptList = departments.map((d) => `- ${d.name}${d.description ? ': ' + d.description : ''}`).join('\n') || '(none)';
    const docList = doctors.map((d) =>
      `- ${d.user?.name || 'Unknown'} | ${d.specialization} | ${d.department?.name || 'N/A'} | ${d.degree}, ${d.experience} yrs exp | ৳${d.fees}`
    ).join('\n') || '(no available doctors right now)';

    return `LIVE DATA (real, current — use this, never invent beyond it):

Departments:
${deptList}

Currently available doctors:
${docList}

If the user asks about a doctor/department not listed above, say it's not currently available rather than inventing one. Use the find_doctors / get_doctor_details tools only if you need more detail (full bio, schedule) than shown here.`;
  } catch (err) {
    console.error('Live context snapshot failed:', err.message);
    return 'LIVE DATA: Could not be loaded right now due to a server/database issue. If asked about doctors or departments, tell the user honestly that you cannot fetch live data at the moment and suggest browsing the site directly — do not invent any names.';
  }
}

// @desc    Chat with the AI assistant (medical FAQ + symptom check + doctor suggestion)
// @route   POST /api/v1/chatbot/message
// @access  Public
export const chatbotMessage = asyncHandler(async (req, res, next) => {
  if (!process.env.GROQ_API_KEY) {
    return next(new ErrorResponse('Chatbot is not configured. Missing GROQ_API_KEY on the server.', 503));
  }

  const { message, history } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return next(new ErrorResponse('Please provide a message', 400));
  }

  // history: [{ role: 'user'|'assistant', content: '...' }, ...] from the client,
  // capped here so the request can't grow unbounded.
  const safeHistory = Array.isArray(history) ? history.slice(-12) : [];
  const liveContext = await getLiveContextSnapshot();

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + '\n\n' + liveContext },
    ...safeHistory.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'),
    { role: 'user', content: message.trim().slice(0, 2000) },
  ];

  try {
    // First call — model may decide to call a tool
    let response = await axios.post(
      GROQ_URL,
      { model: GROQ_MODEL, messages, tools: TOOLS, tool_choice: 'auto', temperature: 0.5 },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
    );

    let choice = response.data.choices[0];
    let toolWasCalled = false;

    // Allow up to 3 rounds of tool calls before forcing a final text answer
    let rounds = 0;
    while (choice.finish_reason === 'tool_calls' && rounds < 3) {
      rounds += 1;
      toolWasCalled = true;
      const toolCalls = choice.message.tool_calls || [];
      messages.push(choice.message);

      for (const call of toolCalls) {
        let args = {};
        try { args = JSON.parse(call.function.arguments || '{}'); } catch { /* ignore */ }
        const result = await runTool(call.function.name, args);
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }

      response = await axios.post(
        GROQ_URL,
        { model: GROQ_MODEL, messages, tools: TOOLS, tool_choice: 'auto', temperature: 0.5 },
        { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
      );
      choice = response.data.choices[0];
    }

    let reply = choice.message?.content || "Sorry, I couldn't process that. Could you rephrase?";

    // Safety net: if the reply mentions a doctor-like name ("Dr. X") but no tool
    // was actually called this turn, the model likely hallucinated. Re-ask it
    // once, forcing the find_doctors tool specifically (forcing a SPECIFIC
    // function, not the generic 'required', avoids Groq returning a 400 if the
    // model would otherwise refuse to call any tool at all).
    const mentionsDoctorName = /\bDr\.?\s+[A-Z][a-zA-Z]+/.test(reply);
    if (mentionsDoctorName && !toolWasCalled) {
      messages.push({ role: 'assistant', content: reply });
      messages.push({
        role: 'user',
        content: 'Before naming any doctor, you must call the find_doctors tool to get real data. Please redo your last answer using the tool.',
      });
      try {
        const retryResponse = await axios.post(
          GROQ_URL,
          {
            model: GROQ_MODEL,
            messages,
            tools: TOOLS,
            tool_choice: { type: 'function', function: { name: 'find_doctors' } },
            temperature: 0.3,
          },
          { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
        );
        let retryChoice = retryResponse.data.choices[0];
        let retryRounds = 0;
        while (retryChoice.finish_reason === 'tool_calls' && retryRounds < 2) {
          retryRounds += 1;
          const toolCalls = retryChoice.message.tool_calls || [];
          messages.push(retryChoice.message);
          for (const call of toolCalls) {
            let args = {};
            try { args = JSON.parse(call.function.arguments || '{}'); } catch { /* ignore */ }
            const result = await runTool(call.function.name, args);
            messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
          }
          const followUp = await axios.post(
            GROQ_URL,
            { model: GROQ_MODEL, messages, tools: TOOLS, tool_choice: 'auto', temperature: 0.5 },
            { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
          );
          retryChoice = followUp.data.choices[0];
        }
        reply = retryChoice.message?.content || reply;
      } catch (retryErr) {
        // If even the forced retry fails, fall back to a safe, honest message
        // instead of showing the possibly-hallucinated original reply.
        console.error('Chatbot retry error:', retryErr.response?.data || retryErr.message);
        reply = "I'd rather double check that against our real doctor list before naming anyone. Please check the Doctors page on the site, or tell me the department you need and I'll look it up.";
      }
    }

    return res.status(200).json({ success: true, reply });
  } catch (err) {
    console.error('Chatbot error:', err.response?.data || err.message);
    return next(new ErrorResponse('Chatbot is temporarily unavailable. Please try again.', 502));
  }
});
