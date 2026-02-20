const bcrypt = require('bcrypt');
const { sequelize, User } = require('../models');
const { ROLES } = require('../constants');
const { runMigrations } = require('../../db/migrationRunner');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function seedAdmin() {
  const enabled = String(process.env.ADMIN_SEED_ENABLED ?? 'true').toLowerCase() !== 'false';
  if (!enabled) {
    console.log('Admin seeder skipped (ADMIN_SEED_ENABLED=false)');
    return;
  }

  const email = normalizeEmail(process.env.ADMIN_SEED_EMAIL || 'admin@plasma.local');
  const password = String(process.env.ADMIN_SEED_PASSWORD || 'Admin@123');
  const name = String(process.env.ADMIN_SEED_NAME || 'System Admin').trim() || 'System Admin';
  const phone = String(process.env.ADMIN_SEED_PHONE || '9999999999').trim() || '9999999999';

  await sequelize.authenticate();
  await runMigrations(sequelize);

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log(`Admin seeder: user already exists (${email})`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role: ROLES.ADMIN,
  });

  console.log(`Admin seeder: created admin (${email})`);
}

if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Admin seeder failed:', error.message);
      process.exit(1);
    });
}

module.exports = seedAdmin;
