const { Queue } = require("bullmq");
const logger = require("../config/logger");
const { connection } = require("../config/bullmq");
const ExpenseTrackerCache = require("../cache");
const JOB_NAME = process.env.SCHEDULER_JOB;
const QUEUE_NAME = process.env.SCHEDULER_QUEUE;
const SCHEDULER_CRON_EXP = process.env.SCHEDULER_CRON_EXP;
const EXPENSE_CACHE_LAST_TS_KEY = process.env.EXPENSE_CACHE_LAST_TS_KEY;
const EXPENSE_CACHE_LAST_TS_DEFAULT_VALUE = process.env.EXPENSE_CACHE_LAST_TS_DEFAULT_VALUE;

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

async function setExpenseLastTsKey() {
  const lastTs = await ExpenseTrackerCache.getCache(EXPENSE_CACHE_LAST_TS_KEY);
  if (!lastTs) {
    await ExpenseTrackerCache.setCache(
      EXPENSE_CACHE_LAST_TS_KEY,
      EXPENSE_CACHE_LAST_TS_DEFAULT_VALUE
    );
    logger.info(`setting lastTs key with default value: ${EXPENSE_CACHE_LAST_TS_DEFAULT_VALUE}`);
  }
}

module.exports = { setupScheduler, setExpenseLastTsKey };
