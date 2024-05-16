import {
  WorkspaceEnvConfigInput,
  workspaceEnvConfigInputSchema,
} from "@/configTypes";
import fs from "fs/promises";

export const readConfigFile = async (
  configFilePath: string,
): Promise<WorkspaceEnvConfigInput> => {
  const rawConfigFileContents = await fs
    .readFile(configFilePath, "utf8")
    .catch(() => "{}");

  const configFileData = workspaceEnvConfigInputSchema.parse(
    JSON.parse(rawConfigFileContents),
  );

  return configFileData;
};
