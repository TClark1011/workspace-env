import { theCommand } from "@/cli/command";
import { DEFAULT_CONFIG_FILE_NAME } from "@/constants";
import { stringifyConfig } from "@/tests/testUtils";
import { run } from "cmd-ts";
import { vol, fs as virtualFs } from "memfs";
import { beforeEach, expect, test } from "vitest";
import YAML from "yaml";

beforeEach(() => {
  vol.reset();
});

test("Basic Behaviour With No Config File", async () => {
  vol.fromJSON({
    "package.json": JSON.stringify({
      workspaces: ["packages/*"],
    }),
    ".env": "foo=bar",
    "packages/a/package.json": "{}",
    "packages/b/package.json": "{}",
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
    "apps/no/package.json": "{}",
    "apps/yes/package.json": "{}",
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

test.todo("Basic Kitchen Sink w/ Custom Config Path");
