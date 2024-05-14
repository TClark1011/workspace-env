import { vi } from "vitest";
import { fs as virtualFs } from "memfs";

vi.mock("fs", () => ({
  default: virtualFs,
}));
vi.mock("fs/promises", () => ({
  default: virtualFs.promises,
}));
