# NLS — Not Lazy Samad 🔥

**AMOLED dark PWA habit tracker** — Deen · Growth · Health · Output

---

## 🗂 File Structure

```
nls-app/
├── public/
│   └── icons/              ← PWA icons (192px, 512px)
├── src/
│   ├── components/
│   │   ├── Header.jsx       ← Score + progress bar
│   │   ├── HabitCard.jsx    ← Tappable habit row
│   │   ├── DSAModal.jsx     ← DSA topic input
│   │   ├── ShutdownModal.jsx ← Daily review
│   │   ├── PreCommitModal.jsx ← Morning selection lock
│   │   ├── Analytics.jsx    ← Improvement tab
│   │   └── BottomNav.jsx    ← Tab bar
│   ├── features/habits/
│   │   ├── habitConfig.js   ← All habits + categories
│   │   └── scoring.js       ← Score + streak logic
│   ├── hooks/
│   │   └── useHabits.js     ← All state management
│   ├── store/
│   │   └── db.js            ← IndexedDB (idb library)
│   ├── styles/
│   │   └── global.css       ← Full design system
│   ├── App.jsx              ← Root layout
│   └── main.jsx             ← Entry point
├── index.html
├── vite.config.js           ← Vite + PWA plugin
├── vercel.json              ← Vercel config
└── package.json
```

---

## ⚙️ Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# Open http://localhost:5173
```

---

## 🚀 Vercel Deployment (Step by Step)

### Option A — Vercel CLI (fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Framework: Vite
# - Build command: npm run build
# - Output: dist

# Production deploy
vercel --prod
```

### Option B — GitHub + Vercel Dashboard

1. Push this folder to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "NLS v1.0"
   git remote add origin https://github.com/YOUR_USERNAME/nls-app.git
   git push -u origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Settings auto-detected (Vite) — click **Deploy**
5. Your app is live at `https://nls-app.vercel.app`

---

## 📱 iPhone 12 — Add to Home Screen

1. Open your Vercel URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share** button (square with arrow, bottom center)
3. Scroll down → tap **"Add to Home Screen"**
4. Name it: **NLS**
5. Tap **Add** (top right)

**Result:** App icon on your home screen, opens fullscreen with no browser UI — pure PWA experience.

---

## 🧠 How the System Works

### Daily Flow
1. **Morning** → PreCommit modal appears: select Health activity + Output goal
2. **Throughout day** → Tap habits to complete them (one tap)
3. **11 PM** → Auto shutdown modal: score, missed habits, tomorrow's priorities

### Scoring (100 pts total)
| Category | Weight | Logic |
|----------|--------|-------|
| Deen | 40pts | 8 habits, proportional |
| Growth | 25pts | 2 habits, proportional |
| Health | 15pts | Activity 7.5 + ABC Juice 7.5 |
| Output | 20pts | All-or-nothing (selected goal) |

### Critical Habit Penalty
- Miss 1 critical (Fajr / Isha / Output) → **Max score: 60**
- Miss 2 → **Max score: 40**
- Miss all 3 → **Max score: 20**

### Anti-Skip System
- Miss same habit 2 days → ⚠️ warning highlight
- Miss 3+ days → 🔴 pulse animation + moved to top

### Friday Auto-Switch
- Zohar → Jumma (both label + Urdu) every Friday

### DSA Modal
- Mark DSA complete → modal pops: "Aaj ka DSA topic?"
- Topics stored with date, visible in Analytics tab

### Data Storage
- **IndexedDB** (offline, no server needed)
- 50-day log retention (auto-purge)
- Persists across app restarts
- Fully offline via Service Worker

---

## 🛠 Customization

### Add a habit
Edit `src/features/habits/habitConfig.js`:
```js
{ id: 'new_habit', label: 'New Habit', urdu: 'نیا', critical: false }
```

### Change weights
Edit `src/features/habits/scoring.js` — change the multipliers in `calculateScore()`

### Change theme colors
Edit `src/styles/global.css` — all colors are CSS variables in `:root`
