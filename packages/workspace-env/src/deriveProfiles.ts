import { WorkspaceEnvConfigInput, WorkspaceEnvProfile } from "@/configTypes";
import { getLastPathSegment } from "@/utils";

type DeriveProfilesInput = {
  baselineProfile: WorkspaceEnvProfile;
  workspacePaths: string[];
  configFileData: WorkspaceEnvConfigInput;
};

export const deriveProfiles = async ({
  baselineProfile,
  workspacePaths,
  configFileData,
}: DeriveProfilesInput): Promise<WorkspaceEnvProfile[]> => {
  if (!configFileData.profiles) {
    return [baselineProfile];
  }

  // Check that all profiles are valid
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
    envDirectoryPath: profile.envDir ?? baselineProfile.envDirectoryPath,
    workspacePaths: workspacePaths.filter((workspacePath) =>
      profile.workspaces.includes(getLastPathSegment(workspacePath)),
    ),
    envFilePatterns: profile.envFilePatterns ?? baselineProfile.envFilePatterns,
  }));
};
