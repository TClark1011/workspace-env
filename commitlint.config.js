/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const changelogConfig = require("./changelog.config");

module.exports = {
  extends: ["@commitlint/config-conventional"],
  ignores: [(commitMsg) => commitMsg.includes("[skip ci]")],
  scopes: changelogConfig.scopes,
};
