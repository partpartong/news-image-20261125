// main.ts — news-image-20261125 entry program (Node 22, stdlib only).
// Copies entry.png byte-for-byte to the output directory after a strict
// gate-check. Runs twice must write identical bytes (the file is copied,
// never re-encoded). Written fresh in-session for this competition.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "entry.png");
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const OUT = join(OUT_DIR, "entry.png");
const MAX_BYTES = 1024 * 1024;

function fail(msg) {
  throw new Error("entry.png gate-check failed: " + msg);
}

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    crc32.table = table;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const data = readFileSync(SRC);

// 1. Size limit.
if (data.length > MAX_BYTES) fail(`size ${data.length} > ${MAX_BYTES} bytes`);

// 2. PNG signature.
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!data.subarray(0, 8).equals(PNG_SIG)) fail("bad PNG signature");

// 3. Chunk walk: validate CRCs, capture IHDR + IDAT, require IEND.
let off = 8;
let width = 0, height = 0, bitDepth = 0, colorType = 0;
let sawIHDR = false, sawIDAT = false, sawIEND = false;
let idatBytes = 0;
while (off + 8 <= data.length) {
  const len = data.readUInt32BE(off);
  const type = data.toString("latin1", off + 4, off + 8);
  const chunkStart = off + 8;
  const chunkEnd = chunkStart + len;
  if (chunkEnd + 4 > data.length) fail(`chunk ${type} overruns file`);
  const stored = data.readUInt32BE(chunkEnd);
  const computed = crc32(data.subarray(off + 4, chunkEnd));
  if (stored !== computed) fail(`chunk ${type} CRC mismatch`);
  if (type === "IHDR") {
    if (sawIHDR) fail("duplicate IHDR");
    sawIHDR = true;
    width = data.readUInt32BE(chunkStart);
    height = data.readUInt32BE(chunkStart + 4);
    bitDepth = data[chunkStart + 8];
    colorType = data[chunkStart + 9];
  } else if (type === "IDAT") {
    sawIDAT = true;
    idatBytes += len;
  } else if (type === "IEND") {
    sawIEND = true;
    if (chunkEnd + 4 !== data.length) fail("trailing data after IEND");
    break;
  }
  off = chunkEnd + 4;
}
if (!sawIHDR) fail("missing IHDR");
if (!sawIDAT) fail("missing IDAT");
if (idatBytes === 0) fail("IDAT payload is empty");
if (!sawIEND) fail("missing IEND");

// 4. Exact dimensions + supported colour model.
if (width !== 1024 || height !== 1024) fail(`dimensions ${width}x${height} != 1024x1024`);
if (bitDepth !== 8) fail(`bit depth ${bitDepth} != 8`);
if (![0, 2, 3, 4, 6].includes(colorType)) fail(`unsupported color type ${colorType}`);

// 5. Byte-for-byte copy + sha256 verify.
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, data);
const copied = readFileSync(OUT);
const sha = (b) => createHash("sha256").update(b).digest("hex");
if (sha(copied) !== sha(data)) fail("output sha256 mismatch after copy");
if (!existsSync(OUT)) fail("output file missing");

console.log(`OK entry.png ${data.length} bytes 1024x1024 sha256=${sha(data)}`);
