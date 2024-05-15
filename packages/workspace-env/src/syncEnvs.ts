import fs from "fs/promises";
import path from "path";
import { ProgramState } from "@/configTypes";
import { glob } from "glob";

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

export const syncEnvs = async (programState: ProgramState) => {
  const envFilesToCopy = await listEnvFilePaths(programState.envDirectoryPath, [
    ...programState.envFilePatterns,
  ]);

  const workspacePathsToSyncTo = programState.workspacePaths.filter(
    (workspacePath) =>
      programState.syncEnvsToWorkspaceDirectoryNames.some((syncPath) =>
        workspacePath.endsWith(syncPath),
      ),
  );

  // Delete all existing envs
  await Promise.all(
    workspacePathsToSyncTo.map((workspaceDirPath) =>
      deleteAllEnvFilesInDir(workspaceDirPath, programState.envFilePatterns),
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
