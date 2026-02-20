const fs = require('fs');
const path = require('path');
const { DataTypes } = require('sequelize');

const MIGRATIONS_TABLE = 'schema_migrations';

async function ensureMigrationsTable(queryInterface) {
  await queryInterface.createTable(MIGRATIONS_TABLE, {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    applied_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }).catch(() => {});
}

async function getAppliedMigrationNames(queryInterface) {
  const rows = await queryInterface.sequelize.query(
    `SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY id ASC`,
    { type: queryInterface.sequelize.QueryTypes.SELECT },
  );

  return new Set(rows.map((row) => row.name));
}

function loadMigrationFiles() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationOrder = [
    'user_table.js',
    'donor_profile_table.js',
    'plasma_request_table.js',
    'request_status_table.js',
    'plasma_stock_table.js',
    'notification_table.js',
  ];
  const orderIndex = new Map(migrationOrder.map((name, index) => [name, index]));
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.js'))
    .sort();

  return files.map((file) => ({
    name: file,
    migration: require(path.join(migrationsDir, file)),
  }));
}

async function recordMigration(queryInterface, migrationName, transaction) {
  await queryInterface.bulkInsert(
    MIGRATIONS_TABLE,
    [{ name: migrationName, applied_at: new Date() }],
    { transaction },
  );
}

async function runMigrations(sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  await ensureMigrationsTable(queryInterface);

  const applied = await getAppliedMigrationNames(queryInterface);
  const migrations = loadMigrationFiles();

  for (const { name, migration } of migrations) {
    if (applied.has(name)) {
      continue;
    }

    const transaction = await sequelize.transaction();
    try {
      await migration.up(queryInterface, DataTypes, transaction);
      await recordMigration(queryInterface, name, transaction);
      await transaction.commit();
      console.log(`Applied migration: ${name}`);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = {
  runMigrations,
};
