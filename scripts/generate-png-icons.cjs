const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const srcDir = path.join(__dirname, '..', 'src', 'assets', 'images');

// Locate the official aura app icon source
let srcImage = path.join(srcDir, 'shadowrise_aura_app_icon_1790673045445.jpg');
if (!fs.existsSync(srcImage)) {
  const images = fs.readdirSync(srcDir).filter(f => f.startsWith('shadowrise_aura_app_icon'));
  if (images.length > 0) {
    srcImage = path.join(srcDir, images[0]);
  }
}

async function generateAllIcons() {
  console.log('Generating official ShadowRise purple aura icons from:', srcImage);

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Master 1024x1024
  const master = sharp(srcImage)
    .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .sharpen({ sigma: 1.2, m1: 1.5, m2: 0.8 });

  await master.clone().png({ quality: 100, compressionLevel: 9 }).toFile(path.join(publicDir, 'shadowrise-icon-1024.png'));
  await master.clone().jpeg({ quality: 98 }).toFile(path.join(publicDir, 'app-icon-1024.jpg'));
  await master.clone().jpeg({ quality: 98 }).toFile(path.join(publicDir, 'app-icon.jpg'));
  console.log('✓ Master 1024 icons');

  // 2. 512x512 standard PWA
  await sharp(srcImage)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .sharpen({ sigma: 1.1 })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✓ pwa-512x512.png');

  // 3. 512x512 maskable PWA
  const innerSize = Math.round(512 * 0.82);
  const innerBuffer = await sharp(srcImage)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .sharpen({ sigma: 1.1 })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
    .composite([{ input: innerBuffer, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✓ pwa-maskable-512x512.png');

  // 4. 192x192 PWA
  await sharp(srcImage)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .sharpen({ sigma: 1.2 })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ pwa-192x192.png');

  // 5. 180x180 Apple Touch Icon
  await sharp(srcImage)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .sharpen({ sigma: 1.2 })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png');

  // 6. 512x512 Splash Icon
  await sharp(srcImage)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'splash-icon-512.png'));
  console.log('✓ splash-icon-512.png');

  // 7. Favicon (64x64 & 32x32)
  await sharp(srcImage)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .sharpen({ sigma: 1.4 })
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  await sharp(srcImage)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .sharpen({ sigma: 1.5 })
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✓ favicon.ico & favicon-32x32.png');

  // 8. icon.svg
  const pwa512Buffer = fs.readFileSync(path.join(publicDir, 'pwa-512x512.png'));
  const base64Data = pwa512Buffer.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <filter id="subtlePurpleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <radialGradient id="ambientAuraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9333ea" stop-opacity="0.35" />
      <stop offset="50%" stop-color="#7e22ce" stop-opacity="0.15" />
      <stop offset="85%" stop-color="#581c87" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="#000000" />
  <circle cx="256" cy="256" r="230" fill="url(#ambientAuraGlow)" />
  <rect width="500" height="500" x="6" y="6" rx="112" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-opacity="0.4" />
  <rect width="492" height="492" x="10" y="10" rx="108" fill="none" stroke="#c084fc" stroke-width="1" stroke-opacity="0.2" />
  <g filter="url(#subtlePurpleGlow)">
    <image href="data:image/png;base64,${base64Data}" x="0" y="0" width="512" height="512" preserveAspectRatio="xMidYMid meet" />
  </g>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
  console.log('✓ icon.svg');

  console.log('\nAll ShadowRise purple flame aura icons successfully generated!');
}

generateAllIcons().catch(console.error);
