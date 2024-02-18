const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { google } = require("googleapis");
const logger = require("../config/logger");
const GOOGLE_AUTH_CRED = process.env.GOOGLE_AUTH_CRED;
const GOOGLE_AUTH_TOKEN = process.env.GOOGLE_AUTH_TOKEN;
const TOKEN_PATH = path.join(process.cwd(), "google-auth", process.env.GOOGLE_AUTH_TOKEN_FILE);
const CREDENTIALS_PATH = path.join(process.cwd(), "google-auth", process.env.GOOGLE_AUTH_CRED_FILE);

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/forms.body.readonly",
  "https://www.googleapis.com/auth/forms.responses.readonly",
];

function loadSavedCredentialsIfExist() {
  if (fs.existsSync(TOKEN_PATH)) {
    const content = fs.readFileSync(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } else {
    logger.warn("no saved credentials found");
    return null;
  }
}

function saveCredentials(client) {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  fs.writeFileSync(TOKEN_PATH, payload);
}

function writeCredentialsToFile() {
  try {
    const googleCredFromEnv = JSON.parse(GOOGLE_AUTH_CRED);
    const credJsonContent = JSON.stringify(googleCredFromEnv);
    fs.writeFileSync(CREDENTIALS_PATH, credJsonContent);
    logger.info("google api credentials written to file");
  } catch (error) {}
  try {
    const googleTokenFromEnv = JSON.parse(GOOGLE_AUTH_TOKEN);
    const tokenJsonContent = JSON.stringify(googleTokenFromEnv);
    fs.writeFileSync(TOKEN_PATH, tokenJsonContent);
    logger.info("google auth token written to file");
  } catch (error) {}
}

function removeExistingToken() {
  try {
    fs.unlinkSync(TOKEN_PATH);
  } catch (err) {
    logger.error(err.message);
  }
}

function setupInitialToken() {
  try {
    writeCredentialsToFile();
    removeExistingToken();
    const content = fs.readFileSync(CREDENTIALS_PATH);
    authorize(JSON.parse(content));
  } catch (error) {
    logger.error(error.message);
  }
}

async function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } else {
    return getNewToken(oAuth2Client);
  }
}

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    include_granted_scopes: true,
  });
  logger.info(`authorize this app by opening this url: ${authUrl}`);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("enter the code from the callback url: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        logger.error(`error while trying to retrieve access token: ${err.message}`);
        console.error(err);
        return;
      }
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      logger.info(`access token saved to ${TOKEN_PATH}`);
      logger.info("authorization completed");
    });
  });
}

function getAuthClient() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  return authorize(credentials);
}

module.exports = { writeCredentialsToFile, getAuthClient, setupInitialToken };
