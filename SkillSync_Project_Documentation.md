# Skill Sync: Intelligent Job Portal System
**Comprehensive Project Documentation**

---

## 1. Abstract & Objective
**Skill Sync** is a modern, responsive, full-stack Job Portal System built using the MERN stack. It goes beyond traditional job boards by offering an **Intelligent Skill Gap Analyzer**. The platform is designed to provide an intuitive workflow for different types of users, automatically matching candidates to jobs based on their real skill sets.

-

## 2. Fulfillment of Compulsory Requirements
This project strictly adheres to the requirements outlined by the course instructor. Here is a detailed breakdown of how each compulsory component has been implemented:

### 1. Minimum 3 Modules Apart from Login
Beyond the comprehensive Authentication (Login/Register) module, the system is divided into three major functional modules based on user roles:
*   **Job Seeker Module**: Allows users to browse available jobs, view details, run a skill-gap analysis to see how well they match a job's requirements, and submit job applications. They can also track the status of their past applications.
*   **Recruiter Module**: Allows employers to publish new job postings, manage their active jobs, and view the list of candidates who have applied. Recruiters can see the AI match percentage for each candidate and update application statuses (e.g., Shortlist, Reject).
*   **Administrator Module**: A global oversight module allowing admins to monitor the entire platform, view all users, manage all job postings, and ensure platform integrity by removing malicious or spam accounts.

### 2. Use of Hooks for State and CSS
*   **React Hooks**: Advanced React hooks are used extensively throughout the client-side code. `useState` is used for managing component-level data (like form inputs and toggle switches). `useEffect` is utilized for side-effects like fetching data from the backend when a component loads. `useContext` is used along with the Context API to manage global state, such as keeping track of the currently logged-in user across all pages. `useNavigate` is used for programmatic routing.
*   **CSS**: The application relies on vanilla CSS for styling, ensuring a custom, responsive, and aesthetically pleasing User Interface (UI) without over-reliance on heavy CSS frameworks. We have implemented modern design principles like flexbox, grid, and CSS variables for consistent theming.

### 3. Use of React on Client
*   The entire frontend is built as a **Single Page Application (SPA)** using **React.js**. This provides a seamless, app-like experience for the user. Instead of reloading the page every time the user clicks a link, React dynamically updates the DOM using `react-router-dom`, resulting in extremely fast navigation and a highly interactive user interface.

### 4. Use of Node.js on Server
*   The backend is powered by **Node.js** running the **Express.js** framework. It acts as the central brain of the application, handling incoming requests from the React frontend, processing business logic (such as the skill gap calculation), validating user data, securing routes with JWT (JSON Web Tokens), and communicating with the database.

### 5. Use of MongoDB Connectivity with at least 3 Tables (Collections)
We utilize **MongoDB**, a NoSQL database, to store structured JSON-like documents. Connectivity is handled via **Mongoose**. The database strictly maintains three distinct collections (equivalent to tables in SQL):
*   **Users Collection**: Stores user information (name, email, secure hashed passwords) and role definitions (seeker, recruiter, admin). It also stores the array of skills a seeker possesses.
*   **Jobs Collection**: Stores the complete details of every job posting, including title, description, company name, required skills, and a reference ID to the recruiter who posted it.
*   **Applications Collection**: Acts as a bridge, tracking which user applied to which job. It stores the application status (pending, shortlisted), the calculated match percentage, and the date applied.

### 6. Use Only REST API
*   The communication between the React frontend and the Node.js backend is done **exclusively through RESTful APIs**. Endpoints are strictly standardized using HTTP methods: `GET` (fetch data, like viewing jobs), `POST` (send new data, like registering or posting a job), `PUT` (update data, like changing application status), and `DELETE` (remove data). Data is exchanged strictly in standard JSON format.

---

## 3. Detailed Project Workflow & Features

### A. General Workflow
1.  **Onboarding**: A user visits the platform and signs up. During registration, they must define their role: Seeker, Recruiter, or Admin. Seekers are prompted to enter their current skill set (e.g., HTML, CSS, React, Node).
2.  **Authentication**: The user logs in. The backend verifies credentials and issues a secure JWT token. The React frontend stores this token and grants access to protected routes.
3.  **Dashboard Redirection**: Based on the user's role encoded in the token, the frontend dynamically loads the appropriate dashboard.

### B. Every Feature Explained

#### Role 1: The Job Seeker Features
*   **Browse Jobs**: Seekers see a dynamic grid of all active job postings.
*   **Intelligent AI Skill Analyzer**: Before applying, a seeker can click "Analyze Match". The system compares the seeker's profile skills with the job's required skills. It visually displays a percentage (e.g., "85% Match") and lists exactly which skills the seeker is missing, helping them understand what they need to learn.
*   **Apply for Jobs**: Seekers can submit their profile to jobs. The system records the application and the initial match percentage.
*   **Application Tracking**: Seekers have a dedicated panel to see all jobs they applied for and their current status (Pending, Viewed, Shortlisted, Rejected).

#### Role 2: The Recruiter Features
*   **Job Management**: Recruiters can create, edit, and delete their own job postings. When publishing a job, they specify the required skills as well as standard details.
*   **Applicant Tracking System (ATS)**: Recruiters can click on any of their active jobs to view a list of all applicants.
*   **Smart Shortlisting**: In the applicant list, recruiters don't just see names; they see the AI-calculated Match Percentage for every candidate. This allows them to instantly sort and focus on the most qualified applicants. They can update the status of any application to "Shortlisted" or "Rejected".

#### Role 3: The Administrator Features
*   **Global Moderation**: The admin has access to complete platform analytics.
*   **User Management**: Admins can view a table of all registered users (Recruiters and Seekers). If a user violates terms, the admin can delete their account.
*   **Job Oversight**: Admins can view all job postings across all companies and have the power to remove inappropriate listings.

#### Shared Features
*   **Secure Authentication**: Passwords are encrypted using Bcrypt. Session state is securely managed.
*   **Responsive State**: The application is built to function perfectly on Desktop, Tablet, and Mobile views.

---

## 4. Under the Hood: Technical Architecture Snapshot
*   **Frontend**: React (Functional Components, Hooks, Context API) + CSS
*   **Backend**: Node.js + Express.js + JSON Web Tokens (JWT)
*   **Database**: MongoDB + Mongoose ODM
*   **Core Logic**: The SkillGap Algorithm (Performs mathematical set intersection/differences arrays between User Skills and Job Required Skills).
