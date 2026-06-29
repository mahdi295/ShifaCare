# How To Test Right Now — Step By Step

Follow this exactly, in order. At each step, copy what you see (especially
terminal text) and send it to me if something looks wrong — don't summarize
it in your own words, paste the real text/error.

## 0. Replace your files
1. Extract the new `backend.zip` and `frontend.zip` over your project
   (keep your own `backend/.env` and `frontend/.env` — the zips don't
   include them).
2. In `backend/`, run:
   ```
   npm install
   ```
   (new packages weren't added, but this is safe to confirm nothing's missing)
3. In `frontend/`, run:
   ```
   npm install
   ```
   (i18next + react-i18next were added for the language switcher)

## 1. Start backend, check it boots clean
```
cd backend
npm run dev
```
✅ Expected: `Server running in development mode on port 5000` and
`MongoDB Connected` (or similar). No red error text.
❌ If you see red errors here — stop, copy the full error text, send it to me.

## 2. Start frontend, check it boots clean
```
cd frontend
npm run dev
```
✅ Expected: `VITE ... ready` and a `Local: http://localhost:5173/` link.
Open that link — site should load normally.

## 3. Test the production build (this was actually broken before — now fixed)
```
cd frontend
npm run build
```
✅ Expected: ends with `✓ built in X.XXs`, no red error.
This matters for your viva if you ever show/deploy the live version.

## 4. Test the chatbot
1. Make sure `GROQ_API_KEY` is set in `backend/.env`.
2. On the site, click the chat bubble (bottom-right).
3. Ask: **"Which doctors are available?"**
   - ✅ Should list real doctor names from your database.
   - ❌ If it says "no doctors found" — go to Admin Dashboard → Doctors and
     confirm at least one doctor exists and is marked "Available". If none
     exist, run `npm run seed` in `backend/` once to add demo data, then
     test again.
4. Ask: **"I have stomach pain after eating junk food"** and answer its
   follow-up questions.
   - ✅ Should ask 2-3 short questions, then suggest Gastroenterology + a
     real doctor name from your DB (not "Dr. Smith" or similar generic name).

## 5. Test payment — do this carefully, watch the terminal
1. Start ngrok: `ngrok http 5000`
2. **Copy the exact URL ngrok shows** (it changes every restart on the free
   plan) and paste it into `backend/.env` as `BACKEND_URL=...`
3. **Restart the backend** (`Ctrl+C` then `npm run dev` again) — it must
   reload the new `.env` value.
4. Book an appointment, click Pay Now.
5. **Keep your eyes on the backend terminal** the whole time.
6. On the SSLCommerz page, choose bKash, enter the test number, PIN, OTP.
7. Watch what happens:
   - ✅ If it redirects back to your dashboard and shows "payment success" —
     it worked. Check the terminal — you should see a line like
     `[Payment Success] PS-... completed.`
   - ❌ If SSLCommerz shows its own "please contact support" page — **this
     is happening before it ever reaches your backend.** Check your backend
     terminal at that exact moment:
     - If the terminal shows **nothing at all** → the request never reached
       your server. Double check the ngrok URL in `.env` matches the ngrok
       terminal exactly, with no typo, and that you restarted the backend
       after changing it.
     - If the terminal **does show a line** (anything starting with
       `SSLCommerz validation error` or similar) → copy that exact line and
       send it to me, that tells us precisely what failed.

## 6. Test the language switcher (new feature)
1. On the Navbar, click the **EN / বাং** button (top right, next to Sign In).
2. ✅ Nav links (Home, Doctors, Departments, About, Contact, Dashboard,
   Sign In, Get Started) should switch language instantly.
3. Note: only the Navbar is translated right now — the rest of the site is
   still English. That's expected, not a bug — it can be expanded later if
   you want full-site translation.

---

If anything fails, send me:
1. Which step number failed.
2. The exact text from the terminal (copy-paste, not a description).
3. A screenshot of what the browser showed, if relevant.

That lets me fix the exact real problem instead of guessing again.
