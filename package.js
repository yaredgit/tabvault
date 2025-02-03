const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

// Verify required files
const requiredFiles = [
  'manifest.json',
  'popup.html',
  'popup.js',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png'
];

function verifyFiles() {
  const missing = requiredFiles.filter(file => !fs.existsSync(file));
  if (missing.length > 0) {
    console.error('Missing required files:', missing);
    process.exit(1);
  }
}

// Create the package
function createPackage() {
  const output = fs.createWriteStream('tabvault.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log('Package created successfully!');
    console.log(`Size: ${(archive.pointer() / 1024).toFixed(2)} KB`);
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // Add files
  requiredFiles.forEach(file => {
    archive.file(file, { name: file });
  });

  archive.finalize();
}

// Run verification and packaging
console.log('Verifying files...');
verifyFiles();
console.log('Creating package...');
createPackage(); 