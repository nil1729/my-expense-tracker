const { processJob } = require("../runner");

describe("processJob", () => {
  it("should process the job correctly", async (done) => {
    const result = await processJob("");
    // expect an array of responses
    // const expected = [];
    expect(result).toBeArray();
    // return done();
  });
});
