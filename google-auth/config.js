const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { google } = require("googleapis");
const logger = require("../config/logger");
const GOOGLE_AUTH_CRED = process.env.GOOGLE_AUTH_CRED;
const TOKEN_PATH = path.join(process.cwd(), "google-auth", process.env.GOOGLE_AUTH_TOKEN_FILE);
const CREDENTIALS_PATH = path.join(process.cwd(), "google-auth", process.env.GOOGLE_AUTH_CRED_FILE);

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/forms.body.readonly",
  "https://www.googleapis.com/auth/forms.responses.readonly",
];

function writeCredentialsToFile() {
  try {
    const googleCredFromEnv = JSON.parse(GOOGLE_AUTH_CRED);
    const credJsonContent = JSON.stringify(googleCredFromEnv);
    fs.writeFileSync(CREDENTIALS_PATH, credJsonContent);
    logger.info("google api credentials written to file");
  } catch (error) { }
}

function getAuthClient() {
  return new google.auth.JWT({ keyFile: CREDENTIALS_PATH, scopes: SCOPES })
}

/**
 * 
 * @deprecated
 * 
 */
function removeExistingToken() {
  try {
    fs.unlinkSync(TOKEN_PATH);
  } catch (err) {
    logger.error(err.message);
  }
}

/**
 * 
 * @deprecated
 * 
 */
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

/**
 * 
 * @deprecated
 * 
 */
function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  if (fs.existsSync(TOKEN_PATH)) {
    const tokenJson = fs.readFileSync(TOKEN_PATH);
    const parsedToken = JSON.parse(tokenJson);
    oAuth2Client.setCredentials(parsedToken);
    return oAuth2Client;
  } else {
    return getNewToken(oAuth2Client);
  }
}

/**
 * 
 * @deprecated
 * 
 */
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

module.exports = { writeCredentialsToFile, getAuthClient, setupInitialToken };
