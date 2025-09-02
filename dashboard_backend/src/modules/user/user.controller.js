import { asyncHandler } from '../../utlis/asyncHandler.js';
import { listUsers, findById, paginatedList } from './user.repo.js';
import { z } from 'zod';
import { findByEmail, createUser } from '../user/user.repo.js';
import bcrypt from 'bcryptjs';
import { parseCsv } from './user.upload.js';

export const meController = asyncHandler(async (req, res) => {
  const me = await findById(req.user.sub);
  if (!me) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, ...safe } = me.toObject();
  res.json(safe);
});

// export const listController = asyncHandler(async (req, res) => {
//   const users = await listUsers();
//   res.json(users);
// });

export const listController = asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const data = await paginatedList({ page, limit });
  res.json(data);
});


const CreateUserDTO = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'USER']).default('USER'),
});

export const createController = asyncHandler(async (req, res) => {
  const dto = CreateUserDTO.parse(req.body);

  const exists = await findByEmail(dto.email);
  if (exists) {
    const e = new Error('Email already in use');
    e.status = 409;
    throw e;
  }

  const passwordHash = await bcrypt.hash(dto.password, 10);
  const doc = await createUser({
    name: dto.name,
    email: dto.email,
    passwordHash,
    role: dto.role,
  });

  const { passwordHash: _ph, ...safe } = doc.toObject();
  res.status(201).json(safe);
});

const CsvRowDTO = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'USER']).default('USER'),
});

export const previewUploadController = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file is required' });
  const rows = await parseCsv(req.file.buffer);

  // Validate but collect errors per row
  const preview = [];
  const errors = [];
  rows.forEach((raw, idx) => {
    const parsed = CsvRowDTO.safeParse(raw);
    if (parsed.success) preview.push(parsed.data);
    else errors.push({ index: idx, issues: parsed.error.issues });
  });

  res.json({
    totalRows: rows.length,
    preview: preview.slice(0, 10), // only first 10
    validCount: preview.length,
    errorCount: errors.length,
    sampleErrors: errors.slice(0, 5),
  });
});

export const bulkImportController = asyncHandler(async (req, res) => {
  const BodyDTO = z.object({
    rows: z.array(CsvRowDTO).min(1),
  });
  const dto = BodyDTO.parse(req.body);

  let created = 0;
  const conflicts = [];

  for (const row of dto.rows) {
    const exists = await findByEmail(row.email);
    if (exists) {
      conflicts.push({ email: row.email, reason: 'Email already exists' });
      continue;
    }
    const passwordHash = await bcrypt.hash(row.password, 10);
    await createUser({ ...row, passwordHash });
    created++;
  }

  res.status(201).json({ created, conflicts });
});