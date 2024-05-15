import type { APIRoute } from "astro";
import zodToJsonSchema from "zod-to-json-schema";
import { workspaceEnvConfigInputSchema } from "workspace-env";

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(zodToJsonSchema(workspaceEnvConfigInputSchema)), {
    headers: {
      "content-type": "application/json",
    },
  });