#!/usr/bin/env node
// Generates icons/icon16.png, icon48.png, icon128.png using pure Node.js (no deps)
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ICON_DIR = path.join(__dirname, 'icons');
if (!fs.existsSync(ICON_DIR)) fs.mkdirSync(ICON_DIR);

// Facebook blue + white "M" mark
const BG  = [24, 119, 242];   // #1877F2
const FG  = [255, 255, 255];  // white

function makePNG(size) {
  // Draw pixels into a flat RGB buffer
  const pixels = new Uint8Array(size * size * 3).fill(0);

  // Fill background
  for (let i = 0; i < size * size; i++) {
    pixels[i * 3]     = BG[0];
    pixels[i * 3 + 1] = BG[1];
    pixels[i * 3 + 2] = BG[2];
  }

  // Draw a simple rounded-square outline + letter M scaled to icon size
  drawM(pixels, size);

  // Build raw PNG image data: one filter byte (0 = None) per row
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    row[0] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 3;
      row[1 + x * 3]     = pixels[idx];
      row[1 + x * 3 + 1] = pixels[idx + 1];
      row[1 + x * 3 + 2] = pixels[idx + 2];
    }
    rows.push(row);
  }

  const imageData = Buffer.concat(rows);
  const compressed = zlib.deflateSync(imageData, { level: 9 });

  // IHDR data
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);   // width
  ihdr.writeUInt32BE(size, 4);   // height
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  // compression, filter, interlace = 0

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function drawM(pixels, size) {
  const s = size;
  const pad = Math.max(1, Math.round(s * 0.14));
  const thick = Math.max(1, Math.round(s * 0.12));

  // The "M" strokes in normalised coords (0..1), drawn as filled rectangles
  // Left vertical | right vertical | left diagonal \ | right diagonal /
  const strokes = [
    // [x, y, w, h] in normalised coords
    [0.14, 0.18, 0.14, 0.64],   // left vertical
    [0.72, 0.18, 0.14, 0.64],   // right vertical
  ];

  for (const [nx, ny, nw, nh] of strokes) {
    fillRect(pixels, s,
      Math.round(nx * s), Math.round(ny * s),
      Math.round(nw * s), Math.round(nh * s),
      FG
    );
  }

  // Diagonal legs
  drawDiag(pixels, s,
    Math.round(0.14 * s), Math.round(0.18 * s),
    Math.round(0.50 * s), Math.round(0.50 * s),
    thick, FG
  );
  drawDiag(pixels, s,
    Math.round(0.50 * s), Math.round(0.50 * s),
    Math.round(0.86 * s), Math.round(0.18 * s),
    thick, FG
  );
}

function fillRect(pixels, size, x, y, w, h, color) {
  for (let row = y; row < y + h && row < size; row++) {
    for (let col = x; col < x + w && col < size; col++) {
      const i = (row * size + col) * 3;
      pixels[i] = color[0]; pixels[i+1] = color[1]; pixels[i+2] = color[2];
    }
  }
}

function drawDiag(pixels, size, x0, y0, x1, y1, thick, color) {
  const dx = x1 - x0, dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = Math.round(x0 + dx * t);
    const cy = Math.round(y0 + dy * t);
    fillRect(pixels, size, cx, cy, thick, thick, color);
  }
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.concat([typeBytes, data]);
  const crc = crc32(crcBuf);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const crcOut = Buffer.alloc(4); crcOut.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([len, typeBytes, data, crcOut]);
}

// CRC-32 (ISO 3309)
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate all three sizes
for (const size of [16, 48, 128]) {
  const data = makePNG(size);
  const file = path.join(ICON_DIR, `icon${size}.png`);
  fs.writeFileSync(file, data);
  console.log(`Created ${file} (${data.length} bytes)`);
}

console.log('Icons generated successfully.');
