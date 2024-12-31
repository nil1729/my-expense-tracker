const { Job } = require("bullmq");
const moment = require("moment");
const cronParser = require("cron-parser");
const ExpenseTrackerCache = require("../cache");
const { getFormResponses } = require("../gcloud-api/forms");
const { updateSheet } = require("../gcloud-api/sheets");
const { getQuestionIdColumnMapping } = require("../config/questionColumnMapping");
const logger = require("../config/logger");
const months = require("../config/months");
const EXPENSE_CACHE_LAST_TS_KEY = process.env.EXPENSE_CACHE_LAST_TS_KEY;
const SCHEDULER_CRON_EXP = process.env.SCHEDULER_CRON_EXP;

/**
 *
 * @param {Job} job
 * @returns
 */
async function processJob() {
  logger.info(`running job at time: ${moment().format("DD/MM/YYYY hh:mm:ss A")}`);
  const lastTs = await ExpenseTrackerCache.getCache(EXPENSE_CACHE_LAST_TS_KEY);
  if (isTsValid(lastTs)) {
    logger.info("getting form responses from lastTs: " + lastTs);
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
    showNextRunTime();
    return sortedResponses;
  } else {
    showNextRunTime();
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
  const txnDate = rowValue.TXN_DATE || response.ts;
  const recordDate = rowValue.RECORD_DATE;
  const sheetName = getSheetNameFromDate(recordDate);
  rowValue.DATE = getFormattedDate(txnDate);
  await updateSheet(sheetName, rowValue);
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

function getSheetNameFromDate(dateStr) {
  const date = new Date(dateStr);
  return months[date.getMonth()] + " " + date.getFullYear().toString().substr(2, 2);
}

function getFormattedDate(dateStr) {
  return moment(dateStr).format("DD/MM/YYYY");
}

function showNextRunTime() {
  try {
    const interval = cronParser.parseExpression(SCHEDULER_CRON_EXP);
    const nextRunDate = interval.next().toDate();
    const utcOffset = new Date().getTimezoneOffset();
    const istOffset = 330; // IST offset
    const diff = utcOffset + istOffset;
    nextRunDate.setMinutes(nextRunDate.getMinutes() + diff);
    logger.info(`next run time: ${moment(nextRunDate).format("DD/MM/YYYY hh:mm:ss A")}`);
  } catch (error) {
    logger.error(`error parsing cron expression: ${error.message}`);
  }
}

module.exports = { processJob };
