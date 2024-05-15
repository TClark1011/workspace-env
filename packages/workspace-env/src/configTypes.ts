import { DEFAULT_CONFIG_FILE_NAME } from "@/constants";
import { z } from "zod";

export const workspaceEnvConfigInputSchema = z.object({
  workspaces: z.string().array().optional(), // pull from package manager settings if not provided
  envDir: z.string().optional(), // use root dir if not provided
  syncEnvsTo: z.string().array().optional(), // sync to all workspaces if not provided
  envFilePatterns: z.string().array().optional(),
});

export type WorkspaceEnvConfigInput = z.input<
  typeof workspaceEnvConfigInputSchema
>;

export const cliOptionsInputSchema = z.object({
  inWatchMode: z.boolean().optional(),
  configFilePath: z.string().optional(),
});

export type CLIOptionsInput = z.input<typeof cliOptionsInputSchema>;

export const cliOptionsFinalSchema = cliOptionsInputSchema.required();

export type CLIOptionsFinal = z.infer<typeof cliOptionsFinalSchema>;

export const DEFAULT_CLI_OPTIONS_FINAL: CLIOptionsFinal = {
  configFilePath: DEFAULT_CONFIG_FILE_NAME,
  inWatchMode: false,
};

export const programStateSchema = z.object({
  workspacePaths: z.array(z.string()),
  envDirectoryPath: z.string(),
  envFilePatterns: z.array(z.string()),
  syncEnvsToWorkspaceDirectoryNames: z.array(z.string()),
});

export type ProgramState = z.infer<typeof programStateSchema>;
