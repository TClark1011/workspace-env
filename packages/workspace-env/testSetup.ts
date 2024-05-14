/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from "vitest";
import { fs as virtualFs } from "memfs";

vi.mock("fs", () => ({
  default: virtualFs,
}));
vi.mock("fs/promises", () => ({
  default: virtualFs.promises,
}));

vi.mock("glob", async (originalImport) => {
  const originalGlobImport = await originalImport<typeof import("glob")>();

  return {
    ...originalGlobImport,
    glob: ((input: any, options: any) =>
      originalGlobImport.glob(input, {
        ...options,
        fs: virtualFs,
      })) as never as typeof originalGlobImport.glob,
  } satisfies typeof originalGlobImport;
});
