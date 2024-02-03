const express = require('express');
const app = express();
const PORT = process.env.PORT;
const logger = require('./config/logger');
const { setupScheduler } = require('./scheduler');
const { startWorker } = require('./worker');

app.listen(PORT, async function () {
  logger.info('environment: ' + process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'production') {
    await setupScheduler();
    startWorker();
  }
  logger.info(`server listening on port ${PORT}`);
});
