const analyzeSkills = (userSkills, requiredSkills) => {
    if (!requiredSkills || requiredSkills.length === 0) {
        return { matchPercentage: 100, matchedSkills: [], missingSkills: [], learningPath: [] };
    }

    const userS = userSkills.map(s => s.toLowerCase().trim());
    const reqS = requiredSkills.map(s => s.toLowerCase().trim());

    const matchedSkills = requiredSkills.filter(skill => userS.includes(skill.toLowerCase().trim()));
    const missingSkills = requiredSkills.filter(skill => !userS.includes(skill.toLowerCase().trim()));

    const matchPercentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);

    const learningPath = missingSkills.map(skill => ({
        skill: skill,
        resource: `Search for ${skill} crash course on YouTube or freeCodeCamp`
    }));

    return {
        matchPercentage,
        matchedSkills,
        missingSkills,
        learningPath
    };
};

module.exports = { analyzeSkills };
