import { WorkspaceEnvProfile, WorkspaceEnvConfigInput } from "../configTypes";

export const stringifyConfig = (config: WorkspaceEnvConfigInput): string =>
  JSON.stringify(config, null, 2);

export const composeMatchObjectHelper =
  <T>() =>
  (data: Partial<Record<keyof T, unknown>>) =>
    data;

export const psm = composeMatchObjectHelper<WorkspaceEnvProfile>();
