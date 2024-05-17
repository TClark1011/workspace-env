import {
  evaluatePossibleGlob,
  filterAsync,
  pathPointsToWorkspace,
} from "@/utils";

export const evaluateWorkspaceInputPath = async (
  workspaceInputPath: string,
): Promise<string[]> => {
  const evaluatedPaths = await evaluatePossibleGlob(workspaceInputPath);

  const validEvaluatedPaths = await filterAsync(
    evaluatedPaths,
    pathPointsToWorkspace,
  );

  if (validEvaluatedPaths.length === 0) {
    throw new Error(`No workspaces found for pattern: ${workspaceInputPath}`);
  }

  return validEvaluatedPaths;
};
