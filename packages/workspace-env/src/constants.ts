import { EnvFileMergeBehaviour } from "@/configTypes";

export const DEFAULT_CONFIG_FILE_NAME = "workspace-env.json";

export const DEFAULT_ENV_FILE_PATTERNS = [
  ".env",
  "*.env",
  ".env.*",
  "*.*.env",
  "*.env.*",
  ".env.*.*",
];

export const DEFAULT_FILE_MERGE_BEHAVIOUR =
  "append" satisfies EnvFileMergeBehaviour;
// use "satisfies" so I can check the value quickly in IDE by
// hovering over the variable name
