const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Custom PNG generator with the large glowing "S" symbol, circular energy ring, and purple particles
function createShadowRiseIcon(width, height) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const ringRadius = width * 0.36;
  const ringThickness = Math.max(2, width * 0.018);

  // Pre-generate deterministic floating purple particles
  const particles = [
    { x: cx - width * 0.22, y: cy - height * 0.25, r: width * 0.015, intensity: 0.9 },
    { x: cx + width * 0.25, y: cy - height * 0.22, r: width * 0.018, intensity: 1.0 },
    { x: cx - width * 0.28, y: cy + height * 0.18, r: width * 0.014, intensity: 0.8 },
    { x: cx + width * 0.26, y: cy + height * 0.24, r: width * 0.016, intensity: 0.95 },
    { x: cx + width * 0.08, y: cy - height * 0.34, r: width * 0.012, intensity: 0.75 },
    { x: cx - width * 0.12, y: cy + height * 0.32, r: width * 0.015, intensity: 0.85 },
  ];

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 1. Pure Pitch Black & Obsidian Core (#040208) with subtle dark violet vignette (#150628)
      const edgeFactor = Math.min(1, dist / (width * 0.65));
      let r = Math.round(4 + edgeFactor * 17);   // 4 -> 21
      let g = Math.round(2 + edgeFactor * 4);    // 2 -> 6
      let b = Math.round(8 + edgeFactor * 32);   // 8 -> 40
      const a = 255;

      // 2. Diffuse Violet Ambient Glow
      if (dist < width * 0.45) {
        const ambient = Math.pow(1 - dist / (width * 0.45), 2);
        r = Math.min(255, Math.round(r + ambient * 70));
        g = Math.min(255, Math.round(g + ambient * 20));
        b = Math.min(255, Math.round(b + ambient * 140));
      }

      // 3. Circular Energy Ring Behind the Symbol
      const ringDist = Math.abs(dist - ringRadius);
      if (ringDist < ringThickness * 3.5) {
        const ringGlow = Math.exp(-Math.pow(ringDist / (ringThickness * 1.4), 2));
        r = Math.min(255, Math.round(r + ringGlow * 180));
        g = Math.min(255, Math.round(g + ringGlow * 110));
        b = Math.min(255, Math.round(b + ringGlow * 250));
      }

      // Secondary Inner Rune Accent
      const innerRingDist = Math.abs(dist - ringRadius * 0.82);
      if (innerRingDist < ringThickness * 1.5) {
        const innerGlow = Math.exp(-Math.pow(innerRingDist / (ringThickness * 0.8), 2)) * 0.45;
        r = Math.min(255, Math.round(r + innerGlow * 160));
        g = Math.min(255, Math.round(g + innerGlow * 90));
        b = Math.min(255, Math.round(b + innerGlow * 240));
      }

      // 4. Floating Purple Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pdist = Math.sqrt((x - p.x) * (x - p.x) + (y - p.y) * (y - p.y));
        if (pdist < p.r * 2.5) {
          const pGlow = Math.exp(-Math.pow(pdist / p.r, 2)) * p.intensity;
          r = Math.min(255, Math.round(r + pGlow * 220));
          g = Math.min(255, Math.round(g + pGlow * 180));
          b = Math.min(255, Math.round(b + pGlow * 255));
        }
      }

      // 5. Stylized Shadow Monarch Blade "S" Symbol
      // Normalized coordinates (-1 to 1)
      const nx = dx / (width * 0.28);
      const ny = dy / (height * 0.32);

      let inS = false;
      let isCenterSpine = false;
      let sGlow = 0;

      // Top horizontal bar: y in [-0.95, -0.45], x in [-0.75, 0.85]
      if (ny >= -0.92 && ny <= -0.48 && nx >= -0.72 && nx <= 0.82) {
        inS = true;
        if (Math.abs(ny - -0.70) < 0.08) isCenterSpine = true;
      }
      // Top-left vertical spine: y in [-0.55, 0.05], x in [-0.72, -0.15]
      else if (ny >= -0.55 && ny <= 0.05 && nx >= -0.72 && nx <= -0.15) {
        inS = true;
        if (Math.abs(nx - -0.43) < 0.08) isCenterSpine = true;
      }
      // Center diagonal connector: y in [-0.25, 0.25], x roughly -0.5 to 0.5
      else if (Math.abs(ny) <= 0.22 && Math.abs(nx - (-ny * 1.5)) <= 0.38) {
        inS = true;
        if (Math.abs(nx - (-ny * 1.5)) < 0.12) isCenterSpine = true;
      }
      // Bottom-right vertical spine: y in [-0.05, 0.55], x in [0.15, 0.72]
      else if (ny >= -0.05 && ny <= 0.55 && nx >= 0.15 && nx <= 0.72) {
        inS = true;
        if (Math.abs(nx - 0.43) < 0.08) isCenterSpine = true;
      }
      // Bottom horizontal bar: y in [0.48, 0.92], x in [-0.82, 0.72]
      else if (ny >= 0.48 && ny <= 0.92 && nx >= -0.82 && nx <= 0.72) {
        inS = true;
        if (Math.abs(ny - 0.70) < 0.08) isCenterSpine = true;
      }

      if (inS) {
        if (isCenterSpine) {
          // Intense white-hot core
          r = 255;
          g = 250;
          b = 255;
        } else {
          // Electric violet / bright purple blade body
          const grad = (ny + 1) * 0.5;
          r = Math.round(200 - grad * 40);
          g = Math.round(135 - grad * 30);
          b = Math.round(255 - grad * 20);
        }
      } else {
        // Shadow Aura around the S symbol
        const distToS = getDistanceToS(nx, ny);
        if (distToS < 0.28) {
          sGlow = Math.exp(-Math.pow(distToS / 0.14, 2));
          r = Math.min(255, Math.round(r + sGlow * 170));
          g = Math.min(255, Math.round(g + sGlow * 85));
          b = Math.min(255, Math.round(b + sGlow * 240));
        }
      }

      // Outer squircle border accent
      if (dist >= width * 0.47 && dist <= width * 0.49) {
        r = Math.min(255, Math.round(r + 120));
        g = Math.min(255, Math.round(g + 60));
        b = Math.min(255, Math.round(b + 200));
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function getDistanceToS(nx, ny) {
  // Approximate distance to the S spine segments
  let minDist = 999;

  // Segment 1: top horizontal [-0.6, -0.7] to [0.7, -0.7]
  minDist = Math.min(minDist, distToSegment(nx, ny, -0.6, -0.7, 0.7, -0.7));
  // Segment 2: top-left vertical [-0.5, -0.7] to [-0.5, 0.0]
  minDist = Math.min(minDist, distToSegment(nx, ny, -0.5, -0.7, -0.5, 0.0));
  // Segment 3: center cross [-0.5, 0.0] to [0.5, 0.0]
  minDist = Math.min(minDist, distToSegment(nx, ny, -0.5, 0.0, 0.5, 0.0));
  // Segment 4: bottom-right vertical [0.5, 0.0] to [0.5, 0.7]
  minDist = Math.min(minDist, distToSegment(nx, ny, 0.5, 0.0, 0.5, 0.7));
  // Segment 5: bottom horizontal [-0.7, 0.7] to [0.6, 0.7]
  minDist = Math.min(minDist, distToSegment(nx, ny, -0.7, 0.7, 0.6, 0.7));

  return minDist;
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc >>> 0, 8 + len);
  return chunk;
}

let crcTable = null;
function getCrcTable() {
  if (crcTable) return crcTable;
  crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
}

function crc32(buf) {
  const table = getCrcTable();
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating 1024x1024 master icon...');
fs.writeFileSync(path.join(publicDir, 'shadowrise-icon-1024.png'), createShadowRiseIcon(1024, 1024));

console.log('Generating 512x512 PWA icons...');
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createShadowRiseIcon(512, 512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createShadowRiseIcon(512, 512));

console.log('Generating 192x192 PWA icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createShadowRiseIcon(192, 192));

console.log('Generating 180x180 Apple touch icon...');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createShadowRiseIcon(180, 180));

console.log('Generating 64x64 favicon...');
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createShadowRiseIcon(64, 64));

console.log('All ShadowRise app icons generated successfully!');
