import { customGlob } from "$glob";
import { readConfig } from "@/readConfig";
import fs from "fs/promises";
import path from "path";

const listEnvFilePaths = async (
  dir: string,
  patterns: string[],
): Promise<string[]> => {
  const files = await customGlob(
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

export const syncEnvs = async () => {
  const config = await readConfig();

  const envFilesToCopy = await listEnvFilePaths(config.envDir, [
    ...config.envFilePatterns,
  ]);

  const workspacePathsToSyncTo = [...config.workspaces].filter(
    (workspacePath) =>
      [...config.syncEnvsTo].some((syncPath) =>
        workspacePath.endsWith(syncPath),
      ),
  );

  // Delete all existing envs
  await Promise.all(
    workspacePathsToSyncTo.map((workspaceDirPath) =>
      deleteAllEnvFilesInDir(workspaceDirPath, [...config.envFilePatterns]),
    ),
  );

  // Copy all envs
  await Promise.all(
    envFilesToCopy.map(async (envSourceFilePath) =>
      Promise.all(
        workspacePathsToSyncTo.map(async (workspaceDirPath): Promise<void> => {
          const envDestFilePath = path.join(
            workspaceDirPath,
            getLastSegmentOfPath(envSourceFilePath),
          );

          await fs.copyFile(envSourceFilePath, envDestFilePath);

          return;
        }),
      ),
    ),
  );
};
