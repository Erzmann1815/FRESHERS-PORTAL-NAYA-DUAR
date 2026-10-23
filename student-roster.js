import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const ROSTER_LAYOUTS = [
  { filename: 'SECTION A.pdf', nameEnd: 240, rollEnd: 310, registrationEnd: 370, emailEnd: 490 },
  { filename: 'SECTION B.pdf', nameEnd: 220, rollEnd: 300, registrationEnd: 350, emailEnd: 475 }
];

export function normalizeStudentName(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

export function normalizeStudentNumber(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function normalizeStudentEmail(value) {
  return String(value ?? '').normalize('NFKC').trim().toLowerCase();
}

export function studentIdentityKey({ name, roll, registrationNo, email }) {
  const normalizedName = normalizeStudentName(name);
  const normalizedRoll = normalizeStudentNumber(roll);
  const normalizedRegistrationNo = normalizeStudentNumber(registrationNo);
  const normalizedEmail = normalizeStudentEmail(email);
  if (!normalizedName || !normalizedRoll || !normalizedRegistrationNo || !normalizedEmail) return '';
  return JSON.stringify([normalizedName, normalizedRoll, normalizedRegistrationNo, normalizedEmail]);
}

export function createStudentMatcher(records) {
  const identities = new Set();
  for (const record of records) {
    const key = studentIdentityKey(record);
    if (!key || identities.has(key)) throw new Error('Roster contains incomplete or duplicate identity rows.');
    identities.add(key);
  }
  if (identities.size === 0) throw new Error('Roster has no student identity rows.');
  return {
    size: identities.size,
    matches(candidate) {
      const key = studentIdentityKey(candidate);
      return Boolean(key && identities.has(key));
    }
  };
}

function groupPageRows(items, layout) {
  const rows = [];
  for (const item of items) {
    const text = String(item.str || '').trim();
    const x = item.transform?.[4] ?? 0;
    const y = item.transform?.[5] ?? 0;
    if (!text || y > 720 || y < 80 || x >= layout.emailEnd) continue;

    const field = x < layout.nameEnd
      ? 'name'
      : x < layout.rollEnd
        ? 'roll'
        : x < layout.registrationEnd
          ? 'registrationNo'
          : 'email';
    let row = rows.find(candidate => Math.abs(candidate.y - y) <= 1.5);
    if (!row) {
      row = { y, name: [], roll: [], registrationNo: [], email: [] };
      rows.push(row);
    }
    row[field].push({ x, text });
  }

  return rows
    .map(row => Object.fromEntries(['name', 'roll', 'registrationNo', 'email'].map(field => [
      field,
      row[field].sort((left, right) => left.x - right.x).map(item => item.text).join(' ').trim()
    ])))
    .filter(row => row.name || row.roll || row.registrationNo || row.email);
}

export async function loadStudentMatcher(rosterDirectory) {
  const records = [];
  for (const layout of ROSTER_LAYOUTS) {
    const filePath = path.join(rosterDirectory, layout.filename);
    const data = new Uint8Array(await readFile(filePath));
    const document = await getDocument({ data, verbosity: 0 }).promise;
    try {
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageRecords = groupPageRows(content.items, layout);
        for (const record of pageRecords) {
          if (!studentIdentityKey(record)) throw new Error('Roster contains an incomplete student identity row.');
          records.push(record);
        }
      }
    } finally {
      await document.destroy();
    }
  }
  return createStudentMatcher(records);
}