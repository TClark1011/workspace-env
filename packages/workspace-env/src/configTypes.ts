import { z } from "zod";

export const workspaceEnvConfigInputSchema = z.object({
  workspaces: z.string().array().optional(), // pull from package manager settings if not provided
  envDir: z.string().optional(), // use root dir if not provided
  syncEnvsTo: z.string().array().optional(), // sync to all workspaces if not provided
});

export type WorkspaceEnvConfigInput = z.infer<
  typeof workspaceEnvConfigInputSchema
>;

export const workspaceEnvFinalConfigSchema =
  workspaceEnvConfigInputSchema.required();

export type WorkspaceEnvFinalConfig = z.infer<
  typeof workspaceEnvFinalConfigSchema
>;
