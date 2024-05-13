import fs from "fs/promises";
import {
  WorkspaceEnvFinalConfig,
  workspaceEnvConfigInputSchema,
  workspaceEnvFinalConfigSchema,
} from "./configTypes";
import YAML from "yaml";
import z from "zod";
import { CONFIG_FILE_NAME } from "./constants";
import { customGlob } from "$glob";

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

const getLastPathSegment = (path: string): string => {
  const pathSegments = path.split("/");
  const lastSegment = pathSegments[pathSegments.length - 1];

  if (!lastSegment) {
    return path;
  }

  return lastSegment;
};

export const readConfig = async (): Promise<WorkspaceEnvFinalConfig> => {
  const rawConfigFileContents = await fs.readFile(CONFIG_FILE_NAME, "utf8");
  const untypedConfigData = JSON.parse(rawConfigFileContents);
  const configData = workspaceEnvConfigInputSchema.parse(untypedConfigData);

  const workspaces =
    configData.workspaces ?? (await readWorkspacesFromProject());

  const workspacePaths = await Promise.all(
    workspaces.map((pathGlobPattern) =>
      customGlob(pathGlobPattern, {
        nodir: false,
      }).then((paths) => {
        if (paths.length === 0) {
          throw new Error(
            `No workspaces found for pattern: ${pathGlobPattern}`,
          );
        }
        return paths;
      }),
    ),
  ).then((paths) => paths.flat());

  if (workspacePaths.length === 0) {
    throw new Error("No workspaces found");
  }

  const workspaceNames = workspacePaths.map(getLastPathSegment);

  const outputData: WorkspaceEnvFinalConfig = {
    workspaces: new Set(workspacePaths),
    envDir: configData.envDir ?? "./",
    syncEnvsTo: new Set(configData.syncEnvsTo ?? workspaceNames),
  };

  return workspaceEnvFinalConfigSchema.parse(outputData);
};
