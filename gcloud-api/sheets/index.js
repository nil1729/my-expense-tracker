const { google } = require("googleapis");
const googleAuth = require("../../google-auth");
const logger = require("../../config/logger");
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SHEET_START_ROW = process.env.GOOGLE_SHEET_START_ROW;
const GOOGLE_SHEET_END_ROW = process.env.GOOGLE_SHEET_END_ROW;
const GOOGLE_SHEET_START_COLUMN = process.env.GOOGLE_SHEET_START_COLUMN;
const GOOGLE_SHEET_END_COLUMN = process.env.GOOGLE_SHEET_END_COLUMN;

async function updateSheet(sheetName, data) {
  try {
    const auth = googleAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const emptyRowIdx = await getFirstEmptyRowIdx(sheetName);
    logger.info(`updating sheet ${sheetName} at row ${emptyRowIdx}`);
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${sheetName}!${GOOGLE_SHEET_START_COLUMN}${emptyRowIdx}:${GOOGLE_SHEET_END_COLUMN}${emptyRowIdx}`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[data.DATE, data.CATEGORY, data.SUB_CATEGORY, data.NOTES, data.BANK, data.AMOUNT]],
      },
    });
    logger.info(
      `updated sheet ${sheetName} at row ${emptyRowIdx}: ${JSON.stringify(response.data)}`
    );
  } catch (error) {
    logger.error(`error in updateSheet: ${error.message}`);
    console.log(error);
  }
}

async function getFirstEmptyRowIdx(sheetName) {
  const auth = googleAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${sheetName}!${GOOGLE_SHEET_START_COLUMN}${GOOGLE_SHEET_START_ROW}:${GOOGLE_SHEET_START_COLUMN}${GOOGLE_SHEET_END_ROW}`,
  });
  if (res.data.values) {
    return res.data.values.length + Number(GOOGLE_SHEET_START_ROW);
  }
  throw new Error("sheet not configured properly, no data found in sheet");
}

module.exports = { updateSheet };
