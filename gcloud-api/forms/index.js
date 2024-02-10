const { google } = require("googleapis");
const googleAuth = require("../../google-auth");
const logger = require("../../config/logger");
const GOOGLE_FORM_ID = process.env.GOOGLE_FORM_ID;

async function getFormResponses(lastTs) {
  try {
    const auth = await googleAuth();
    const forms = google.forms({ version: "v1", auth });
    const result = await forms.forms.responses.list({
      formId: GOOGLE_FORM_ID,
      pageSize: 25,
      filter: `timestamp > ${lastTs}`,
    });
    const responses = [];
    result.data.responses.forEach((result) => {
      const response = {
        id: result.responseId,
        ts: result.lastSubmittedTime,
      };
      const answers = [];
      Object.keys(result.answers).forEach((key) => {
        const answer = {
          questionId: result.answers[key].questionId,
          // only single text answers are supported
          textAnswers: result.answers[key].textAnswers.answers[0].value,
        };
        answers.push(answer);
      });
      response.answers = answers;
      responses.push(response);
    });
    return responses;
  } catch (error) {
    logger.error(`error in getFormResponses: ${error.message}`);
    console.error(error);
    return [];
  }
}

module.exports = { getFormResponses };
