const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function run() {
  try {
    const data = new FormData();
    data.append('cvFile', fs.createReadStream('test.pdf'));
    
    // We need a valid token to bypass 'protect' middleware
    // Wait, we probably need to login first. Let's just test without auth for a sec?
  } catch (e) {
    console.error(e);
  }
}
run();