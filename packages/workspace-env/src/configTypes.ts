import { DEFAULT_CONFIG_FILE_NAME } from "@/constants";
import { z } from "zod";

const workspaceEnvBehaviourInputFieldsSchema = z.object({
  envDir: z
    .string()
    .optional()
    .describe(
      "The directory where the environment files are stored. If not provided, defaults to current working directory.",
    ),
  syncEnvsTo: z
    .string()
    .array()
    .optional()
    .describe(
      "The workspace folders to sync env files to. If not provided, env files will be synced to all workspaces",
    ),
  envFilePatterns: z
    .string()
    .array()
    .optional()
    .describe(
      "The file patterns to search for environment files. Can use specific file names or glob patterns.",
    ),
});

export type WorkspaceEnvBehaviourOptions = z.infer<
  typeof workspaceEnvBehaviourInputFieldsSchema
>;

export const workspaceEnvProfileInputSchema = z
  .object({
    workspaces: z
      .string()
      .array()
      .describe("The workspace directory names the profile should apply to."),
  })
  .and(
    workspaceEnvBehaviourInputFieldsSchema.omit({
      syncEnvsTo: true,
    }),
  );

export const workspaceEnvConfigInputSchema =
  workspaceEnvBehaviourInputFieldsSchema.extend({
    profiles: z
      .array(workspaceEnvProfileInputSchema)
      .optional()
      .describe(
        "Define profiles to apply different sync rules to different workspaces.",
      ),
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

export const workspaceDefinitionSchema = z.object({
  name: z.string(),
  path: z.string(),
});

export type WorkspaceDefinition = z.infer<typeof workspaceDefinitionSchema>;

export const workspaceEnvProfileSchema = z.object({
  workspaceDefinitions: z.array(workspaceDefinitionSchema),
  envDirectoryPath: z.string(),
  envFilePatterns: z.array(z.string()),
});

export type WorkspaceEnvProfile = z.infer<typeof workspaceEnvProfileSchema>;
