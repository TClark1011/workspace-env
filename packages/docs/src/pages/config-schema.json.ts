import type { APIRoute } from "astro";
import zodToJsonSchema from "zod-to-json-schema";
import { workspaceEnvConfigInputSchema } from "workspace-env";
import { z } from "zod";

const finalConfigInputSchema = workspaceEnvConfigInputSchema.extend({
  $schema: z.string().optional(),
});

const jsonSchemaData = zodToJsonSchema(finalConfigInputSchema, {});

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(jsonSchemaData), {
    headers: {
      "content-type": "application/json",
    },
  });
