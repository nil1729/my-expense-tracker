const fs = require("fs");
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

async function updateSheet(auth) {
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: "1z76E0l-JhR7dc_PsY2AmcuM442202nuuYpX2j3Juclg",
    range: "Sheet2!B5:C5",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [["b5", "c5"]],
    },
  });
  console.log(res);
}
