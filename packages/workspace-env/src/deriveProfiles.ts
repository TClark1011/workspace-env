import {
  WorkspaceDefinition,
  WorkspaceEnvConfigInput,
  WorkspaceEnvProfile,
} from "@/configTypes";

type DeriveProfilesInput = {
  baselineProfile: WorkspaceEnvProfile;
  workspaceDefinitions: WorkspaceDefinition[];
  configFileData: WorkspaceEnvConfigInput;
};

export const deriveProfiles = async ({
  baselineProfile,
  workspaceDefinitions,
  configFileData,
}: DeriveProfilesInput): Promise<WorkspaceEnvProfile[]> => {
  if (!configFileData.profiles) {
    return [baselineProfile];
  }

  // Check that all profiles are valid
  configFileData.profiles.forEach((profile) => {
    const invalidWorkspaceName = profile.workspaces.find((workspaceName) => {
      const workspaceIsValid = workspaceDefinitions.some(
        ({ name }) => name === workspaceName,
      );
      return !workspaceIsValid;
    });

    if (invalidWorkspaceName) {
      throw new Error(`Invalid workspace name: "${invalidWorkspaceName}"`);
    }
  });

  return configFileData.profiles.map((profile) => ({
    envDirectoryPath: profile.envDir ?? baselineProfile.envDirectoryPath,
    workspaceDefinitions: workspaceDefinitions.filter(({ name }) =>
      profile.workspaces.includes(name),
    ),
    envFilePatterns: profile.envFilePatterns ?? baselineProfile.envFilePatterns,
    mergeBehaviour: profile.mergeBehaviour ?? baselineProfile.mergeBehaviour,
  }));
};
