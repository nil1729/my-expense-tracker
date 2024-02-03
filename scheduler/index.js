const { Queue } = require('bullmq');
const logger = require('../config/logger');
const { connection } = require('../config/bullmq');
const JOB_NAME = process.env.SCHEDULER_JOB;
const QUEUE_NAME = process.env.SCHEDULER_QUEUE;
const SCHEDULER_CRON_EXP = process.env.SCHEDULER_CRON_EXP;

const exepenseTrackerQueue = new Queue(QUEUE_NAME, {
  connection: connection,
});

async function setupScheduler() {
  try {
    const ack = await exepenseTrackerQueue.add(JOB_NAME, null, {
      repeat: {
        pattern: SCHEDULER_CRON_EXP,
      },
    });
    logger.info(`job scheduled with id: ${ack.id}`);
  } catch (error) {
    logger.error(`error scheduling job: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { setupScheduler };
