const { setupInitialToken } = require("./config");

process.argv[2] === "authorize" && setupInitialToken();
