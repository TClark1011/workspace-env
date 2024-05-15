import fs from "fs/promises";
import {
  CLIOptionsFinal,
  DEFAULT_CLI_OPTIONS_FINAL,
  ProgramState,
  programStateSchema,
  workspaceEnvConfigInputSchema,
} from "@/configTypes";
import YAML from "yaml";
import z from "zod";
import { glob } from "glob";
import { DEFAULT_ENV_FILE_PATTERNS } from "@/constants";

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
    .catch(() => "{}");
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

export const deriveProgramState = async ({
  configFilePath,
}: CLIOptionsFinal = DEFAULT_CLI_OPTIONS_FINAL): Promise<ProgramState> => {
  const rawConfigFileContents = await fs
    .readFile(configFilePath, "utf8")
    .catch(() => "{}");

  const untypedConfigData = JSON.parse(rawConfigFileContents);
  const configData = workspaceEnvConfigInputSchema.parse(untypedConfigData);

  const workspaces =
    configData.workspaces ?? (await readWorkspacesFromProject());

  const workspacePaths = await Promise.all(
    workspaces.map(async (pathGlobPattern) => {
      const paths = await glob(pathGlobPattern, {
        nodir: false,
      });

      if (paths.length === 0) {
        throw new Error(`No workspaces found for pattern: ${pathGlobPattern}`);
      }

      return paths;
    }),
  ).then((paths) => paths.flat());

  if (workspacePaths.length === 0) {
    throw new Error("No workspaces found");
  }

  const workspaceDirectoryNames = workspacePaths.map(getLastPathSegment);

  const outputData: ProgramState = {
    envDirectoryPath: configData.envDir ?? "./",
    workspacePaths,
    envFilePatterns: configData.envFilePatterns ?? DEFAULT_ENV_FILE_PATTERNS,
    syncEnvsToWorkspaceDirectoryNames:
      configData.syncEnvsTo ?? workspaceDirectoryNames,
  };

  return programStateSchema.parse(outputData);
};
