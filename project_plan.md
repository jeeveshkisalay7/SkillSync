# Skill Sync: Intelligent Job Portal System

Welcome to the **Skill Sync** implementation guide! This document contains everything you need to build this innovative job portal system, from architecture to viva presentation tips. 

## 1. Folder Structure (MERN Stack)
A clean separation of concerns between frontend and backend.

```text
skill-sync/
├── backend/
│   ├── config/            # Database connection (db.js)
│   ├── controllers/       # Business logic (authController.js, jobController.js, etc.)
│   ├── middlewares/       # JWT Auth and Role verification
│   ├── models/            # Mongoose Schemas (User.js, Job.js, Application.js)
│   ├── routes/            # Express routes
│   ├── utils/             # Helper functions (skillAnalyzer.js)
│   ├── .env               # Environment variables
│   └── server.js          # Entry point for Express
├── frontend/
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── assets/        # Images, icons
│   │   ├── components/    # Reusable UI (Navbar, JobCard, Button)
│   │   ├── context/       # React Context (AuthContext)
│   │   ├── pages/         # Page components (Dashboard, JobListings, SkillAnalyzer)
│   │   ├── services/      # Axios API call logic (api.js)
│   │   ├── App.css        # Global CSS
│   │   └── App.js         # React Router setup
│   └── package.json
└── README.md
```

---

## 2. Database Design (MongoDB Schemas)
We will use three distinct collections to manage users, jobs, and applications.

### 2.1 Users Collection
Stores Job Seekers, Recruiters, and Admins.
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  role: { type: String, enum: ['seeker', 'recruiter', 'admin'] },
  skills: [String], // e.g. ["React", "Node", "MongoDB"]
  createdAt: Date
}
```

### 2.2 Jobs Collection
Stores job postings created by recruiters.
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  companyName: String,
  requiredSkills: [String], // e.g. ["React", "Express", "TypeScript"]
  postedBy: ObjectId, // Ref -> Users
  createdAt: Date
}
```

### 2.3 Applications Collection
Maps seekers to the jobs they applied for. Includes the AI Analyzer metric.
```javascript
{
  _id: ObjectId,
  jobId: ObjectId, // Ref -> Jobs
  applicantId: ObjectId, // Ref -> Users
  resumeUrl: String, 
  status: { type: String, enum: ['pending', 'reviewed', 'shortlisted', 'rejected'], default: 'pending' },
  matchPercentage: Number, // Computed by AI analyzer
  missingSkills: [String], // Missing skills for targeted learning
  appliedAt: Date
}
```

---

## 3. API Endpoints List

### Authentication APIs
*   `POST /api/auth/register` - Register new user (Seeker/Recruiter)
*   `POST /api/auth/login` - Login and return JWT token

### Job APIs
*   `GET /api/jobs` - View all open jobs (with optional search/filter query params)
*   `POST /api/jobs` - Post a new job (Recruiter role only)
*   `GET /api/jobs/:id` - Get specific job details

### Application APIs
*   `POST /api/applications` - Apply for a job (Seeker only)
*   `GET /api/applications/job/:jobId` - View all applications for a specific job (Recruiter only)
*   `PUT /api/applications/:id/status` - Update application status (Recruiter only)

### Skill Analyzer API (Unique Feature)
*   `POST /api/analyze-skills` - Pass job requirements and applicant skills. Returns `matchPercentage` and `learningPath`.

---

## 4. Step-by-Step Implementation Plan

### Phase 1: Backend Foundation (Days 1-2)
1. Initialize the backend project (`npm init -y`) and install dependencies: `express`, `mongoose`, `jsonwebtoken`, `bcrypt`, `cors`, `dotenv`.
2. Setup MongoDB Atlas and connect it in `server.js`.
3. Create Mongoose Models for `User`, `Job`, and `Application`.

