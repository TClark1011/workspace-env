import { syncEnvs } from "@/syncEnvs";
import { vol, fs as virtualFs } from "memfs";
import { expect, test } from "vitest";

test("Basic Behaviour With No Config File", async () => {
  vol.fromJSON({
    "package.json": JSON.stringify({
      workspaces: ["packages/*"],
    }),
    ".env": "foo=bar",
    "packages/a/package.json": "{}",
    "packages/b/package.json": "{}",
  });

  await syncEnvs();

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
