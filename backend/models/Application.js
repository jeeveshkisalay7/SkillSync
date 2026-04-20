const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeUrl: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'viewed', 'shortlisted', 'rejected'], default: 'pending' },
    matchPercentage: { type: Number, default: 0 },
    missingSkills: [{ type: String }],
    appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', ApplicationSchema);
