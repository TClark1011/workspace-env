import { theCommand } from "@/cli/command";
import { DEFAULT_CONFIG_FILE_NAME } from "@/constants";
import { stringifyConfig } from "@/tests/testUtils";
import { run } from "cmd-ts";
import { vol, fs as virtualFs } from "memfs";
import { beforeEach, expect, test } from "vitest";
import YAML from "yaml";

const fileNameArrayContainsEnv = (files: string[]): boolean =>
  files.some((file) => file.includes(".env"));

beforeEach(() => {
  vol.reset();
});

test("Basic Behaviour With No Config File", async () => {
  vol.fromJSON({
    "package.json": JSON.stringify({
      workspaces: ["packages/*"],
    }),
    ".env": "foo=bar",
    "packages/a/package.json": JSON.stringify({
      name: "a",
    }),
    "packages/b/package.json": JSON.stringify({
      name: "b",
    }),
  });

  await run(theCommand, []);

  const filesInTheAPackage = (await virtualFs.promises.readdir(
    "packages/a",
  )) as string[];

  expect(filesInTheAPackage).toContain(".env");

  const aPackageEnvFileContent = (await virtualFs.promises.readFile(
    "packages/a/.env",
    "utf8",
  )) as string;

  expect(aPackageEnvFileContent).toEqual("foo=bar");

  const filesInTheBPackage = (await virtualFs.promises.readdir(
    "packages/b",
  )) as string[];

  expect(filesInTheBPackage).toContain(".env");

  const bPackageEnvFileContent = (await virtualFs.promises.readFile(
    "packages/b/.env",
    "utf8",
  )) as string;

  expect(bPackageEnvFileContent).toEqual("foo=bar");
});

test("Basic Kitchen Sink", async () => {
  vol.fromJSON({
    "pnpm-workspace.yaml": YAML.stringify({
      packages: ["apps/*"],
    }),
    [DEFAULT_CONFIG_FILE_NAME]: stringifyConfig({
      envDir: "env",
      envFilePatterns: [".env"],
      syncEnvsTo: ["yes"],
    }),
    "env/.env": "foo=bar",
    "apps/no/package.json": JSON.stringify({
      name: "no",
    }),
    "apps/yes/package.json": JSON.stringify({
      name: "yes",
    }),
  });

  await run(theCommand, []);

  const filesInNoPackage = (await virtualFs.promises.readdir(
    "apps/no",
  )) as string[];

  expect(filesInNoPackage).not.toContain(".env");

  const filesInYesPackage = (await virtualFs.promises.readdir(
    "apps/yes",
  )) as string[];

  expect(filesInYesPackage).toContain(".env");

  const yesPackageEnvFileContent = (await virtualFs.promises.readFile(
    "apps/yes/.env",
    "utf8",
  )) as string;

  expect(yesPackageEnvFileContent).toEqual("foo=bar");
});

test("Basic Profiles", async () => {
  vol.fromJSON({
    "package.json": JSON.stringify({
      workspaces: ["packages/*"],
    }),
    "a-envs/.a.env": "workspace=a",
    "b-envs/.b.env": "workspace=b",
    "packages/a/package.json": JSON.stringify({
      name: "a",
    }),
    "packages/b/package.json": JSON.stringify({
      name: "b",
    }),
    "packages/c/package.json": JSON.stringify({
      name: "c",
    }),
    [DEFAULT_CONFIG_FILE_NAME]: stringifyConfig({
      profiles: [
        {
          workspaces: ["a"],
          envDir: "a-envs",
        },
        {
          workspaces: ["b"],
          envDir: "b-envs",
        },
      ],
    }),
  });

  const startingFilesInA = await virtualFs.promises.readdir("packages/a");
  const startingFilesInB = await virtualFs.promises.readdir("packages/b");
  const startingFilesInC = await virtualFs.promises.readdir("packages/c");

  expect(startingFilesInA).not.toSatisfy(fileNameArrayContainsEnv);
  expect(startingFilesInB).not.toSatisfy(fileNameArrayContainsEnv);
  expect(startingFilesInC).not.toSatisfy(fileNameArrayContainsEnv);

  await run(theCommand, []);

  const postSyncFilesInA = await virtualFs.promises.readdir("packages/a");
  const postSyncFilesInB = await virtualFs.promises.readdir("packages/b");
  const postSyncFilesInC = await virtualFs.promises.readdir("packages/c");

  expect(postSyncFilesInA).toContain(".a.env");
  expect(postSyncFilesInB).toContain(".b.env");
  expect(postSyncFilesInC).not.toSatisfy(fileNameArrayContainsEnv);

  const aEnvContent = await virtualFs.promises.readFile(
    "packages/a/.a.env",
    "utf8",
  );
  const bEnvContent = await virtualFs.promises.readFile(
    "packages/b/.b.env",
    "utf8",
  );
  expect(aEnvContent).toEqual("workspace=a");
  expect(bEnvContent).toEqual("workspace=b");
});

