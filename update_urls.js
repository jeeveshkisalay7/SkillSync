const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'frontend/src/pages/Auth.jsx',
    'frontend/src/pages/Dashboard.jsx',
    'frontend/src/pages/JobListings.jsx',
    'frontend/src/pages/SkillAnalyzer.jsx'
];

filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Regex to match 'http://localhost:5000/api/...' or "http://localhost:5000/api/..." or `http://localhost:5000/api/...`
        // We capture the quote type and the rest of the url.
        content = content.replace(/(['"`])http:\/\/localhost:5000\/api(.*?)\1/g, (match, quote, rest) => {
            return '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api' + rest + '`';
        });

        // Some places might use string interpolation already: `http://localhost:5000/api/${id}`
        // The above regex handles `http://localhost:5000/api/something` but let's test it carefully.
        content = content.replace(/http:\/\/localhost:5000\/api/g, '${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
