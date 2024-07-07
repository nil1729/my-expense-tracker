const express = require("express");
const app = express();
const PORT = process.env.PORT;
const logger = require("./config/logger");
const { setupScheduler, setExpenseLastTsKey } = require("./scheduler");
const { startWorker } = require("./worker");
const { writeCredentialsToFile } = require("./google-auth/config");
const { testGetFormResponses } = require("./gcloud-api/forms");

function exitHandler(e) {
  logger.error("uncaught exception: " + e.message);
  console.error(e);
  process.exit(1);
}

process.on("unhandledRejection", exitHandler);
process.on("uncaughtException", exitHandler);

app.listen(PORT, async function () {
  logger.info("environment: " + process.env.NODE_ENV);
  if (process.env.NODE_ENV === "production") {
    writeCredentialsToFile();
    await testGetFormResponses();
    await setupScheduler();
    await setExpenseLastTsKey();
    startWorker();
  }
  logger.info(`server listening on port ${PORT}`);
});