test("Workspaces point directly to a workspace + Lerna Config", async () => {
  vol.fromJSON({
    "lerna.json": JSON.stringify({
      packages: ["apps/frontend"],
    }),
    "apps/frontend/package.json": JSON.stringify({
      name: "frontend",
    }),
    ".env": "foo=bar",
  });

  await run(theCommand, []);

  const filesInFrontend = await virtualFs.promises.readdir("apps/frontend");

  expect(filesInFrontend).toContain(".env");

  const frontendEnvContent = await virtualFs.promises.readFile(
    "apps/frontend/.env",
    "utf8",
  );
  expect(frontendEnvContent).toEqual("foo=bar");
});

test("Workspace pointing directly to a workspace and others with wildcard", async () => {
  vol.fromJSON({
    "package.json": JSON.stringify({
      workspaces: ["apps/*", "packages/utils"],
    }),
    "apps/frontend/package.json": JSON.stringify({
      name: "frontend",
    }),
    "apps/backend/package.json": JSON.stringify({
      name: "backend",
    }),
    "packages/utils/package.json": JSON.stringify({
      name: "utils",
    }),
    ".env": "foo=bar",
  });

  await run(theCommand, []);

  const filesInFrontend = await virtualFs.promises.readdir("apps/frontend");
  const filesInBackend = await virtualFs.promises.readdir("apps/backend");
  const filesInUtils = await virtualFs.promises.readdir("packages/utils");

  expect(filesInFrontend).toContain(".env");
  expect(filesInBackend).toContain(".env");
  expect(filesInUtils).toContain(".env");

  const frontendEnvContent = await virtualFs.promises.readFile(
    "apps/frontend/.env",
    "utf8",
  );
  const backendEnvContent = await virtualFs.promises.readFile(
    "apps/backend/.env",
    "utf8",
  );
  const utilsEnvContent = await virtualFs.promises.readFile(
    "packages/utils/.env",
    "utf8",
  );

  expect(frontendEnvContent).toEqual("foo=bar");
  expect(backendEnvContent).toEqual("foo=bar");
  expect(utilsEnvContent).toEqual("foo=bar");
});

test("Basic Kitchen Sink w/ Custom Config Path", async () => {
  vol.fromJSON({
    "pnpm-workspace.yaml": YAML.stringify({
      packages: ["apps/*"],
    }),
    "custom-config.json": stringifyConfig({
      envDir: "env",
      envFilePatterns: [".env"],
      syncEnvsTo: ["yes"],
    }),
    "env/.env": "foo=bar",
    "apps/no/package.json": JSON.stringify({
      name: "no",
    }),
    "apps/yes/package.json": JSON.stringify({
      name: "yes",
    }),
  });

  await run(theCommand, ["--config", "./custom-config.json"]);

  const filesInNoPackage = (await virtualFs.promises.readdir(
    "apps/no",
  )) as string[];

  expect(filesInNoPackage).not.toContain(".env");

  const filesInYesPackage = (await virtualFs.promises.readdir(
    "apps/yes",
  )) as string[];

  expect(filesInYesPackage).toContain(".env");

  const yesPackageEnvFileContent = (await virtualFs.promises.readFile(
    "apps/yes/.env",
    "utf8",
  )) as string;

  expect(yesPackageEnvFileContent).toEqual("foo=bar");
});
