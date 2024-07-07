const { google } = require("googleapis");
const googleAuth = require("../../google-auth");
const logger = require("../../config/logger");
const GOOGLE_FORM_ID = process.env.GOOGLE_FORM_ID;
const DEFAULT_PAGE_SIZE = 25;

async function getFormResponsesFilteredByTimestamp(lastTs, pageSize = DEFAULT_PAGE_SIZE) {
  const auth = googleAuth();
  const forms = google.forms({ version: "v1", auth });
  const result = await forms.forms.responses.list({
    formId: GOOGLE_FORM_ID,
    pageSize: pageSize,
    filter: `timestamp >= ${lastTs}`,
  });
  const responses = [];
  result.data?.responses?.forEach((result) => {
    const response = {
      id: result.responseId,
      ts: result.lastSubmittedTime,
    };
    const answers = {};
    Object.keys(result.answers).forEach((key) => {
      // only single text answers are supported
      const questionId = result.answers[key].questionId;
      const value = result.answers[key].textAnswers.answers[0].value;
      answers[questionId] = value;
    });
    response.answers = answers;
    responses.push(response);
  });
  return responses;
}

async function getFormResponses(lastTs) {
  try {
    return getFormResponsesFilteredByTimestamp(lastTs);
  } catch (error) {
    logger.error(`error in getFormResponses: ${error.message}`);
    console.error(error);
    return [];
  }
}

async function testGetFormResponses() {
  const currentTs = new Date().toISOString();
  logger.info(`testing getFormResponses with currentTs: ${currentTs}`);
  await getFormResponsesFilteredByTimestamp(currentTs, 1);
  logger.info("getFormResponses test passed");
}

module.exports = { getFormResponses, testGetFormResponses };
