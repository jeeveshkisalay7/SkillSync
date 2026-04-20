const Application = require('../models/Application');
const Job = require('../models/Job');
const { analyzeSkills } = require('../utils/skillAnalyzer');

const applyForJob = async (req, res) => {
    try {
        const { jobId, resumeUrl } = req.body;
        
        // Find the job and user skills
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Check if already applied
        const existingApp = await Application.findOne({ jobId, applicantId: req.user.id });
        if (existingApp) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }

        const userSkills = req.user.skills || [];
        const requiredSkills = job.requiredSkills || [];

        // Analyze skills
        const analysis = analyzeSkills(userSkills, requiredSkills);

        const application = await Application.create({
            jobId,
            applicantId: req.user.id,
            resumeUrl,
            matchPercentage: analysis.matchPercentage,
            missingSkills: analysis.missingSkills.map(s => s.toLowerCase()),
            status: 'pending'
        });

        res.status(201).json({
            application,
            analysis
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getApplicationsForJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        
        // Verify job belongs to the recruiter
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You did not post this job' });
        }

        const apps = await Application.find({ jobId }).populate('applicantId', 'name email skills');
        res.status(200).json(apps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyApplications = async (req, res) => {
    try {
        const apps = await Application.find({ applicantId: req.user.id })
                                      .populate('jobId', 'title companyName');
        res.status(200).json(apps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const app = await Application.findById(req.params.id);
        
        if (!app) return res.status(404).json({ error: 'Application not found' });

        const job = await Job.findById(app.jobId);
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        app.status = status;
        await app.save();

        res.status(200).json(app);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Expose analysis directly for skill gap page
const analyzeSkillGap = async (req, res) => {
    try {
        const { requiredSkills } = req.body;
        const userSkills = req.user.skills || [];
        const analysis = analyzeSkills(userSkills, requiredSkills || []);
        res.status(200).json(analysis);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { applyForJob, getApplicationsForJob, getMyApplications, updateApplicationStatus, analyzeSkillGap };
