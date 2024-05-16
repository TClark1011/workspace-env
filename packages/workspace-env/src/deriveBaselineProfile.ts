import { WorkspaceEnvConfigInput, WorkspaceEnvProfile } from "@/configTypes";
import { DEFAULT_ENV_FILE_PATTERNS } from "@/constants";
import { getLastPathSegment } from "@/utils";

type DeriveBaselineProfileInput = {
  workspacePaths: string[];
  configFileData: WorkspaceEnvConfigInput;
};

export const deriveBaselineProfile = async ({
  workspacePaths,
  configFileData,
}: DeriveBaselineProfileInput): Promise<WorkspaceEnvProfile> => {
  const workspacePathsToSyncTo = configFileData.syncEnvsTo
    ? workspacePaths.filter((workspacePath) =>
        configFileData.syncEnvsTo?.includes(getLastPathSegment(workspacePath)),
      )
    : workspacePaths;

  return {
    envDirectoryPath: configFileData.envDir ?? "./",
    workspacePaths: workspacePathsToSyncTo,
    envFilePatterns:
      configFileData.envFilePatterns ?? DEFAULT_ENV_FILE_PATTERNS,
  };
};
