import { DEFAULT_CONFIG_FILE_NAME } from "@/constants";
import { z } from "zod";

export const defaultEnvFilePatterns = [
  ".env",
  "*.env",
  ".env.*",
  "*.*.env",
  "*.env.*",
  ".env.*.*",
];

export const workspaceEnvConfigInputSchema = z.object({
  workspaces: z.string().array().optional(), // pull from package manager settings if not provided
  envDir: z.string().optional(), // use root dir if not provided
  syncEnvsTo: z.string().array().optional(), // sync to all workspaces if not provided
  envFilePatterns: z
    .string()
    .array()
    .optional()
    .default(defaultEnvFilePatterns),
});

export type WorkspaceEnvConfigInput = z.input<
  typeof workspaceEnvConfigInputSchema
>;

const noGlobStringSchema = z.string().refine((value) => !value.includes("*"), {
  message: "This string cannot contain a glob pattern",
});

export const workspaceEnvFinalConfigSchema = z.object({
  workspaces: z.set(noGlobStringSchema),
  envDir: noGlobStringSchema,
  syncEnvsTo: z.set(noGlobStringSchema),
  envFilePatterns: z.set(z.string()),
});

export type WorkspaceEnvFinalConfig = z.infer<
  typeof workspaceEnvFinalConfigSchema
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
