const { authorize, writeCredentialsToFile } = require("./config");

function setup() {
  writeCredentialsToFile();
  authorize();
}

process.argv[2] === "authorize" && setup();
