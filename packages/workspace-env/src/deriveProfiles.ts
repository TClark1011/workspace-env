import fs from "fs/promises";
import {
  CLIOptionsFinal,
  DEFAULT_CLI_OPTIONS_FINAL,
  WorkspaceEnvProfile,
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

export const deriveProfiles = async ({
  configFilePath,
}: CLIOptionsFinal = DEFAULT_CLI_OPTIONS_FINAL): Promise<
  WorkspaceEnvProfile[]
> => {
  const rawConfigFileContents = await fs
    .readFile(configFilePath, "utf8")
    .catch(() => "{}");

  const configFileData = workspaceEnvConfigInputSchema.parse(
    JSON.parse(rawConfigFileContents),
  );

  const workspaces = await readWorkspacesFromProject();

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

  const workspacePathsToSyncTo = configFileData.syncEnvsTo
    ? workspacePaths.filter((workspacePath) =>
        configFileData.syncEnvsTo?.includes(getLastPathSegment(workspacePath)),
      )
    : workspacePaths;

  const baseProfile: WorkspaceEnvProfile = {
    envDirectoryPath: configFileData.envDir ?? "./",
    workspacePaths: workspacePathsToSyncTo,
    envFilePatterns:
      configFileData.envFilePatterns ?? DEFAULT_ENV_FILE_PATTERNS,
  };

  if (!configFileData.profiles) {
    return [baseProfile];
  }

  configFileData.profiles.forEach((profile) => {
    const invalidWorkspaceName = profile.workspaces.find((workspaceName) => {
      const workspaceIsValid = workspacePaths.some((workspacePath) =>
        workspacePath.endsWith(workspaceName),
      );
      return !workspaceIsValid;
    });

    if (invalidWorkspaceName) {
      throw new Error(`Invalid workspace name: "${invalidWorkspaceName}"`);
    }
  });

  return configFileData.profiles.map((profile) => ({
    envDirectoryPath: profile.envDir ?? baseProfile.envDirectoryPath,
    workspacePaths: workspacePaths.filter((workspacePath) =>
      profile.workspaces.includes(getLastPathSegment(workspacePath)),
    ),
    envFilePatterns: profile.envFilePatterns ?? baseProfile.envFilePatterns,
  }));
};
