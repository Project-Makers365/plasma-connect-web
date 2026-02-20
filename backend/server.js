const http = require('http');
const app = require('./src/app');
const env = require('./src/config/env');
const { sequelize } = require('./src/models');
const { runMigrations } = require('./db/migrationRunner');
const { initSocket } = require('./src/socket');

async function startServer() {
  try {
    await sequelize.authenticate();
    await runMigrations(sequelize);

    const server = http.createServer(app);
    initSocket(server);

    server.listen(env.port, () => {
      console.log(`Plasma Connect API running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to boot server:', error);
    process.exit(1);
  }
}

startServer();
