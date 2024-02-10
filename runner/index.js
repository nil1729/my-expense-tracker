const { Job } = require("bullmq");
const ExpenseTrackerCache = require("../cache");
const { getFormResponses } = require("../gcloud-api/forms");
const EXPENSE_CACHE_LAST_TS_KEY = process.env.EXPENSE_CACHE_LAST_TS_KEY;
const EXPENSE_CACHE_LAST_PROCESSED_KEY = process.env.EXPENSE_CACHE_LAST_PROCESSED_KEY;

/**
 *
 * @param {Job} job
 * @returns
 */
async function processJob(job) {
  const lastTs = await ExpenseTrackerCache.getCache(EXPENSE_CACHE_LAST_TS_KEY);
  const lastProcessedResponseId = await ExpenseTrackerCache.getCache(
    EXPENSE_CACHE_LAST_PROCESSED_KEY
  );
  console.log("lastTs", lastTs);
  console.log("lastProcessedResponseId", lastProcessedResponseId);
  if (isTsValid(lastTs)) {
    const responses = await getFormResponses(lastTs);
    console.log(responses);
  }
  // process all response
  // save last_ts to redis
  // save last_process_response to redis
}

function isTsValid(ts) {
  if (isNaN(ts)) {
    return false;
  }
  if (new Date(ts).toISOString() !== ts) {
    return false;
  }
  return true;
}

module.exports = { processJob };
