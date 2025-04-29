const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const DEST_DIR = path.join(__dirname, '../dist');
const DEST_ZIP_DIR = path.join(__dirname, '../dist-zip');

const extractExtensionData = () => {
  const manifest = require('../manifest.json');
  return {
    name: manifest.name.toLowerCase().replace(/\s/g, '-'),
    version: manifest.version
  };
};

const makeDestZipDirIfNotExists = () => {
  if (!fs.existsSync(DEST_ZIP_DIR)) {
    fs.mkdirSync(DEST_ZIP_DIR);
  }
};

const buildZip = (src, dist, zipFilename) => {
  console.info(`Building ${zipFilename}...`);
  console.info(`Source directory: ${src}`);
  console.info(`Output directory: ${dist}`);

  if (!fs.existsSync(src)) {
    throw new Error(`Source directory ${src} does not exist`);
  }

  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(path.join(dist, zipFilename));

  return new Promise((resolve, reject) => {
    archive
      .directory(src, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => {
      console.info(`Successfully created ${zipFilename}`);
      console.info(`Files included in the zip:`);
      archive.pointer() > 0 
        ? console.info(`Total bytes: ${archive.pointer()}`)
        : console.warn('Warning: The zip file appears to be empty');
      resolve();
    });

    archive.finalize();
  });
};

const main = async () => {
  const { name, version } = extractExtensionData();
  const zipFilename = `${name}-v${version}.zip`;

  makeDestZipDirIfNotExists();

  try {
    // List files in dist directory before zipping
    console.info('Files in dist directory:');
    fs.readdirSync(DEST_DIR).forEach(file => {
      console.info(`- ${file}`);
    });

    await buildZip(DEST_DIR, DEST_ZIP_DIR, zipFilename);
    console.info('Build complete!');
  } catch (err) {
    console.error('Error during packaging:', err);
    process.exit(1);
  }
};

main(); 