import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../modules/user/user.model.js';

async function run() {
  await connectDB();

  const existing = await User.findOne({ email: 'admin@example.com' });
  if (!existing) {
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const userHash = await bcrypt.hash('User@123', 10);

    await User.create([
      { name: 'Admin', email: 'admin@example.com', passwordHash: adminHash, role: 'ADMIN' },
      { name: 'Alice User', email: 'user@example.com', passwordHash: userHash, role: 'USER' },
    ]);
    console.log('✅ Seeded default admin & user');
  } else {
    console.log('ℹ️ Seed already applied');
  }
  process.exit(0);
}
run();
