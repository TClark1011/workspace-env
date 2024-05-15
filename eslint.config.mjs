import globals from "globals";
import pluginJs from "@eslint/js";
import tsEslint from "typescript-eslint";

/**
 * @type {import("eslint").Linter.FlatConfig[]}
 */
export default [
  { languageOptions: { globals: globals.node }, files: ["**/*.ts"] },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    files: ["packages/workspace-env/src/**"],
    rules: {
      "no-console": "warn",
    },
  },
];
