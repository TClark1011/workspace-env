import { cliOptionsFinalSchema } from "@/configTypes";
import { DEFAULT_CONFIG_FILE_NAME } from "@/constants";
import { deriveBaselineProfile } from "@/deriveBaselineProfile";
import { deriveProfiles } from "@/deriveProfiles";
import { deriveWorkspacePaths } from "@/deriveWorkspacePaths";
import { readConfigFile } from "@/readConfigFile";
import { readWorkspacesFromConfigs } from "@/readWorkspacesFromConfigs";
import { runSyncForProfile } from "@/runSyncForProfile";
import { guidedParse } from "@/utils";
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
  handler: async (rawCliArgs) => {
    const { configFilePath } = guidedParse(cliOptionsFinalSchema, {
      configFilePath: rawCliArgs.configFilePath,
      inWatchMode: rawCliArgs.inWatchMode,
    });

    const configFileData = await readConfigFile(configFilePath);
    const workspaces = await readWorkspacesFromConfigs();
    const workspacePaths = await deriveWorkspacePaths(workspaces);
    const baselineProfile = await deriveBaselineProfile({
      workspacePaths,
      configFileData,
    });
    const profiles = await deriveProfiles({
      baselineProfile,
      workspacePaths,
      configFileData,
    });

    await Promise.all(profiles.map(runSyncForProfile));
  },
});
