import fs from "fs/promises";
import {
  WorkspaceEnvFinalConfig,
  workspaceEnvConfigInputSchema,
} from "./configTypes";
import YAML from "yaml";
import z from "zod";
import { CONFIG_FILE_NAME } from "./constants";

const pmpmWorkspacesDataSchema = z.object({
  packages: z.array(z.string()).optional(),
});

const readPnpmWorkspaces = async (): Promise<string[] | undefined> => {
  const rawPnpmWorkspacesFileContent = await fs
    .readFile("pnpm-workspace.yaml", "utf8")
    .catch(() => YAML.stringify({}));
  const untypedPnpmWorkspacesFileData = YAML.parse(
    rawPnpmWorkspacesFileContent,
  );
  const typedData = pmpmWorkspacesDataSchema.parse(
    untypedPnpmWorkspacesFileData,
  );

  return typedData.packages;
};

const neededPackageJsonDataSchema = z.object({
  workspaces: z.array(z.string()).optional(),
});

const readPackageWorkspaces = async (): Promise<string[] | undefined> => {
  const rawPackageJsonFileContent = await fs
    .readFile("package.json", "utf8")
    .catch(() => JSON.stringify({}));
  const untypedPackageJsonData = JSON.parse(rawPackageJsonFileContent);
  const packageJsonData = neededPackageJsonDataSchema.parse(
    untypedPackageJsonData,
  );

  return packageJsonData.workspaces;
};

const readWorkspacesFromProject = async (): Promise<string[]> => {
  const result =
    (await readPackageWorkspaces()) ?? (await readPnpmWorkspaces());

  if (result === undefined) {
    throw new Error("No workspaces found");
  }

  return result;
};

export const readConfig = async (): Promise<WorkspaceEnvFinalConfig> => {
  const rawConfigFileContents = await fs.readFile(CONFIG_FILE_NAME, "utf8");
  const untypedConfigData = JSON.parse(rawConfigFileContents);
  const configData = workspaceEnvConfigInputSchema.parse(untypedConfigData);

  const workspaces =
    configData.workspaces ?? (await readWorkspacesFromProject());

  return {
    workspaces,
    envDir: configData.envDir ?? "./",
    syncEnvsTo: configData.syncEnvsTo ?? workspaces,
  };
};
