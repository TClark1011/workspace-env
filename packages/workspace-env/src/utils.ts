import z from "zod";

/**
 * Parse an input against a schema and provide typing
 * on the input parameter.
 */
export const guidedParse = <Schema extends z.ZodTypeAny>(
  schema: Schema,
  input: z.input<Schema>,
): z.infer<Schema> => schema.parse(input);
