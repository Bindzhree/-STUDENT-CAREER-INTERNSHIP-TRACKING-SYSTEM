# Student Career & Internship Tracking System

Full-stack web app — pure HTML/CSS/JS frontend + Node.js/Express backend + MySQL.

## Project Structure
```
career-tracker/
├── backend/
│   ├── db/
│   │   ├── db.js           # MySQL connection pool
│   │   └── schema.sql      # All CREATE TABLE statements
│   ├── middleware/
│   │   └── auth.js         # JWT verification
│   ├── routes/
│   │   ├── auth.js         # Register + Login
│   │   ├── profile.js      # Get/Update profile
│   │   ├── skills.js       # CRUD + bulk import
│   │   ├── certifications.js
│   │   ├── applications.js
│   │   ├── interviews.js
│   │   ├── dashboard.js    # All analytics SQL queries
│   │   └── resume.js       # PDF parser
│   ├── .env.example
│   ├── package.json
│   └── server.js           # Express app (also serves frontend)
│
└── frontend/
    ├── index.html          # Entire UI — login, register, all pages
    ├── css/
    │   └── style.css       # Full design system
    └── js/
        ├── api.js          # Fetch wrapper with JWT
        ├── utils.js        # Router, modal, toast, helpers
        ├── auth.js         # Login, register, onboarding, PDF upload
        ├── dashboard.js    # Charts + stats
        ├── applications.js # Applications CRUD
        ├── interviews.js   # Interview rounds CRUD
        ├── skills.js       # Skills CRUD
        └── certifications.js
```

---

## Setup — Step by Step

### Step 1 — Create the database
Open MySQL and run:
```bash
mysql -u root -p < backend/db/schema.sql
```

### Step 2 — Configure backend
```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=career_tracker
JWT_SECRET=any_long_random_string
PORT=5000
```

### Step 3 — Install and run backend
```bash
cd backend
npm install
npm run dev      # uses nodemon — auto-restarts on changes
# or
npm start        # plain node
```

Backend runs at: **http://localhost:5000**
Frontend is served from the same port — open **http://localhost:5000** in browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register student |
| POST | /api/auth/login | Login |
| GET  | /api/profile | Get own profile |
| PUT  | /api/profile | Update profile |
| GET  | /api/skills | List skills |
| POST | /api/skills | Add skill |
| POST | /api/skills/bulk | Bulk import skills |
| DELETE | /api/skills/:id | Delete skill |
| GET  | /api/certifications | List certifications |
| POST | /api/certifications | Add certification |
| POST | /api/certifications/bulk | Bulk import |
| DELETE | /api/certifications/:id | Delete |
| GET  | /api/applications | List applications |
| POST | /api/applications | Add application |
| PATCH | /api/applications/:id/status | Update status |
| DELETE | /api/applications/:id | Delete |
| GET  | /api/interviews | List interview rounds |
| POST | /api/interviews | Add round |
| DELETE | /api/interviews/:id | Delete round |
| GET  | /api/dashboard | All analytics in one call |
| POST | /api/resume/parse | Parse PDF resume |

---

## Key SQL Queries (dashboard.js)

1. **Application counts by status** — `GROUP BY status`
2. **Success rate** — `SUM(CASE WHEN status='Selected'...) / COUNT(*)`
3. **Monthly activity** — `DATE_FORMAT + GROUP BY month`
4. **Interview outcomes** — JOIN interview_rounds → applications
5. **Skill list** — ordered by proficiency

---

## How It Works

1. Student registers → lands on **Onboarding**
2. Uploads resume PDF → backend parses it with `pdf-parse`
3. Extracted skills/certs shown for review → student confirms → saved via bulk insert
4. From dashboard, student tracks applications, interview rounds, skills, certifications
5. Dashboard shows Chart.js bar + doughnut charts powered by SQL aggregates
