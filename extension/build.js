const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(outputDir, 'nammasuraksha.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', () => {
  console.log(`Extension packaged successfully! Total size: ${archive.pointer()} bytes`);
  console.log('You can now load the extension from the dist folder');
});

// Handle warnings and errors
archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add files to the archive
archive.directory(path.join(__dirname, 'icons'), 'icons');
archive.file(path.join(__dirname, 'manifest.json'), { name: 'manifest.json' });
archive.file(path.join(__dirname, 'background.js'), { name: 'background.js' });
archive.file(path.join(__dirname, 'content.js'), { name: 'content.js' });
archive.file(path.join(__dirname, 'popup.html'), { name: 'popup.html' });
archive.file(path.join(__dirname, 'popup.js'), { name: 'popup.js' });
archive.file(path.join(__dirname, 'options.html'), { name: 'options.html' });
archive.file(path.join(__dirname, 'options.js'), { name: 'options.js' });
archive.file(path.join(__dirname, 'styles.css'), { name: 'styles.css' });

// Finalize the archive
archive.finalize(); 