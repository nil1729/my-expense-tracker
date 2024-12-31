const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const { writeCredentialsToFile } = require("../google-auth/config");
const { testGetFormResponses } = require("../gcloud-api/forms");
const { processJob } = require("../runner");

describe("processJob", () => {
  it("should process the job correctly", async (done) => {
    writeCredentialsToFile();
    await testGetFormResponses();
    const result = await processJob("");
    expect(result).toBeArray();
    return done();
  });
});
