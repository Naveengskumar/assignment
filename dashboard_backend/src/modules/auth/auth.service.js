import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findByEmail } from '../user/user.repo.js';
import { config } from '../../config/env.js';

export async function login({ email, password }) {
  const user = await findByEmail(email);
  if (!user) {
    const e = new Error('Invalid credentials');
    e.status = 401;
    throw e;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const e = new Error('Invalid credentials');
    e.status = 401;
    throw e;
  }

  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}
