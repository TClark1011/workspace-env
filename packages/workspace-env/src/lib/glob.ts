import { glob, GlobOptions } from "glob";
import fs from "fs/promises";

export const customGlob = ((
  input: string | string[],
  options: GlobOptions = {},
) =>
  glob(input, {
    fs: fs, // required for our tests to work
    ...options,
  })) as never as typeof glob;
