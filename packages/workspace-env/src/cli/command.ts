import { cliOptionsFinalSchema } from "@/configTypes";
import { DEFAULT_CONFIG_FILE_NAME } from "@/constants";
import { deriveBaselineProfile } from "@/deriveBaselineProfile";
import { deriveProfiles } from "@/deriveProfiles";
import { deriveWorkspaceDefinitionFromPath } from "@/deriveWorkspaceDefinitionFromPath";
import { evaluateWorkspaceInputPath } from "@/evaluateWorkspaceInputPath";
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
    const evaluatedWorkspacePaths = await Promise.all(
      workspaces.map(evaluateWorkspaceInputPath),
    ).then((r) => r.flat());

    const workspaceDefinitions = await Promise.all(
      evaluatedWorkspacePaths.map(deriveWorkspaceDefinitionFromPath),
    ).then((r) => r.flat());

    const baselineProfile = await deriveBaselineProfile({
      workspaceDefinitions,
      configFileData,
    });
    const profiles = await deriveProfiles({
      baselineProfile,
      workspaceDefinitions,
      configFileData,
    });

    await Promise.all(profiles.map(runSyncForProfile));
  },
});
