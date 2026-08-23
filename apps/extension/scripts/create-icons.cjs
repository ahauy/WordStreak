const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, r = 134, g = 59, b = 255) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 2; // RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    const crc = crc32(Buffer.concat([Buffer.from(type), data]));
    buf.writeInt32BE(crc, 8 + len);
    return buf;
  }

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return crc ^ -1;
  }

  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data: height lines, each line starts with filter byte 0, then width * 3 bytes (RGB)
  const rawData = Buffer.alloc(height * (1 + width * 3));
  let pos = 0;
  for (let y = 0; y < height; y++) {
    rawData[pos++] = 0; // filter None
    for (let x = 0; x < width; x++) {
      rawData[pos++] = r;
      rawData[pos++] = g;
      rawData[pos++] = b;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon16.png'), createPng(16, 16));
fs.writeFileSync(path.join(iconsDir, 'icon48.png'), createPng(48, 48));
fs.writeFileSync(path.join(iconsDir, 'icon128.png'), createPng(128, 128));

console.log('Icons created successfully.');
