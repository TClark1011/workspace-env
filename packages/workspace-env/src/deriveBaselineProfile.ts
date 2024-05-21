import {
  WorkspaceDefinition,
  WorkspaceEnvConfigInput,
  WorkspaceEnvProfile,
} from "@/configTypes";
import {
  DEFAULT_ENV_FILE_PATTERNS,
  DEFAULT_FILE_MERGE_BEHAVIOUR,
} from "@/constants";

type DeriveBaselineProfileInput = {
  workspaceDefinitions: WorkspaceDefinition[];
  configFileData: WorkspaceEnvConfigInput;
};

export const deriveBaselineProfile = async ({
  workspaceDefinitions,
  configFileData,
}: DeriveBaselineProfileInput): Promise<WorkspaceEnvProfile> => {
  const workspacesToSyncTo = configFileData.syncEnvsTo
    ? workspaceDefinitions.filter((workspaceDefinition) =>
        configFileData.syncEnvsTo?.includes(workspaceDefinition.name),
      )
    : workspaceDefinitions;

  return {
    envDirectoryPath: configFileData.envDir ?? "./",
    workspaceDefinitions: workspacesToSyncTo,
    envFilePatterns:
      configFileData.envFilePatterns ?? DEFAULT_ENV_FILE_PATTERNS,
    mergeBehaviour:
      configFileData.mergeBehaviour ?? DEFAULT_FILE_MERGE_BEHAVIOUR,
  };
};
