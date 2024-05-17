import fs from "fs/promises";
import YAML from "yaml";

const hasStringArrayAtField = <Field extends string>(
  data: unknown,
  field: Field,
): data is Record<Field, string[]> =>
  typeof data === "object" &&
  data !== null &&
  Array.isArray((data as Record<Field, unknown>)[field]);

type WorkspacesSource = {
  fileName: string;
  parseFileContent: (fileContents: string) => unknown;
  fieldName: string;
};

const WORKSPACE_SOURCES: WorkspacesSource[] = [
  {
    fileName: "lerna.json",
    fieldName: "packages",
    parseFileContent: JSON.parse,
  },
  {
    fileName: "package.json",
    fieldName: "workspaces",
    parseFileContent: JSON.parse,
  },
  {
    fileName: "pnpm-workspace.yaml",
    fieldName: "packages",
    parseFileContent: YAML.parse,
  },
];

const readWorkspacesSource = async ({
  fieldName,
  fileName,
  parseFileContent,
}: WorkspacesSource): Promise<string[]> => {
  const fileContent = fs.readFile(fileName, "utf-8").catch(() => "{}");
  const data = parseFileContent(await fileContent);

  if (hasStringArrayAtField(data, fieldName)) {
    return data[fieldName] as string[];
  }

  throw new Error(`Could not find workspaces in ${fileName}`);
};

export const readWorkspacesFromConfigs = async (): Promise<string[]> => {
  const workspaces = await Promise.any(
    WORKSPACE_SOURCES.map(readWorkspacesSource),
  );

  return workspaces;
};
