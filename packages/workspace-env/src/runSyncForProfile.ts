import fs from "fs/promises";
import path from "path";
import { WorkspaceEnvProfile } from "@/configTypes";
import { glob } from "glob";
import { checkPathIsValid, matchString } from "@/utils";

const listEnvFilePaths = async (
  dir: string,
  patterns: string[],
): Promise<string[]> => {
  const files = await glob(
    patterns.map((p) => path.join(dir, p)),
    {
      dot: true,
    },
  );

  return files;
};

const getLastSegmentOfPath = (path: string): string => {
  const pathSegments = path.split("/");
  const lastSegment = pathSegments[pathSegments.length - 1];

  if (!lastSegment) {
    return path;
  }

  return lastSegment;
};

export const runSyncForProfile = async (profile: WorkspaceEnvProfile) => {
  const envFilePathsToSync = await listEnvFilePaths(profile.envDirectoryPath, [
    ...profile.envFilePatterns,
  ]);

  // Copy all envs
  await Promise.all(
    envFilePathsToSync.map(async (envSourceFilePath) =>
      Promise.all(
        profile.workspaceDefinitions.map(
          async (workspaceDefinition): Promise<void> => {
            // const filesInWorkspace = await fs.readdir(workspaceDefinition.path); // fixes weird issue where existing file is sometimes not found

            const envDestFilePath = path.join(
              workspaceDefinition.path,
              getLastSegmentOfPath(envSourceFilePath),
            );

            const fileAlreadyExists = await checkPathIsValid(envDestFilePath);

            if (!fileAlreadyExists || profile.mergeBehaviour === "overwrite") {
              await fs.copyFile(envSourceFilePath, envDestFilePath);

              return;
            }

            const envFileContent = await fs.readFile(envSourceFilePath, {
              encoding: "utf8",
            });
            const existingFileContent = await fs.readFile(envDestFilePath, {
              encoding: "utf8",
            });
            const newFileContent = matchString(profile.mergeBehaviour, {
              append: `${existingFileContent}\n${envFileContent}`,
              prepend: `${envFileContent}\n${existingFileContent}`,
            });

            await fs.writeFile(envDestFilePath, newFileContent);

            return;
          },
        ),
      ),
    ),
  );
};
