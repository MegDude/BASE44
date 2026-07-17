const DEFAULT_ORIGIN = "https://base-44-h2iq.vercel.app";

export const RESIDENT_CARD_STORAGE_KEY = "dp_resident_card:current";
export const RESIDENT_ACCESS_STORAGE_KEY = "dp_resident_access:current";

const QR_VERSION = 5;
const QR_SIZE = 17 + QR_VERSION * 4;
const QR_DATA_CODEWORDS = 108;
const QR_EC_CODEWORDS = 26;

function clean(value, limit = 240) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, limit);
}

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(String(value || ""));
}

function getRuntimeOrigin(origin) {
  if (origin) return String(origin).replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return DEFAULT_ORIGIN;
}

function stableHash(input = "") {
  let hash = 2166136261;
  const text = String(input || "");
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).padStart(7, "0");
}

function randomToken(seed = "") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `rc_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
  }
  return `rc_${stableHash(`${seed}:${Date.now()}:${Math.random()}`)}${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCard(source = {}, origin) {
  const token = clean(source.token || source.qrToken || source.cardToken, 80) || randomToken(source.email || source.id || source.user_id);
  const seed = source.profileId || source.residentId || source.userId || source.user_id || source.id || source.email || token;
  const cardNumber = clean(source.cardNumber || source.card_code, 40) || `DP-${stableHash(seed).slice(0, 8).toUpperCase()}`;
  const cardId = clean(source.cardId, 120) || `card-${token}`;
  const verifyUrl = new URL("/api/resident-card/verify", getRuntimeOrigin(origin));
  verifyUrl.searchParams.set("token", token);

  return {
    id: cardId,
    cardId,
    token,
    cardNumber,
    status: clean(source.status, 40) || "active",
    issuedAt: clean(source.issuedAt, 60) || new Date().toISOString(),
    verifyUrl: clean(source.verifyUrl, 500) || verifyUrl.toString(),
    qrValue: clean(source.qrValue, 500) || verifyUrl.toString(),
  };
}

export function createResidentCardProfile(record = {}, options = {}) {
  const current = record?.residentCard || record?.card || {};
  const profileId = clean(record.profileId || record.residentId || record.userId || record.user_id || record.id, 180)
    || `resident-${stableHash(record.email || record.fullName || record.name || Date.now())}`;
  const fullName = clean(record.fullName || record.name || record.full_name, 160);
  const email = clean(record.email, 240).toLowerCase();
  const card = normalizeCard({
    ...current,
    profileId,
    email,
    id: profileId,
    user_id: record.user_id,
  }, options.origin);

  return {
    ...record,
    id: record.id || profileId,
    profileId,
    residentId: record.residentId || profileId,
    fullName,
    name: record.name || fullName,
    email,
    residentCard: card,
    cardId: card.cardId,
    cardNumber: card.cardNumber,
    qrToken: card.token,
    qrValue: card.qrValue,
  };
}

export function parseResidentQrValue(raw = "") {
  const value = clean(raw, 1000);
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return {
        token: clean(parsed.token || parsed.qrToken || parsed.cardToken || parsed.residentCard?.token, 80),
        cardNumber: clean(parsed.cardNumber || parsed.card_code || parsed.residentCard?.cardNumber, 40),
        residentId: clean(parsed.residentId || parsed.profileId || parsed.uid || parsed.id, 180),
        raw: value,
      };
    }
  } catch {
    // Plain URLs and compact QR payloads are expected.
  }

  if (value.startsWith("DPQR:1:")) {
    return { token: clean(value.slice("DPQR:1:".length), 80), raw: value };
  }

  try {
    const url = new URL(value);
    return {
      token: clean(url.searchParams.get("token") || url.searchParams.get("qrToken") || url.searchParams.get("cardToken"), 80),
      cardNumber: clean(url.searchParams.get("card") || url.searchParams.get("cardNumber") || url.searchParams.get("code"), 40),
      residentId: clean(url.searchParams.get("residentId") || url.searchParams.get("profileId") || url.searchParams.get("residentUid"), 180),
      raw: value,
    };
  } catch {
    // Not a URL.
  }

  const cardMatch = value.match(/\bDP-[A-Z0-9-]{4,}\b/i);
  const tokenMatch = value.match(/\brc_[a-z0-9]{8,}\b/i);
  return {
    token: clean(tokenMatch?.[0], 80),
    cardNumber: clean(cardMatch?.[0]?.toUpperCase(), 40),
    raw: value,
  };
}

