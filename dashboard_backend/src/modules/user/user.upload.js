import multer from 'multer';
import { parse } from 'csv-parse';

export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

export function parseCsv(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];
    parse(buffer, { columns: true, trim: true, skip_empty_lines: true })
      .on('data', (r) => rows.push(r))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}
