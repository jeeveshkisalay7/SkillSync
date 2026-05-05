const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./frontend/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/http:\/\/localhost:5000/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}`');
  
  // The above replace will change 'http://localhost:5000/api/auth' to '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}`/api/auth'
  // But wait! If the original code is inside a string literal like: 'http://localhost:5000/api'
  // It becomes: ''`${...}`/api'' which is invalid.
  // Let's do it better.
});
