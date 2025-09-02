import { z } from 'zod';
import { asyncHandler } from '../../utlis/asyncHandler.js';
import { login } from './auth.service.js';

const LoginDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginController = asyncHandler(async (req, res) => {
  const dto = LoginDTO.parse(req.body);
  const result = await login(dto);
  res.json(result);
});
