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

export const cliOptionsSchema = z.object({
  config: z.string().optional(),
});

export type CliOptions = z.infer<typeof cliOptionsSchema>;
