/**
 * Docker startup script with robust error handling
 * Runs migrations and seeder before starting the server
 */

const seedAdmin = require('./src/seeders/adminSeeder');
const { sequelize } = require('./src/models');

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

async function waitForDatabase(retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✓ Database connection established');
      return true;
    } catch (error) {
      if (i === retries - 1) {
        throw new Error(`Failed to connect to database after ${retries} attempts: ${error.message}`);
      }
      console.log(`⚠ Database connection failed (attempt ${i + 1}/${retries}), retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

async function runStartup() {
  try {
    console.log('🚀 Starting Plasma Connect backend...');

    // Wait for database to be ready
    console.log('⏳ Waiting for database...');
    await waitForDatabase();

    // Run migrations
    console.log('🔄 Running migrations...');
    const { runMigrations } = require('./db/migrationRunner');
    await runMigrations(sequelize);
    console.log('✓ Migrations completed');

    // Seed admin user
    console.log('👤 Seeding admin user...');
    await seedAdmin();
    console.log('✓ Admin seeding completed');

    // Start the server
    console.log('🎯 Starting HTTP server...');
    const http = require('http');
    const app = require('./src/app');
    const env = require('./src/config/env');
    const { initSocket } = require('./src/socket');

    const server = http.createServer(app);
    initSocket(server);

    server.listen(env.port, () => {
      console.log(`✓ Plasma Connect API running on port ${env.port}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('⚠ SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await sequelize.close();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runStartup();