function makeMatrix(size = QR_SIZE) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function setModule(matrix, x, y, value) {
  if (x >= 0 && y >= 0 && y < matrix.length && x < matrix.length) matrix[y][x] = value ? 1 : 0;
}

function reserve(matrix, x, y, value = 0) {
  setModule(matrix, x, y, value);
}

function drawFinder(matrix, x, y) {
  for (let dy = -1; dy <= 7; dy += 1) {
    for (let dx = -1; dx <= 7; dx += 1) {
      const xx = x + dx;
      const yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= matrix.length || yy >= matrix.length) continue;
      const inSquare = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
      const dark = inSquare && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
      reserve(matrix, xx, yy, dark);
    }
  }
}

function drawAlignment(matrix, cx, cy) {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      const dark = Math.max(Math.abs(dx), Math.abs(dy)) !== 1;
      reserve(matrix, cx + dx, cy + dy, dark);
    }
  }
}

function drawFunctionPatterns(matrix) {
  const size = matrix.length;
  drawFinder(matrix, 0, 0);
  drawFinder(matrix, size - 7, 0);
  drawFinder(matrix, 0, size - 7);
  for (let index = 8; index < size - 8; index += 1) {
    reserve(matrix, index, 6, index % 2 === 0);
    reserve(matrix, 6, index, index % 2 === 0);
  }
  drawAlignment(matrix, 30, 30);
  reserve(matrix, 8, 4 * QR_VERSION + 9, 1);
  for (let index = 0; index < 9; index += 1) {
    if (matrix[8][index] === null) reserve(matrix, index, 8, 0);
    if (matrix[index][8] === null) reserve(matrix, 8, index, 0);
  }
  for (let index = size - 8; index < size; index += 1) {
    reserve(matrix, index, 8, 0);
    reserve(matrix, 8, index, 0);
  }
}

function gfMul(x, y) {
  let result = 0;
  while (y > 0) {
    if (y & 1) result ^= x;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
    y >>= 1;
  }
  return result;
}

function reedSolomonGenerator(degree) {
  let poly = [1];
  let root = 1;
  for (let index = 0; index < degree; index += 1) {
    const next = Array(poly.length + 1).fill(0);
    for (let coefficient = 0; coefficient < poly.length; coefficient += 1) {
      next[coefficient] ^= gfMul(poly[coefficient], root);
      next[coefficient + 1] ^= poly[coefficient];
    }
    poly = next;
    root = gfMul(root, 2);
  }
  return poly;
}

function reedSolomonRemainder(data, degree) {
  const generator = reedSolomonGenerator(degree);
  const result = Array(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ result.shift();
    result.push(0);
    for (let index = 0; index < degree; index += 1) {
      result[index] ^= gfMul(generator[index], factor);
    }
  }
  return result;
}

function bytesForPayload(value) {
  const encoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
  if (encoder) return Array.from(encoder.encode(value));
  return Array.from(unescape(encodeURIComponent(value))).map((char) => char.charCodeAt(0));
}

function appendBits(bits, value, length) {
  for (let shift = length - 1; shift >= 0; shift -= 1) bits.push((value >>> shift) & 1);
}

function dataCodewords(value) {
  let bytes = bytesForPayload(value);
  if (bytes.length > 106) bytes = bytesForPayload(`DPQR:1:${parseResidentQrValue(value).token || stableHash(value)}`);
  if (bytes.length > 106) bytes = bytes.slice(0, 106);
  const bits = [];
  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, 8);
  bytes.forEach((byte) => appendBits(bits, byte, 8));
  const capacityBits = QR_DATA_CODEWORDS * 8;
  appendBits(bits, 0, Math.min(4, capacityBits - bits.length));
  while (bits.length % 8) bits.push(0);
  const words = [];
  for (let index = 0; index < bits.length; index += 8) {
    words.push(bits.slice(index, index + 8).reduce((acc, bit) => (acc << 1) | bit, 0));
  }
  for (let pad = 0; words.length < QR_DATA_CODEWORDS; pad += 1) words.push(pad % 2 ? 0x11 : 0xec);
  return words.slice(0, QR_DATA_CODEWORDS);
}

function maskBit(x, y) {
  return (x + y) % 2 === 0;
}

