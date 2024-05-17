import { WorkspaceDefinition } from "@/configTypes";
import z from "zod";
import fs from "fs/promises";

const packageJsonStubSchema = z.object({
  name: z.string(),
});

export const deriveWorkspaceDefinitionFromPath = async (
  path: string,
): Promise<WorkspaceDefinition> => {
  const packageJsonRawContents = await fs.readFile(
    `${path}/package.json`,
    "utf8",
  );

  const untypedPackageJsonContents = JSON.parse(packageJsonRawContents);
  const packageJsonContents = packageJsonStubSchema.parse(
    untypedPackageJsonContents,
  );

  return {
    name: packageJsonContents.name,
    path,
  };
};
