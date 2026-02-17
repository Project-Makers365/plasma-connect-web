const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const allowedOrigins = env.clientOrigin
  .split(',')
  .map((item) => item.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = typeof origin === 'string' ? origin.replace(/\/$/, '') : origin;
      if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.use('/api', routes);
app.use('/api/v1', routes);

app.use(errorHandler);

module.exports = app;
