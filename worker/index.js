const { Worker } = require("bullmq");
const QUEUE_NAME = process.env.SCHEDULER_QUEUE;
const { connection } = require("../config/bullmq");
const { processJob } = require("../runner");
const logger = require("../config/logger");

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    logger.info(`processing job ${job.id} of type ${job.name}`);
    await processJob(job);
    logger.info(`job ${job.id} of type ${job.name} processed`);
  },
  { autorun: false, connection: connection }
);

function startWorker() {
  worker.run();
}

module.exports = { startWorker };
