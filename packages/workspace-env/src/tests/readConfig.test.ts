import { describe, it, assert } from "vitest";
import { readConfig } from "@/readConfig";
import { configureVirtualFiles } from "./testUtils";
import { defaultEnvFilePatterns } from "@/configTypes";

/**
 * TODO: test envFilePatterns method
 */

describe("config file reading", () => {
  it("Can read 100% filled out config", async () => {
    configureVirtualFiles(
      {
        workspaceEnvConfig: {
          workspaces: ["apps/*"],
          envDir: "env",
          syncEnvsTo: ["frontend"],
        },
      },
      {
        "apps/frontend/package.json": JSON.stringify({}),
      },
    );
    assert.deepStrictEqual(await readConfig(), {
      workspaces: new Set(["apps/frontend"]),
      envDir: "env",
      syncEnvsTo: new Set(["frontend"]),
      envFilePatterns: new Set(defaultEnvFilePatterns),
    });
  });

  it("Correctly reads custom syncEnvsTo", async () => {
    configureVirtualFiles(
      {
        workspaceEnvConfig: {
          syncEnvsTo: ["frontend", "backend"],
        },
        packageJson: {
          workspaces: ["packages/*"],
        },
      },
      {
        "packages/frontend/package.json": JSON.stringify({}),
        "packages/backend/package.json": JSON.stringify({}),
        "packages/utils/package.json": JSON.stringify({}),
      },
    );

    assert.deepStrictEqual(await readConfig(), {
      workspaces: new Set([
        "packages/frontend",
        "packages/backend",
        "packages/utils",
      ]),
      envDir: "./",
      syncEnvsTo: new Set(["frontend", "backend"]),
      envFilePatterns: new Set(defaultEnvFilePatterns),
    });
  });

  it("Applies defaults from package.json", async () => {
    configureVirtualFiles(
      {
        workspaceEnvConfig: {},
        packageJson: {
          workspaces: ["packages/*"],
        },
      },
      {
        "packages/package1/package.json": "{}",
      },
    );
    assert.deepStrictEqual(await readConfig(), {
      workspaces: new Set(["packages/package1"]),
      envDir: "./",
      syncEnvsTo: new Set(["package1"]),
      envFilePatterns: new Set(defaultEnvFilePatterns),
    });
  });

  it("Applies defaults from pnpm-workspace.yaml", async () => {
    configureVirtualFiles(
      {
        workspaceEnvConfig: {},
        pnpmWorkspaces: {
          packages: ["projects/*"],
        },
      },
      {
        "projects/project1/package.json": "{}",
      },
    );
    assert.deepStrictEqual(await readConfig(), {
      workspaces: new Set(["projects/project1"]),
      envDir: "./",
      syncEnvsTo: new Set(["project1"]),
      envFilePatterns: new Set(defaultEnvFilePatterns),
    });
  });

  describe("Applies defaults from package.json and handles override", () => {
    it("Overrides workspaces", async () => {
      configureVirtualFiles(
        {
          workspaceEnvConfig: {
            workspaces: ["apps/*"],
          },
          packageJson: {
            workspaces: ["packages/*"],
          },
        },
        {
          "apps/frontend/package.json": JSON.stringify({}),
        },
      );
      assert.deepStrictEqual(await readConfig(), {
        workspaces: new Set(["apps/frontend"]),
        envDir: "./",
        syncEnvsTo: new Set(["frontend"]),
        envFilePatterns: new Set(defaultEnvFilePatterns),
      });
    });

    it("Overrides envDir", async () => {
      configureVirtualFiles(
        {
          workspaceEnvConfig: {
            envDir: "env",
          },
          packageJson: {
            workspaces: ["packages/*"],
          },
        },
        {
          "packages/packageA/package.json": "{}",
        },
      );
      assert.deepStrictEqual(await readConfig(), {
        workspaces: new Set(["packages/packageA"]),
        envDir: "env",
        syncEnvsTo: new Set(["packageA"]),
        envFilePatterns: new Set(defaultEnvFilePatterns),
      });
    });

    it("Overrides syncEnvsTo", async () => {
      configureVirtualFiles(
        {
          workspaceEnvConfig: {
            syncEnvsTo: ["frontend"],
          },
          packageJson: {
            workspaces: ["apps/*"],
          },
        },
        {
          "apps/frontend/package.json": JSON.stringify({}),
          "apps/backend/package.json": JSON.stringify({}),
        },
      );
      assert.deepStrictEqual(await readConfig(), {
        workspaces: new Set(["apps/frontend", "apps/backend"]),
        envDir: "./",
        syncEnvsTo: new Set(["frontend"]),
        envFilePatterns: new Set(defaultEnvFilePatterns),
      });
    });

    it("Overrides workspaces AND envDir", async () => {
      configureVirtualFiles(
        {
          workspaceEnvConfig: {
            workspaces: ["apps/*"],
            envDir: "env",
          },
          packageJson: {
            workspaces: ["packages/*"],
          },
        },
        {
          "apps/frontend/package.json": "{}",
        },
      );
      assert.deepStrictEqual(await readConfig(), {
        workspaces: new Set(["apps/frontend"]),
        envDir: "env",
        syncEnvsTo: new Set(["frontend"]),
        envFilePatterns: new Set(defaultEnvFilePatterns),
      });
    });

    it("Overrides workspaces AND syncEnvsTo", async () => {
      configureVirtualFiles(
        {
          workspaceEnvConfig: {
            workspaces: ["apps/*"],
            syncEnvsTo: ["frontend"],
          },
          packageJson: {
            workspaces: ["packages/*"],
          },
        },
        {
          "apps/frontend/package.json": "{}",
          "apps/backend/package.json": "{}",
          "packages/ignored/package.json": "{}",
        },
      );
      assert.deepStrictEqual(await readConfig(), {
        workspaces: new Set(["apps/frontend", "apps/backend"]),
        envDir: "./",
        syncEnvsTo: new Set(["frontend"]),
        envFilePatterns: new Set(defaultEnvFilePatterns),
      });
    });

    it("Overrides envDir AND syncEnvsTo", async () => {
      configureVirtualFiles(
        {
          workspaceEnvConfig: {
            envDir: "env",
            syncEnvsTo: ["frontend"],
          },
          packageJson: {
            workspaces: ["packages/*"],
          },
        },
        {
          "packages/frontend/package.json": JSON.stringify({}),
        },
      );
      assert.deepStrictEqual(await readConfig(), {
        workspaces: new Set(["packages/frontend"]),
        envDir: "env",
        syncEnvsTo: new Set(["frontend"]),
        envFilePatterns: new Set(defaultEnvFilePatterns),
      });
    });

    it("Overrides all", async () => {
      configureVirtualFiles(
        {
          workspaceEnvConfig: {
            workspaces: ["apps/*"],
            envDir: "env",
            syncEnvsTo: ["frontend"],
          },
          packageJson: {
            workspaces: ["packages/*"],
          },
        },
        {
          "apps/frontend/package.json": "{}",
          "apps/backend/package.json": "{}",
          "packages/ignored/package.json": "{}",
        },
      );
      assert.deepStrictEqual(await readConfig(), {
        workspaces: new Set(["apps/frontend", "apps/backend"]),
        envDir: "env",
        syncEnvsTo: new Set(["frontend"]),
        envFilePatterns: new Set(defaultEnvFilePatterns),
      });
    });
  });

  describe("Applies defaults from pnpm-workspace.yaml and handles override", () => {
    it("Overrides workspaces", async () => {
      configureVirtualFiles(
        {
          workspaceEnvConfig: {
            workspaces: ["apps/*"],
          },
          pnpmWorkspaces: {
            packages: ["packages/*"],
          },
        },
        {
          "apps/frontend/package.json": JSON.stringify({}),
        },
      );
      assert.deepStrictEqual(await readConfig(), {
        workspaces: new Set(["apps/frontend"]),
        envDir: "./",
        syncEnvsTo: new Set(["frontend"]),
        envFilePatterns: new Set(defaultEnvFilePatterns),
      });
    });

    it("Overrides envDir", async () => {
      configureVirtualFiles(
        {
          workspaceEnvConfig: {
            envDir: "env",
          },
          pnpmWorkspaces: {
            packages: ["packages/*"],
          },
        },
        {
          "packages/packageA/package.json": "{}",
        },
      );
      assert.deepStrictEqual(await readConfig(), {
        workspaces: new Set(["packages/packageA"]),
        envDir: "env",
        syncEnvsTo: new Set(["packageA"]),
        envFilePatterns: new Set(defaultEnvFilePatterns),
      });
    });

    it("Overrides syncEnvsTo", async () => {
      configureVirtualFiles(
        {
          workspaceEnvConfig: {
            syncEnvsTo: ["frontend"],
          },
          pnpmWorkspaces: {
            packages: ["apps/*"],
          },
        },
        {
          "apps/frontend/package.json": JSON.stringify({}),
          "apps/backend/package.json": JSON.stringify({}),
        },
      );
      assert.deepStrictEqual(await readConfig(), {
        workspaces: new Set(["apps/frontend", "apps/backend"]),
        envDir: "./",
        syncEnvsTo: new Set(["frontend"]),
        envFilePatterns: new Set(defaultEnvFilePatterns),
      });
    });

    it("Overrides workspaces AND envDir", async () => {
      configureVirtualFiles(
        {
          workspaceEnvConfig: {
            workspaces: ["apps/*"],
            envDir: "env",
          },
          pnpmWorkspaces: {
            packages: ["packages/*"],
          },
        },
        {
          "apps/frontend/package.json": "{}",
        },
      );
      assert.deepStrictEqual(await readConfig(), {
        workspaces: new Set(["apps/frontend"]),
        envDir: "env",
        syncEnvsTo: new Set(["frontend"]),
        envFilePatterns: new Set(defaultEnvFilePatterns),
      });
    });

    it("Overrides workspaces AND syncEnvsTo", async () => {
      configureVirtualFiles(
        {
          workspaceEnvConfig: {
            workspaces: ["apps/*"],
            syncEnvsTo: ["frontend"],
          },
          pnpmWorkspaces: {
            packages: ["packages/*"],
          },
        },
        {
          "apps/frontend/package.json": "{}",
          "apps/backend/package.json": "{}",
          "packages/ignored/package.json": "{}",
        },
      );
      assert.deepStrictEqual(await readConfig(), {
        workspaces: new Set(["apps/frontend", "apps/backend"]),
        envDir: "./",
        syncEnvsTo: new Set(["frontend"]),
        envFilePatterns: new Set(defaultEnvFilePatterns),
      });
    });

    it("Overrides envDir AND syncEnvsTo", async () => {
      configureVirtualFiles(
        {
          workspaceEnvConfig: {
            envDir: "env",
            syncEnvsTo: ["frontend"],
          },
          pnpmWorkspaces: {
            packages: ["packages/*"],
          },
        },
        {
          "packages/frontend/package.json": JSON.stringify({}),
        },
      );
      assert.deepStrictEqual(await readConfig(), {
        workspaces: new Set(["packages/frontend"]),
        envDir: "env",
        syncEnvsTo: new Set(["frontend"]),
        envFilePatterns: new Set(defaultEnvFilePatterns),
      });
    });

    it("Overrides all", async () => {
      configureVirtualFiles(
        {
          workspaceEnvConfig: {
            workspaces: ["apps/*"],
            envDir: "env",
            syncEnvsTo: ["frontend"],
          },
          pnpmWorkspaces: {
            packages: ["packages/*"],
          },
        },
        {
          "apps/frontend/package.json": "{}",
          "apps/backend/package.json": "{}",
          "packages/ignored/package.json": "{}",
        },
      );
      assert.deepStrictEqual(await readConfig(), {
        workspaces: new Set(["apps/frontend", "apps/backend"]),
        envDir: "env",
        syncEnvsTo: new Set(["frontend"]),
        envFilePatterns: new Set(defaultEnvFilePatterns),
      });
    });
  });
});