### Phase 2: Core APIs & Auth (Days 3-4)
1. Write Auth controllers (hash passwords with bcrypt, generate JWT tokens).
2. Create `authMiddleware.js` to protect routes and verify roles (e.g. `isRecruiter`).
3. Develop CRUD endpoints for Jobs and Applications.


### Phase 3: The AI Skill Gap Analyzer (Day 5)
1. Build a utility function that accepts two arrays: `userSkills` and `jobRequiredSkills`.
2. Calculate the intersection (matched skills) and differences (missing skills).
3. Compute the match percentage `(matched / required) * 100`.
4. Generate a JSON mapping for popular skills to learning resources (e.g., missing "React" -> React roadmap).

### Phase 4: Frontend Development (Days 6-8)
1. Generate React app structure.
2. Build Context API for managing the user's login state globally.
3. Build Pages: Login, Job Listings (with search/filter), and Job Details.
4. Integrate `axios` to make requests to your backend endpoints.

### Phase 5: Dashboards & Polish (Days 9-10)
1. Create Recruiter Dashboard (post jobs, view applications).
2. Create Seeker Dashboard (view applied jobs and their status).
3. Hook up the UI for the Skill Analyzer (show a pie chart or progress bar).

---

## 5. Sample Code Snippets

### The Skill Gap Algorithm (Backend Utility)
Simple but effective keyword matching algorithm to simulate our "AI" analyzer without needing Python or external API subscriptions:

```javascript
// backend/utils/skillAnalyzer.js
const analyzeSkills = (userSkills, requiredSkills) => {
    // Normalize text to lowercase to prevent mismatch
    const userS = userSkills.map(s => s.toLowerCase());
    const reqS = requiredSkills.map(s => s.toLowerCase());

    const matchedSkills = reqS.filter(skill => userS.includes(skill));
    const missingSkills = reqS.filter(skill => !userS.includes(skill));

    const matchPercentage = Math.round((matchedSkills.length / reqS.length) * 100);

    // Simple learning path generator
    const learningPath = missingSkills.map(skill => ({
        skill: skill,
        resource: `Search for ${skill} crash course on YouTube` // Connect to a real database in future
    }));

    return {
        matchPercentage,
        matchedSkills,
        missingSkills,
        learningPath
    };
}
module.exports = { analyzeSkills };
```

### React Token Auth Verification (Frontend Context)
```javascript
// frontend/src/context/AuthContext.js
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token) {
            setUser({ token, role });
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
```

---

## 6. UI Design Suggestions
To make the project look premium (without using Tailwind or Bootstrap):
*   **Colors:** Use a modern dark mode theme. Background: `#0f172a` (Deep Slate), Text: `#f8fafc` (Off-white), Accents: `#4338ca` (Indigo) and `#10b981` (Emerald Green for high match percentages).
*   **Skill Analyzer UI:** Instead of just text, use a circular progress ring (using CSS or a simple SVG) to show the `85% Match`. List missing skills in red pill-shaped tags, and matched skills in green tags.
*   **Glassmorphism:** Use CSS `backdrop-filter: blur(10px)` with semi-transparent backgrounds for the Job Cards to give a very premium look.
*   **Responsive:** Use CSS Grid and Flexbox religiously.

---

## 7. Two Easy Minor Innovative Features

1.  **Application Status Pizza-Tracker Bar:** Similar to food delivery apps, provide a visual tracker for application status (Pending ➔ Reviewed ➔ Shortlisted ➔ Interview). It makes the UI highly dynamic and engaging.
2.  **"One-Click Cover Letter Generator":** Since you already know the User's Skills and the Job's Required Skills, create a button that patches them together to auto-generate a generic cover letter template using a pre-written JavaScript string literal template. (e.g. *"I am applying for [Title]. I have [matchedSkills] although I am currently learning [missingSkills]... "*).

---





**Step 4: Future Scope (1 min)**
Finish by stating you could easily upgrade the "AI Algorithm" to use Python NLP models in the future, demonstrating that you designed the structure to be highly scalable.
