const fs = require('fs');
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist() {
  try {
    const content = fs.readFileSync(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  fs.writeFileSync(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function listMajors(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1z76E0l-JhR7dc_PsY2AmcuM442202nuuYpX2j3Juclg',
    range: 'Sheet1!A1:J16',
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  rows.forEach((row) => {
    console.log(row);
    // console.log(`${row[0]}, ${row[4]}`);
  });
}

async function updateSheet(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: '1z76E0l-JhR7dc_PsY2AmcuM442202nuuYpX2j3Juclg',
    range: 'Sheet2!B5:C5',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [['b5', 'c5']],
    },
  });
  console.log(res);
}

async function formFunc(auth) {
  const forms = google.forms({ version: 'v1', auth });

  try {
    // const res = await forms.forms.create({
    //   requestBody: {
    //     info: {
    //       title: 'Quickstart form',
    //     },
    //   },
    // });
    // const res = await forms.forms.responses.list({
    //   formId: '13PFXaC0E5RQ3s_8kCR9wvqQYlkgplVzxsSxamDMag9c',
    //   pageSize: 10,
    //   // pageToken:
    //   // 'AQ47I5sS1bvIF4ai0fCLX5skfEmWzLNUKZe/xbik/Adj2f2tnkT96orYz33Ql5C5QQcC+5lpHesNJDNWp04OKDFnYM5DZDiB9cSN044khJu95+Fs/WKkXhh8IlgRSEsR3hMljw5BJ7U58u8+ctx1ZYDoVHzhu5rfris8QHSWwVGYEB1JtbUrs4taCVTWPV4uDRm0dre9YtMnOhQ08WsBUEguEOwZyiY2LqaF5hi/pXnU/QcyTUWlHgnfkP4U6KK0BsqHksg5zYdDgy+sO+/s',
    //   filter: 'timestamp > 2024-01-02T15:01:23Z',
    // });
    const res = await forms.forms.responses.get({
      formId: '13PFXaC0E5RQ3s_8kCR9wvqQYlkgplVzxsSxamDMag9c',
      responseId: 'ACYDBNjpgoEa1d4Vi4Brr9oDI4TkwVf9Hy4Y_60kpz2PEvFWYD2ziKWg9Ccem9gGaQS3WMo',
    });
    Object.keys(res.data.answers).forEach((q) => {
      console.dir(res.data.answers[q].textAnswers, null);
    });
    // console.dir(, null);
  } catch (error) {
    console.error(error);
  }
}

authorize().then(formFunc).catch(console.error);
