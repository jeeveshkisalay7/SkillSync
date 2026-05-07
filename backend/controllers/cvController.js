const pdfParse = require('pdf-parse');
const User = require('../models/User');

const extractCV = async (req, res) => {
    console.log("extractCV hit! req.file:", req.file? "exists" : "missing", "req.body:", req.body);
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const dataBuffer = req.file.buffer;
        const data = await pdfParse(dataBuffer);
        const text = data.text;

        // Simple skill extraction mock based on the text
        // In a real scenario, you'd use NLP or a better regex, or call an LLM.
        const extractedSkills = [];
        const commonSkills = ['javascript', 'react', 'node', 'express', 'python', 'java', 'html', 'css', 'sql', 'mongodb', 'docker', 'kubernetes', 'aws'];
        
        const lowerText = text.toLowerCase();
        
        for (let skill of commonSkills) {
            if (lowerText.includes(skill)) {
                extractedSkills.push(skill);
            }
        }

        res.status(200).json({
            extractedData: {
                skills: extractedSkills,
                rawText: text.substring(0, 500) // just a sample
            },
            filename: req.file.originalname
        });

    } catch (error) {
        console.error("CV Extraction error:", error);
        res.status(500).json({ error: 'Failed to extract CV.' });
    }
};

const saveCVProfile = async (req, res) => {
    try {
        const { skills } = req.body;
        
        if (!skills) {
            return res.status(400).json({ error: 'No skills provided' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Merge or replace skills
        const uniqueSkills = [...new Set([...(user.skills || []), ...skills])];
        user.skills = uniqueSkills;

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error("Save CV error:", error);
        res.status(500).json({ error: 'Failed to save profile.' });
    }
}

module.exports = {
    extractCV,
    saveCVProfile
};