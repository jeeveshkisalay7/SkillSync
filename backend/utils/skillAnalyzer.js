const analyzeSkills = (userSkills, requiredSkills) => {
    if (!requiredSkills || requiredSkills.length === 0) {
        return { matchPercentage: 100, matchedSkills: [], missingSkills: [], bonusSkills: [], learningPath: [] };
    }

    const userS = userSkills.map(s => s.toLowerCase().trim());
    const reqS = requiredSkills.map(s => s.toLowerCase().trim());

    const matchedSkills = requiredSkills.filter(skill => userS.includes(skill.toLowerCase().trim()));
    const missingSkills = requiredSkills.filter(skill => !userS.includes(skill.toLowerCase().trim()));

    const matchPercentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);

    const bonusSkills = userS.filter(skill => !reqS.includes(skill));

    const learningPath = missingSkills.map(skill => ({
        skill: skill,
        whyItMatters: `Crucial for this role. Many companies prioritize candidates with strong ${skill} fundamentals.`,
        cvTip: `Implemented X using ${skill} to achieve Y result.`,
        links: [
            { title: `${skill} Crash Course`, url: `https://www.youtube.com/results?search_query=${skill}+crash+course`, type: 'video' },
            { title: `${skill} Documentation`, url: `https://www.google.com/search?q=${skill}+documentation`, type: 'article' }
        ]
    }));

    return {
        matchPercentage,
        matchedSkills,
        missingSkills,
        bonusSkills,
        learningPath
    };
};

module.exports = { analyzeSkills };
