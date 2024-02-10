const { Job } = require("bullmq");
const ExpenseTrackerCache = require("../cache");

/**
 *
 * @param {Job} job
 * @returns
 */
async function processJob(job) {
  // get last_ts from redis
  // get last_process_response from redis
  // get all response from last_ts to now
  // process all response
  // save last_ts to redis
  // save last_process_response to redis
}

module.exports = { processJob };
