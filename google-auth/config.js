const fs = require('fs');
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const logger = require('../config/logger');
const GOOGLE_AUTH_CRED = process.env.GOOGLE_AUTH_CRED;
const GOOGLE_AUTH_TOKEN = process.env.GOOGLE_AUTH_TOKEN;
const TOKEN_PATH = path.join(process.cwd(), 'google-auth', process.env.GOOGLE_AUTH_TOKEN_FILE);
const CREDENTIALS_PATH = path.join(process.cwd(), 'google-auth', process.env.GOOGLE_AUTH_CRED_FILE);

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly',
];

function loadSavedCredentialsIfExist() {
  if (fs.existsSync(TOKEN_PATH)) {
    const content = fs.readFileSync(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } else {
    logger.warn('no saved credentials found');
    return null;
  }
}

function saveCredentials(client) {
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

function writeCredentialsToFile() {
  const googleCredFromEnv = JSON.parse(GOOGLE_AUTH_CRED);
  const googleTokenFromEnv = JSON.parse(GOOGLE_AUTH_TOKEN);
  const credJsonContent = JSON.stringify(googleCredFromEnv);
  const tokenJsonContent = JSON.stringify(googleTokenFromEnv);
  fs.writeFileSync(CREDENTIALS_PATH, credJsonContent);
  logger.info('google api credentials written to file');
  fs.writeFileSync(TOKEN_PATH, tokenJsonContent);
  logger.info('google auth token written to file');
}

async function authorize() {
  try {
    let client = loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      saveCredentials(client);
    }
    return client;
  } catch (error) {
    logger.error(error.message);
    return null;
  }
}

module.exports = { writeCredentialsToFile, authorize };
