/* eslint-disable @typescript-eslint/no-explicit-any */
import { glob } from "glob";
import fs from "fs/promises";

export const customGlob = ((
  patterns: any | any[],
  options: any,
): Promise<string[]> =>
  glob(patterns, {
    ...options,
    fs,
  })) as any as typeof glob;