function placeData(matrix, bits) {
  const size = matrix.length;
  let bitIndex = 0;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;
    for (let vertical = 0; vertical < size; vertical += 1) {
      const y = upward ? size - 1 - vertical : vertical;
      for (let dx = 0; dx < 2; dx += 1) {
        const x = right - dx;
        if (matrix[y][x] !== null) continue;
        const bit = bits[bitIndex] || 0;
        setModule(matrix, x, y, bit ^ (maskBit(x, y) ? 1 : 0));
        bitIndex += 1;
      }
    }
    upward = !upward;
  }
}

function formatBits() {
  const eclLow = 1;
  const mask = 0;
  let data = (eclLow << 3) | mask;
  let remainder = data << 10;
  for (let bit = 14; bit >= 10; bit -= 1) {
    if ((remainder >>> bit) & 1) remainder ^= 0x537 << (bit - 10);
  }
  return ((data << 10) | remainder) ^ 0x5412;
}

function drawFormat(matrix) {
  const bits = formatBits();
  const size = matrix.length;
  const a = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  const b = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8], [size - 6, 8], [size - 7, 8], [size - 8, 8],
    [8, size - 7], [8, size - 6], [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1],
  ];
  for (let index = 0; index < 15; index += 1) {
    const bit = (bits >>> index) & 1;
    reserve(matrix, a[index][0], a[index][1], bit);
    reserve(matrix, b[index][0], b[index][1], bit);
  }
}

function matrixForValue(value) {
  const data = dataCodewords(clean(value, 500));
  const ec = reedSolomonRemainder(data, QR_EC_CODEWORDS);
  const codewords = data.concat(ec);
  const bits = [];
  codewords.forEach((byte) => appendBits(bits, byte, 8));
  const matrix = makeMatrix();
  drawFunctionPatterns(matrix);
  placeData(matrix, bits);
  drawFormat(matrix);
  return matrix.map((row) => row.map((cell) => (cell ? 1 : 0)));
}

export function getResidentCardQrValue(valueOrCard) {
  if (!valueOrCard) return createResidentCardProfile({}).residentCard.qrValue;
  if (typeof valueOrCard === "string") return valueOrCard;
  return valueOrCard.qrValue || valueOrCard.verifyUrl || valueOrCard.token || valueOrCard.cardNumber || "";
}

export function getResidentCardQrSvg(valueOrCard, options = {}) {
  const value = getResidentCardQrValue(valueOrCard);
  const matrix = matrixForValue(value);
  const quiet = 4;
  const moduleSize = options.moduleSize || 6;
  const dimension = (matrix.length + quiet * 2) * moduleSize;
  const modules = [];
  matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) modules.push(`<rect x="${(x + quiet) * moduleSize}" y="${(y + quiet) * moduleSize}" width="${moduleSize}" height="${moduleSize}"/>`);
    });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dimension} ${dimension}" width="${dimension}" height="${dimension}" role="img" aria-label="Downtown Perks resident QR code"><rect width="100%" height="100%" fill="#fff"/><g fill="#0B1F33">${modules.join("")}</g></svg>`;
}

export function getResidentCardQrImageSrc(valueOrCard) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(getResidentCardQrSvg(valueOrCard))}`;
}

export function readStoredResidentAccess() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(RESIDENT_ACCESS_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function readStoredResidentCard() {
  if (typeof window === "undefined") return null;
  try {
    const stored = JSON.parse(window.localStorage.getItem(RESIDENT_CARD_STORAGE_KEY) || "null");
    if (stored?.residentCard) return stored.residentCard;
    if (stored?.cardId || stored?.cardNumber || stored?.token) return stored;
    const resident = readStoredResidentAccess();
    return resident?.residentCard || null;
  } catch {
    return null;
  }
}

export function writeStoredResidentCard(recordOrCard) {
  if (typeof window === "undefined" || !recordOrCard) return null;
  const profile = recordOrCard.residentCard ? recordOrCard : createResidentCardProfile(recordOrCard);
  try {
    window.localStorage.setItem(RESIDENT_CARD_STORAGE_KEY, JSON.stringify(profile.residentCard));
    if (profile.id || profile.email || profile.fullName) {
      window.localStorage.setItem(RESIDENT_ACCESS_STORAGE_KEY, JSON.stringify(profile));
    }
  } catch {
    // Resident access should not fail if storage is unavailable.
  }
  return profile.residentCard;
}
