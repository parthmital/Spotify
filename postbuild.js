// postbuild.js
const fs = require('fs-extra');

// 1. Check if files exist in public
console.log('Checking public files...');
console.log('Image exists:', fs.existsSync('public/Images/blinding-lights.jpg'));
console.log('Audio exists:', fs.existsSync('public/Songs/The Weeknd - Blinding Lights.mp3'));

// 2. Copy to build folder
fs.copySync('public/Images', 'build/Images');
fs.copySync('public/Songs', 'build/Songs');

// 3. Verify copy succeeded
console.log('\nVerifying build files...');
console.log('Image copied:', fs.existsSync('build/Images/blinding-lights.jpg'));
console.log('Audio copied:', fs.existsSync('build/Songs/The Weeknd - Blinding Lights.mp3'));