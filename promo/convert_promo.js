const sharp = require('sharp');
const fs = require('fs');

async function convertPromotionalMaterials() {
  try {
    // Convert promotional tile
    const promoSvg = fs.readFileSync('./promo/promotional_tile.svg', 'utf8');
    await sharp(Buffer.from(promoSvg))
      .png()
      .toFile('./promo/promotional_tile.png');
    console.log('Created promotional tile');

    // Create a smaller version for the Chrome Web Store icon
    await sharp(Buffer.from(promoSvg))
      .resize(128, 128)
      .png()
      .toFile('./promo/store_icon.png');
    console.log('Created store icon');

  } catch (error) {
    console.error('Error converting promotional materials:', error);
  }
}

convertPromotionalMaterials(); 