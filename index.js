const express = require('express');
const app = express();
const PORT = process.env.PORT;
const logger = require('./config/logger');
const { setupScheduler } = require('./scheduler');
const { startWorker } = require('./worker');
const { writeCredentialsToFile } = require('./google-auth/config');

app.listen(PORT, async function () {
  logger.info('environment: ' + process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'production') {
    writeCredentialsToFile();
    await setupScheduler();
    startWorker();
  }
  logger.info(`server listening on port ${PORT}`);
});
