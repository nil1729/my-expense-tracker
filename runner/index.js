const { Job } = require("bullmq");
const ExpenseTrackerCache = require("../cache");
const { getFormResponses } = require("../gcloud-api/forms");
const { getQuestionIdColumnMapping } = require("../config/questionColumnMapping");
const logger = require("../config/logger");
const EXPENSE_CACHE_LAST_TS_KEY = process.env.EXPENSE_CACHE_LAST_TS_KEY;

/**
 *
 * @param {Job} job
 * @returns
 */
async function processJob(job) {
  const lastTs = await ExpenseTrackerCache.getCache(EXPENSE_CACHE_LAST_TS_KEY);
  if (isTsValid(lastTs)) {
    logger.info("getting form responses from lastTs", lastTs);
    const responses = await getFormResponses(lastTs);
    const sortedResponses = sortResponses(responses);
    if (responses.length > 0) {
      for (const response of sortedResponses) {
        await processResponse(response);
      }
      const newLastTs = sortedResponses[sortedResponses.length - 1].ts;
      logger.info(`setting new lastTs ${newLastTs}`);
      await ExpenseTrackerCache.setCache(
        EXPENSE_CACHE_LAST_TS_KEY,
        new Date(newLastTs).toISOString()
      );
    }
  } else {
    return null;
  }
}

async function processResponse(response) {
  logger.info(`processing response ${response.id}`);
  const isProcessed = await ExpenseTrackerCache.getCache(response.id);
  if (isProcessed) {
    logger.info("response already processed", response.id);
    return;
  }
  const { questions, columns } = getQuestionIdColumnMapping();
  const rowValue = {};
  for (const [key, value] of Object.entries(questions)) {
    if (value.length > 0) {
      rowValue[columns[key]] = response.answers[value];
    }
  }
  console.log(rowValue);
  await ExpenseTrackerCache.setCache(response.id, "PROCESSED", true);
}

function sortResponses(responses) {
  return responses.sort((a, b) => {
    return new Date(a.ts) - new Date(b.ts);
  });
}

function isTsValid(ts) {
  if (typeof ts !== "string") {
    logger.error("ts is not a string");
    return false;
  }
  if (new Date(ts).toISOString() !== ts) {
    logger.error("ts is not a valid date");
    return false;
  }
  return true;
}

module.exports = { processJob };
