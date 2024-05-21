import { theCommand } from "@/cli/command";
import { DEFAULT_CONFIG_FILE_NAME } from "@/constants";
import { stringifyConfig } from "@/tests/testUtils";
import { run } from "cmd-ts";
import { vol, fs as virtualFs } from "memfs";
import { beforeEach, describe, expect, test } from "vitest";

beforeEach(() => {
  vol.reset();
});

describe("Env Merging", () => {
  test("Append if not specified", async () => {
    vol.fromJSON({
      "package.json": JSON.stringify({
        workspaces: ["packages/*"],
      }),
      "packages/frontend/package.json": JSON.stringify({
        name: "frontend",
      }),
      "packages/backend/package.json": JSON.stringify({
        name: "backend",
      }),
      "common-env/.env": "common=foo",
      "frontend-env/.env": "frontend-only=foo",
      "backend-env/.env": "backend-only=foo",
      [DEFAULT_CONFIG_FILE_NAME]: stringifyConfig({
        profiles: [
          {
            workspaces: ["frontend"],
            envDir: "frontend-env",
          },
          {
            workspaces: ["backend"],
            envDir: "backend-env",
          },
          {
            workspaces: ["backend", "frontend"],
            envDir: "common-env",
          },
        ],
      }),
    });

    await run(theCommand, []);

    const filesInFrontend =
      await virtualFs.promises.readdir("packages/frontend");
    const filesInBackend = await virtualFs.promises.readdir("packages/backend");

    expect(filesInFrontend).toContain(".env");
    expect(filesInBackend).toContain(".env");

    const frontendEnvFileContent = await virtualFs.promises.readFile(
      "packages/frontend/.env",
      "utf8",
    );
    const backendEnvFileContent = await virtualFs.promises.readFile(
      "packages/backend/.env",
      "utf8",
    );

    expect(frontendEnvFileContent).toEqual("frontend-only=foo\ncommon=foo");
    expect(backendEnvFileContent).toEqual("backend-only=foo\ncommon=foo");
  });

  describe("Define Merge Behaviour at Root", async () => {
    test("Append", async () => {
      vol.fromJSON({
        "package.json": JSON.stringify({
          workspaces: ["packages/*"],
        }),
        "packages/frontend/package.json": JSON.stringify({
          name: "frontend",
        }),
        "packages/backend/package.json": JSON.stringify({
          name: "backend",
        }),
        "common-env/.env": "common=foo",
        "frontend-env/.env": "frontend-only=foo",
        "backend-env/.env": "backend-only=foo",
        [DEFAULT_CONFIG_FILE_NAME]: stringifyConfig({
          mergeBehaviour: "append",
          profiles: [
            {
              workspaces: ["frontend"],
              envDir: "frontend-env",
            },
            {
              workspaces: ["backend"],
              envDir: "backend-env",
            },
            {
              workspaces: ["backend", "frontend"],
              envDir: "common-env",
            },
          ],
        }),
      });

      await run(theCommand, []);

      const filesInFrontend =
        await virtualFs.promises.readdir("packages/frontend");
      const filesInBackend =
        await virtualFs.promises.readdir("packages/backend");

      expect(filesInFrontend).toContain(".env");
      expect(filesInBackend).toContain(".env");

      const frontendEnvFileContent = await virtualFs.promises.readFile(
        "packages/frontend/.env",
        "utf8",
      );
      const backendEnvFileContent = await virtualFs.promises.readFile(
        "packages/backend/.env",
        "utf8",
      );

      expect(frontendEnvFileContent).toEqual("frontend-only=foo\ncommon=foo");
      expect(backendEnvFileContent).toEqual("backend-only=foo\ncommon=foo");
    });

    test("Prepend", async () => {
      vol.fromJSON({
        "package.json": JSON.stringify({
          workspaces: ["packages/*"],
        }),
        "packages/frontend/package.json": JSON.stringify({
          name: "frontend",
        }),
        "packages/backend/package.json": JSON.stringify({
          name: "backend",
        }),
        "common-env/.env": "common=foo",
        "frontend-env/.env": "frontend-only=foo",
        "backend-env/.env": "backend-only=foo",
        [DEFAULT_CONFIG_FILE_NAME]: stringifyConfig({
          mergeBehaviour: "prepend",
          profiles: [
            {
              workspaces: ["frontend"],
              envDir: "frontend-env",
            },
            {
              workspaces: ["backend"],
              envDir: "backend-env",
            },
            {
              workspaces: ["backend", "frontend"],
              envDir: "common-env",
            },
          ],
        }),
      });

      await run(theCommand, []);

      const filesInFrontend =
        await virtualFs.promises.readdir("packages/frontend");
      const filesInBackend =
        await virtualFs.promises.readdir("packages/backend");

      expect(filesInFrontend).toContain(".env");
      expect(filesInBackend).toContain(".env");

      const frontendEnvFileContent = await virtualFs.promises.readFile(
        "packages/frontend/.env",
        "utf8",
      );
      const backendEnvFileContent = await virtualFs.promises.readFile(
        "packages/backend/.env",
        "utf8",
      );

      expect(frontendEnvFileContent).toEqual("common=foo\nfrontend-only=foo");
      expect(backendEnvFileContent).toEqual("common=foo\nbackend-only=foo");
    });

    test("Overwrite", async () => {
      vol.fromJSON({
        "package.json": JSON.stringify({
          workspaces: ["packages/*"],
        }),
        "packages/frontend/package.json": JSON.stringify({
          name: "frontend",
        }),
        "packages/backend/package.json": JSON.stringify({
          name: "backend",
        }),
        "common-env/.env": "common=foo",
        "frontend-env/.env": "frontend-only=foo",
        "backend-env/.env": "backend-only=foo",
        [DEFAULT_CONFIG_FILE_NAME]: stringifyConfig({
          mergeBehaviour: "overwrite",
          profiles: [
            {
              workspaces: ["frontend"],
              envDir: "frontend-env",
            },
            {
              workspaces: ["backend"],
              envDir: "backend-env",
            },
            {
              workspaces: ["backend", "frontend"],
              envDir: "common-env",
            },
          ],
        }),
      });

      await run(theCommand, []);

      const filesInFrontend =
        await virtualFs.promises.readdir("packages/frontend");
      const filesInBackend =
        await virtualFs.promises.readdir("packages/backend");

      expect(filesInFrontend).toContain(".env");
      expect(filesInBackend).toContain(".env");

      const frontendEnvFileContent = await virtualFs.promises.readFile(
        "packages/frontend/.env",
        "utf8",
      );
      const backendEnvFileContent = await virtualFs.promises.readFile(
        "packages/backend/.env",
        "utf8",
      );

      expect(frontendEnvFileContent).toEqual("common=foo");
      expect(backendEnvFileContent).toEqual("common=foo");
    });
  });

  describe("Define Merge Behaviour in Profile", async () => {
    test("Append", async () => {
      vol.fromJSON({
        "package.json": JSON.stringify({
          workspaces: ["packages/*"],
        }),
        "packages/frontend/package.json": JSON.stringify({
          name: "frontend",
        }),
        "packages/backend/package.json": JSON.stringify({
          name: "backend",
        }),
        "common-env/.env": "common=foo",
        "frontend-env/.env": "frontend-only=foo",
        "backend-env/.env": "backend-only=foo",
        [DEFAULT_CONFIG_FILE_NAME]: stringifyConfig({
          profiles: [
            {
              workspaces: ["frontend"],
              envDir: "frontend-env",
            },
            {
              workspaces: ["backend"],
              envDir: "backend-env",
            },
            {
              workspaces: ["backend", "frontend"],
              envDir: "common-env",
              mergeBehaviour: "append",
            },
          ],
        }),
      });

      await run(theCommand, []);

      const filesInFrontend =
        await virtualFs.promises.readdir("packages/frontend");
      const filesInBackend =
        await virtualFs.promises.readdir("packages/backend");

      expect(filesInFrontend).toContain(".env");
      expect(filesInBackend).toContain(".env");

      const frontendEnvFileContent = await virtualFs.promises.readFile(
        "packages/frontend/.env",
        "utf8",
      );
      const backendEnvFileContent = await virtualFs.promises.readFile(
        "packages/backend/.env",
        "utf8",
      );

      expect(frontendEnvFileContent).toEqual("frontend-only=foo\ncommon=foo");
      expect(backendEnvFileContent).toEqual("backend-only=foo\ncommon=foo");
    });

    test("Prepend", async () => {
      vol.fromJSON({
        "package.json": JSON.stringify({
          workspaces: ["packages/*"],
        }),
        "packages/frontend/package.json": JSON.stringify({
          name: "frontend",
        }),
        "packages/backend/package.json": JSON.stringify({
          name: "backend",
        }),
        "common-env/.env": "common=foo",
        "frontend-env/.env": "frontend-only=foo",
        "backend-env/.env": "backend-only=foo",
        [DEFAULT_CONFIG_FILE_NAME]: stringifyConfig({
          profiles: [
            {
              workspaces: ["frontend"],
              envDir: "frontend-env",
            },
            {
              workspaces: ["backend"],
              envDir: "backend-env",
            },
            {
              workspaces: ["backend", "frontend"],
              mergeBehaviour: "prepend",
              envDir: "common-env",
            },
          ],
        }),
      });

      await run(theCommand, []);

      const filesInFrontend =
        await virtualFs.promises.readdir("packages/frontend");
      const filesInBackend =
        await virtualFs.promises.readdir("packages/backend");

      expect(filesInFrontend).toContain(".env");
      expect(filesInBackend).toContain(".env");

      const frontendEnvFileContent = await virtualFs.promises.readFile(
        "packages/frontend/.env",
        "utf8",
      );
      const backendEnvFileContent = await virtualFs.promises.readFile(
        "packages/backend/.env",
        "utf8",
      );

      expect(frontendEnvFileContent).toEqual("common=foo\nfrontend-only=foo");
      expect(backendEnvFileContent).toEqual("common=foo\nbackend-only=foo");
    });

    test("Overwrite", async () => {
      vol.fromJSON({
        "package.json": JSON.stringify({
          workspaces: ["packages/*"],
        }),
        "packages/frontend/package.json": JSON.stringify({
          name: "frontend",
        }),
        "packages/backend/package.json": JSON.stringify({
          name: "backend",
        }),
        "common-env/.env": "common=foo",
        "frontend-env/.env": "frontend-only=foo",
        "backend-env/.env": "backend-only=foo",
        [DEFAULT_CONFIG_FILE_NAME]: stringifyConfig({
          profiles: [
            {
              workspaces: ["frontend"],
              envDir: "frontend-env",
            },
            {
              workspaces: ["backend"],
              envDir: "backend-env",
            },
            {
              workspaces: ["backend", "frontend"],
              envDir: "common-env",
              mergeBehaviour: "overwrite",
            },
          ],
        }),
      });

      await run(theCommand, []);

      const filesInFrontend =
        await virtualFs.promises.readdir("packages/frontend");
      const filesInBackend =
        await virtualFs.promises.readdir("packages/backend");

      expect(filesInFrontend).toContain(".env");
      expect(filesInBackend).toContain(".env");

      const frontendEnvFileContent = await virtualFs.promises.readFile(
        "packages/frontend/.env",
        "utf8",
      );
      const backendEnvFileContent = await virtualFs.promises.readFile(
        "packages/backend/.env",
        "utf8",
      );

      expect(frontendEnvFileContent).toEqual("common=foo");
      expect(backendEnvFileContent).toEqual("common=foo");
    });
  });

  describe("Multiple Overlaps with Different Merge Behaviours", async () => {
    test.todo("Per-profile behaviour conflict with root");
    test.todo("Per-profile conflict with each other");
  });
});
