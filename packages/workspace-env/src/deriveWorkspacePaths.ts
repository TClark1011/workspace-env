import { glob } from "glob";

export const deriveWorkspacePaths = async (
  workspaces: string[],
): Promise<string[]> =>
  Promise.all(
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
