const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const allowedOrigins = env.clientOrigin.split(',').map((item) => item.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
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
