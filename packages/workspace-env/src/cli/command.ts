import { DEFAULT_CONFIG_FILE_NAME } from "@/constants";
import { syncEnvs } from "@/syncEnvs";
import * as cmd from "cmd-ts";

export const theCommand = cmd.command({
  name: "workspace-env",
  description: "Sync env variables between monorepo workspaces",
  version: "0.0.1",
  args: {
    inWatchMode: cmd.flag({
      long: "watch",
      short: "w",
      description: "Watch for changes in the workspace",
      defaultValue: () => false,
      type: cmd.boolean,
    }),
    configFilePath: cmd.option({
      long: "config",
      short: "c",
      description: "Path to the configuration file",
      defaultValue: () => DEFAULT_CONFIG_FILE_NAME,
      type: cmd.string,
    }),
  },
  handler: async (cliArgs) => {
    await syncEnvs(cliArgs);
  },
});
