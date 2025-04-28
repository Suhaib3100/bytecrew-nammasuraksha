const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const DIST_DIR = path.join(__dirname, '../dist');
const OUTPUT_FILE = path.join(__dirname, '../nammasuraksha-extension.zip');

// Create output directory if it doesn't exist
if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
    fs.mkdirSync(path.dirname(OUTPUT_FILE));
}

// Create a write stream
const output = fs.createWriteStream(OUTPUT_FILE);
const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
});

output.on('close', () => {
    console.log(`Extension has been zipped! (${archive.pointer()} bytes)`);
});

archive.on('error', (err) => {
    throw err;
});

// Pipe archive data to the output file
archive.pipe(output);

// Add the dist directory contents to the zip
archive.directory(DIST_DIR, false);

// Finalize the archive
archive.finalize(); 