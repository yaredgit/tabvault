const sharp = require('sharp');
const fs = require('fs');

async function convertSvgToPng(input, output, size) {
  const svg = fs.readFileSync(input, 'utf8');
  await sharp(Buffer.from(svg))
    .resize(size, size) // Ensure correct size
    .toFormat('png')
    .toFile(output);
}

async function convertAll() {
  try {
    // Ensure icons directory exists
    if (!fs.existsSync('./icons')) {
      fs.mkdirSync('./icons');
    }

    await convertSvgToPng('./icons/icon16.svg', './icons/icon16.png', 16);
    await convertSvgToPng('./icons/icon48.svg', './icons/icon48.png', 48);
    await convertSvgToPng('./icons/icon128.svg', './icons/icon128.png', 128);
    console.log('Icons converted successfully!');
  } catch (error) {
    console.error('Error converting icons:', error);
  }
}

convertAll(); 