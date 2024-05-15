import { syncEnvs } from "@/syncEnvs";
import { configureVirtualFiles } from "@/tests/testUtils";
import { describe, it, assert } from "vitest";
import { fs } from "memfs";
import { deriveProgramState } from "@/deriveProgramState";

describe("syncEnvs (single workspace)", () => {
  it("Copies ENV files", async () => {
    configureVirtualFiles(
      {
        packageJson: {
          workspaces: ["packages/*"],
        },
      },
      {
        ".env": "foo=bar",
        ".env.local": "foo=bar",
        ".development.env": "foo=bar",
        "packages/a/package.json": "{}",
      },
    );

    const programState = await deriveProgramState();
    await syncEnvs(programState);

    const filesInTheAPackage = (await fs.promises.readdir(
      "packages/a",
    )) as string[];

    assert(filesInTheAPackage.includes(".env"), ".env was not copied");
    assert(
      filesInTheAPackage.includes(".env.local"),
      ".env.local was not copied",
    );
    assert(
      filesInTheAPackage.includes(".development.env"),
      ".development.env was not copied",
    );
  });

  it("Overrides existing env files", async () => {
    configureVirtualFiles(
      {
        packageJson: {
          workspaces: ["packages/*"],
        },
      },
      {
        ".env": "a",
        ".env.local": "b",
        ".development.env": "c",
        "packages/a/package.json": "{}",
        "packages/a/.env": "original .env",
        "packages/a/.env.local": "original .env.local",
        "packages/a/.development.env": "original .development.env",
      },
    );

    const originalBaseEnvContent = await fs.promises.readFile(
      "packages/a/.env",
      "utf8",
    );
    const originalLocalEnvContent = await fs.promises.readFile(
      "packages/a/.env.local",
      "utf8",
    );
    const originalDevelopmentEnvContent = await fs.promises.readFile(
      "packages/a/.development.env",
      "utf8",
    );

    const programState = await deriveProgramState();
    await syncEnvs(programState);

    const filesInTheAPackage = (await fs.promises.readdir(
      "packages/a",
    )) as string[];

    assert(filesInTheAPackage.includes(".env"), ".env was not copied");
    assert(
      filesInTheAPackage.includes(".env.local"),
      ".env.local was not copied",
    );
    assert(
      filesInTheAPackage.includes(".development.env"),
      ".development.env was not copied",
    );

    const newBaseEnvContent = await fs.promises.readFile(
      "packages/a/.env",
      "utf8",
    );
    const newLocalEnvContent = await fs.promises.readFile(
      "packages/a/.env.local",
      "utf8",
    );
    const newDevelopmentEnvContent = await fs.promises.readFile(
      "packages/a/.development.env",
      "utf8",
    );

    assert.notEqual(
      originalBaseEnvContent,
      newBaseEnvContent,
      ".env content was not changed",
    );
    assert.notEqual(
      originalLocalEnvContent,
      newLocalEnvContent,
      ".env.local content was not changed",
    );
    assert.notEqual(
      originalDevelopmentEnvContent,
      newDevelopmentEnvContent,
      ".development.env content was not changed",
    );
  });
});

