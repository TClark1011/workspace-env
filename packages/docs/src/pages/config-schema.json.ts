import type { APIRoute } from "astro";
import zodToJsonSchema from "zod-to-json-schema";
import { workspaceEnvConfigInputSchema } from "workspace-env";
import { z } from "zod";

const finalConfigInputSchema = workspaceEnvConfigInputSchema.extend({
  $schema: z.string().optional(),
});

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(zodToJsonSchema(finalConfigInputSchema)), {
    headers: {
      "content-type": "application/json",
    },
  });
