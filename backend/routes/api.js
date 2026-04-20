const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { getJobs, getJobById, createJob, updateJob, deleteJob, getExternalJobs } = require('../controllers/jobController');
const { applyForJob, getApplicationsForJob, getMyApplications, updateApplicationStatus, analyzeSkillGap } = require('../controllers/appController');
const { getAllUsers, deleteUser, deleteJob: adminDeleteJob } = require('../controllers/adminController');
const { protect, isRecruiter, isAdmin } = require('../middlewares/authMiddleware');

// Auth routes
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/auth/me', protect, getMe);

// Admin routes
router.get('/admin/users', protect, isAdmin, getAllUsers);
router.delete('/admin/users/:id', protect, isAdmin, deleteUser);
router.delete('/admin/jobs/:id', protect, isAdmin, adminDeleteJob);

// Job routes
router.get('/jobs', getJobs);
router.get('/external-jobs', getExternalJobs);
router.get('/jobs/:id', getJobById);
router.post('/jobs', protect, isRecruiter, createJob);
router.put('/jobs/:id', protect, isRecruiter, updateJob); // updated or recruiter can also be checked
router.delete('/jobs/:id', protect, isRecruiter, deleteJob);

// Application routes
router.post('/applications', protect, applyForJob); // Seeker applies
router.get('/applications/my', protect, getMyApplications); // Seeker lists their apps
router.get('/applications/job/:jobId', protect, isRecruiter, getApplicationsForJob); // Recruiter lists apps
router.put('/applications/:id/status', protect, isRecruiter, updateApplicationStatus); // Recruiter updates state

// Skill Analyzer separate route
router.post('/analyze-skills', protect, analyzeSkillGap);

module.exports = router;
