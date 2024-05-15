import { WorkspaceEnvProfile, WorkspaceEnvConfigInput } from "../configTypes";
import { DirectoryJSON, vol } from "memfs";
import { DEFAULT_CONFIG_FILE_NAME } from "@/constants";
import YAML from "yaml";

type ConfigureVirtualFilesInput = {
  workspaceEnvConfig?: WorkspaceEnvConfigInput;
  pnpmWorkspaces?: {
    packages?: string[];
  };
  packageJson?: {
    workspaces?: string[];
  };
};

export const configureVirtualFiles = (
  input: ConfigureVirtualFilesInput,
  others: DirectoryJSON = {},
): void => {
  vol.reset();
  vol.fromJSON({
    [DEFAULT_CONFIG_FILE_NAME]: JSON.stringify(input.workspaceEnvConfig ?? {}),
    ...(input.pnpmWorkspaces && {
      "pnpm-workspace.yaml": YAML.stringify(input.pnpmWorkspaces),
    }),
    ...(input.packageJson && {
      "package.json": JSON.stringify(input.packageJson),
    }),
    ...others,
  });
};

export const stringifyConfig = (config: WorkspaceEnvConfigInput): string =>
  JSON.stringify(config, null, 2);

export const composeMatchObjectHelper =
  <T>() =>
  (data: Partial<Record<keyof T, unknown>>) =>
    data;

export const psm = composeMatchObjectHelper<WorkspaceEnvProfile>();
