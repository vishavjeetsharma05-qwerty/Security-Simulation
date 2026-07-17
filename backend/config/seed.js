import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import { connectDB } from './db.js';

async function seed() {
  await connectDB();
  const hashedPassword = await bcrypt.hash('Student@1234', 10);
  const studentExists = await User.findOne({ email: 'student@simulation.com' });
  if (!studentExists) {
    await User.create({
      name: 'Vraj Student',
      email: 'student@simulation.com',
      password: hashedPassword,
      phone: '+15550199',
      bio: 'Enthusiastic Cybersecurity student.',
      role: 'Student',
      isVerified: true
    });
    console.log('[SEED] Student account created: student@simulation.com / Student@1234');
  } else {
    console.log('[SEED] Student account already exists');
  }

  const adminHashedPassword = await bcrypt.hash('Admin@1234', 10);
  const adminExists = await User.findOne({ email: 'admin@simulation.com' });
  if (!adminExists) {
    await User.create({
      name: 'Vraj Admin',
      email: 'admin@simulation.com',
      password: adminHashedPassword,
      phone: '+15550299',
      bio: 'Cybersecurity Laboratory Administrator.',
      role: 'Admin',
      isVerified: true
    });
    console.log('[SEED] Admin account created: admin@simulation.com / Admin@1234');
  } else {
    console.log('[SEED] Admin account already exists');
  }
  process.exit(0);
}

seed().catch(err => {
  console.error('[SEED] Error seeding data:', err);
  process.exit(1);
});
