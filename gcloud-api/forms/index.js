const { google } = require("googleapis");
const googleAuth = require("../../google-auth");
const logger = require("../../config/logger");
const GOOGLE_FORM_ID = process.env.GOOGLE_FORM_ID;

async function getFormResponses(lastTs) {
  try {
    const auth = await googleAuth();
    const forms = google.forms({ version: "v1", auth });
    const res = await forms.forms.responses.list({
      formId: GOOGLE_FORM_ID,
      pageSize: 25,
      filter: `timestamp > ${lastTs}`,
    });
    Object.keys(res.data.answers).forEach((q) => {
      console.dir(res.data.answers[q].textAnswers, null);
    });
    return [];
  } catch (error) {
    logger.error(`error in getFormResponses: ${error.message}`);
    console.error(error);
    return [];
  }
}

module.exports = { getFormResponses };