describe("syncEnvs (multiple workspaces)", () => {
  it("Copies ENV files", async () => {
    configureVirtualFiles(
      {
        packageJson: {
          workspaces: ["packages/*"],
        },
      },
      {
        ".env": "foo=bar",
        ".env.local": "foo=bar",
        ".development.env": "foo=bar",
        "packages/a/package.json": "{}",
        "packages/b/package.json": "{}",
      },
    );

    const programState = await deriveProgramState();
    await syncEnvs(programState);

    const filesInTheAPackage = (await fs.promises.readdir(
      "packages/a",
    )) as string[];

    assert(
      filesInTheAPackage.includes(".env"),
      ".env was not copied to package A",
    );
    assert(
      filesInTheAPackage.includes(".env.local"),
      ".env.local was not copied to package A",
    );
    assert(
      filesInTheAPackage.includes(".development.env"),
      ".development.env was not copied to package A",
    );

    const filesInTheBPackage = (await fs.promises.readdir(
      "packages/b",
    )) as string[];

    assert(
      filesInTheBPackage.includes(".env"),
      ".env was not copied to package B",
    );
    assert(
      filesInTheBPackage.includes(".env.local"),
      ".env.local was not copied to package B",
    );
    assert(
      filesInTheBPackage.includes(".development.env"),
      ".development.env was not copied to package B",
    );
  });

  it("Overrides existing env files", async () => {
    configureVirtualFiles(
      {
        packageJson: {
          workspaces: ["packages/*"],
        },
      },
      {
        ".env": "a",
        ".env.local": "b",
        ".development.env": "c",
        "packages/a/package.json": "{}",
        "packages/a/.env": "original A .env",
        "packages/a/.env.local": "original A .env.local",
        "packages/a/.development.env": "original A .development.env",
        "packages/b/.env": "original B .env",
        "packages/b/.env.local": "original B .env.local",
        "packages/b/.development.env": "original B .development.env",
      },
    );

    const originalABaseEnvContent = await fs.promises.readFile(
      "packages/a/.env",
      "utf8",
    );
    const originalALocalEnvContent = await fs.promises.readFile(
      "packages/a/.env.local",
      "utf8",
    );
    const originalADevelopmentEnvContent = await fs.promises.readFile(
      "packages/a/.development.env",
      "utf8",
    );

    const originalBBaseEnvContent = await fs.promises.readFile(
      "packages/b/.env",
      "utf8",
    );
    const originalBLocalEnvContent = await fs.promises.readFile(
      "packages/b/.env.local",
      "utf8",
    );
    const originalBDevelopmentEnvContent = await fs.promises.readFile(
      "packages/b/.development.env",
      "utf8",
    );

    const programState = await deriveProgramState();
    await syncEnvs(programState);

    const filesInTheAPackage = (await fs.promises.readdir(
      "packages/a",
    )) as string[];

    assert(
      filesInTheAPackage.includes(".env"),
      ".env was not copied to package A",
    );
    assert(
      filesInTheAPackage.includes(".env.local"),
      ".env.local was not copied to package A",
    );
    assert(
      filesInTheAPackage.includes(".development.env"),
      ".development.env was not copied to package A",
    );

    const filesInTheBPackage = (await fs.promises.readdir(
      "packages/b",
    )) as string[];

    assert(
      filesInTheBPackage.includes(".env"),
      ".env was not copied to package B",
    );
    assert(
      filesInTheBPackage.includes(".env.local"),
      ".env.local was not copied to package B",
    );
    assert(
      filesInTheBPackage.includes(".development.env"),
      ".development.env was not copied to package B",
    );

    const newBaseAEnvContent = await fs.promises.readFile(
      "packages/a/.env",
      "utf8",
    );
    const newLocalAEnvContent = await fs.promises.readFile(
      "packages/a/.env.local",
      "utf8",
    );
    const newDevelopmentAEnvContent = await fs.promises.readFile(
      "packages/a/.development.env",
      "utf8",
    );

    assert.notEqual(
      originalABaseEnvContent,
      newBaseAEnvContent,
      "package A.env content was not changed",
    );
    assert.notEqual(
      originalALocalEnvContent,
      newLocalAEnvContent,
      "package A .env.local content was not changed",
    );
    assert.notEqual(
      originalADevelopmentEnvContent,
      newDevelopmentAEnvContent,
      "package A .development.env content was not changed",
    );

    const newBaseBEnvContent = await fs.promises.readFile(
      "packages/b/.env",
      "utf8",
    );
    const newLocalBEnvContent = await fs.promises.readFile(
      "packages/b/.env.local",
      "utf8",
    );
    const newDevelopmentBEnvContent = await fs.promises.readFile(
      "packages/b/.development.env",
      "utf8",
    );

    assert.notEqual(
      originalBBaseEnvContent,
      newBaseBEnvContent,
      "package B .env content was not changed",
    );
    assert.notEqual(
      originalBLocalEnvContent,
      newLocalBEnvContent,
      "package B .env.local content was not changed",
    );
    assert.notEqual(
      originalBDevelopmentEnvContent,
      newDevelopmentBEnvContent,
      "package B .development.env content was not changed",
    );

    // Make sure env files in both packages match
    assert.equal(
      newBaseAEnvContent,
      newBaseBEnvContent,
      "synced .env files do not match",
    );
    assert.equal(
      newLocalAEnvContent,
      newLocalBEnvContent,
      "synced .env.local files do not match",
    );
    assert.equal(
      newDevelopmentAEnvContent,
      newDevelopmentBEnvContent,
      "synced .development.env files do not match",
    );
  });
});
