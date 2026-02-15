const sequelize = require('../src/config/database');
const { runMigrations } = require('./migrationRunner');

(async () => {
  try {
    await sequelize.authenticate();
    await runMigrations(sequelize);
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
})();
