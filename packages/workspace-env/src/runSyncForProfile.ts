import fs from "fs/promises";
import path from "path";
import { WorkspaceEnvProfile } from "@/configTypes";
import { glob } from "glob";
import { forEachAsync } from "@/utils";

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

const deleteAllEnvFilesInDir = async (dir: string, patterns: string[]) => {
  const filePaths = await listEnvFilePaths(
    dir,
    patterns.map((pattern) => `./${pattern}`),
  );

  await Promise.all(
    filePaths.map(async (filePath) => {
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);

      if (!fileExists) {
        return;
      }

      await fs.rm(filePath);
    }),
  );
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
  const runSyncForProfile = await listEnvFilePaths(profile.envDirectoryPath, [
    ...profile.envFilePatterns,
  ]);

  const allWorkspacePaths = profile.workspaceDefinitions.map(
    (workspaceDefinition) => workspaceDefinition.path,
  );
  await forEachAsync(allWorkspacePaths, (path) =>
    deleteAllEnvFilesInDir(path, profile.envFilePatterns),
  );

  // Copy all envs
  await Promise.all(
    runSyncForProfile.map(async (envSourceFilePath) =>
      Promise.all(
        profile.workspaceDefinitions.map(
          async (workspaceDefinition): Promise<void> => {
            const envDestFilePath = path.join(
              workspaceDefinition.path,
              getLastSegmentOfPath(envSourceFilePath),
            );

            await fs.copyFile(envSourceFilePath, envDestFilePath);

            return;
          },
        ),
      ),
    ),
  );
};
