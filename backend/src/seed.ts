/**
 * Seed Script — creates one user for each role in the system.
 * Run: npm run seed
 *
 * ⚠ This will not overwrite existing users.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import UserRepo from './models/UserRepo';
import { UserRole } from './types';

interface SeedUser {
  email: string;
  password: string;
  role: UserRole;
}

const SEED_USERS: SeedUser[] = [
  { email: 'admin@lms.com',       password: 'Admin@123',       role: 'ADMIN' },
  { email: 'sales@lms.com',       password: 'Sales@123',       role: 'SALES' },
  { email: 'sanction@lms.com',    password: 'Sanction@123',    role: 'SANCTION' },
  { email: 'disburse@lms.com',    password: 'Disburse@123',    role: 'DISBURSEMENT' },
  { email: 'collection@lms.com',  password: 'Collect@123',     role: 'COLLECTION' },
];

const seed = async () => {
  console.log('\n🌱 Starting seed for DynamoDB...\n');

  for (const seedUser of SEED_USERS) {
    const exists = await UserRepo.findByEmail(seedUser.email);
    if (exists) {
      console.log(`⏭  Skipped  → ${seedUser.email} (already exists)`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(seedUser.password, 12);
    await UserRepo.create({
      email: seedUser.email,
      password: hashedPassword,
      role: seedUser.role,
      profileStatus: 'REGISTERED',
    });
    console.log(`✅ Created  → ${seedUser.email} [${seedUser.role}]`);
  }

  console.log('\n✨ Seed complete!\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
