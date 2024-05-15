/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const fs = require("fs");

const packages = fs.readdirSync("packages");
module.exports = {
  scopes: ["monorepo", ...packages],
};
