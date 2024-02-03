const { Worker } = require('bullmq');
const QUEUE_NAME = process.env.SCHEDULER_QUEUE;
const { connection } = require('../config/bullmq');

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.dir(job, null);
    return 'some value';
  },
  { autorun: false, connection: connection }
);

function startWorker() {
  worker.run();
}

module.exports = { startWorker };
