import z from "zod";
import fs from "fs/promises";
import isGlob from "is-glob";
import { glob } from "glob";

export const pathPointsToWorkspace = async (path: string): Promise<boolean> => {
  const filesAtPath = await fs.readdir(path);
  return filesAtPath.includes("package.json");
};

/**
 * Parse an input against a schema and provide typing
 * on the input parameter.
 */
export const guidedParse = <Schema extends z.ZodTypeAny>(
  schema: Schema,
  input: z.input<Schema>,
): z.infer<Schema> => schema.parse(input);

export const getLastPathSegment = (path: string): string =>
  path.split("/").pop() ?? path;

export const someAsync = async <T>(
  arr: T[],
  predicate: (item: T) => Promise<boolean>,
): Promise<boolean> => {
  let isTrue = false;

  for (const item of arr) {
    isTrue = await predicate(item);
    if (isTrue) {
      break;
    }
  }

  return isTrue;
};

export const everyAsync = async <T>(
  arr: T[],
  predicate: (item: T) => Promise<boolean>,
): Promise<boolean> => {
  const containsFalseResult = await someAsync(arr, async (item) => {
    const result = await predicate(item);
    return !result;
  });

  return !containsFalseResult;
};

export const filterAsync = async <T>(
  arr: T[],
  predicate: (item: T) => Promise<boolean>,
): Promise<T[]> => {
  const results: T[] = [];

  for (const item of arr) {
    const result = await predicate(item);
    if (result) {
      results.push(item);
    }
  }

  return results;
};

export const forEachAsync = async <T>(
  arr: T[],
  callback: (item: T, index: number, arr: T[]) => Promise<void>,
): Promise<void> => {
  for (const item of arr) {
    await callback(item, arr.indexOf(item), arr);
  }
};

export const checkPathIsValid = async (path: string): Promise<boolean> => {
  return fs
    .stat(path)
    .then(() => true)
    .catch(() => false);
};

export const evaluatePossibleGlob = async (
  possibleGlob: string,
): Promise<string[]> => {
  const pathIsAlreadyValid = await checkPathIsValid(possibleGlob);

  if (pathIsAlreadyValid) {
    return [possibleGlob];
  }

  if (!isGlob(possibleGlob)) {
    throw new Error(
      `The provided path is not a valid path or a glob pattern: ${possibleGlob}`,
    );
  }

  return glob(possibleGlob, {
    nodir: false,
  });
};
