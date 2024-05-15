/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

module.exports = {
  extends: [
    "@commitlint/config-conventional",
    "@commitlint/config-lerna-scopes",
  ],
  ignores: [(commitMsg) => commitMsg.includes("[skip ci]")],
};
