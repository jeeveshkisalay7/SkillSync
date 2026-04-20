const Job = require('../models/Job');
const axios = require('axios');

const getJobs = async (req, res) => {
    try {
        // Find all jobs or apply filters passed as query
        const jobs = await Job.find().populate('postedBy', 'name email');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createJob = async (req, res) => {
    try {
        const { title, description, companyName, requiredSkills } = req.body;

        if (!title || !description || !companyName) {
            return res.status(400).json({ error: 'Please add all required fields' });
        }

        const job = await Job.create({
            title,
            description,
            companyName,
            requiredSkills: requiredSkills || [],
            postedBy: req.user.id
        });

        await job.populate('postedBy', 'name email');
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        // Ensure user is the creator or the admin
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to update this job' });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('postedBy', 'name email');
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this job' });
        }

        await job.deleteOne();
        res.status(200).json({ message: 'Job removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getExternalJobs = async (req, res) => {
    try {
        const search = req.query.search || '';

        // 1. Local Search (Regex)
        const localJobs = await Job.find({
            $or: [
                { title: new RegExp(search, 'i') },
                { companyName: new RegExp(search, 'i') },
                { requiredSkills: { $elemMatch: { $regex: search, $options: 'i' } } }
            ]
        }).populate('postedBy', 'name email');

        let externalJobs = [];

        // 2. External API Call
        if (search && process.env.RAPIDAPI_KEY) {
            try {
                const apiRes = await axios.get('https://jsearch.p.rapidapi.com/search', {
                    params: { query: search, page: '1', num_pages: '1' },
                    headers: {
                        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                    }
                });

                const apiResults = apiRes.data.data || [];

                // 3. Save unique external jobs to DB
                for (const item of apiResults) {
                    const title = item.job_title;
                    const companyName = item.employer_name;
                    const description = item.job_description;

                    if (!title || !companyName) continue;

                    // Avoid duplicate
                    const exists = await Job.findOne({ title, companyName });
                    if (!exists) {
                        const newJob = await Job.create({
                            title,
                            companyName,
                            description,
                            requiredSkills: item.job_required_skills ? item.job_required_skills.split(',') : [search],
                            isExternal: true
                        });
                        externalJobs.push(newJob);
                    }
                }
            } catch (err) {
                console.log('Error fetching from JSearch API:', err.message);
                // Gracefully continue to return localJobs if API fails
            }
        }

        // Combine unique jobs 
        // We re-query to quickly get the updated list, but just merging is faster:
        res.status(200).json([...localJobs, ...externalJobs]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, getExternalJobs };
