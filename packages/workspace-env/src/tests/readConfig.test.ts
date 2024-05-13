import { describe, it } from "node:test";
import { readConfig } from "..";
import { WorkspaceEnvConfigInput } from "../configTypes";
import assert from "assert";
import { configureVirtualFiles } from "./testUtils";

describe("config file reading", () => {
  it("Can read 100% filled out config", async () => {
    const basicConfig: WorkspaceEnvConfigInput = {
      workspaces: ["apps/*"],
      envDir: "env",
      syncEnvsTo: ["frontend"],
    };
    configureVirtualFiles({
      workspaceEnvConfig: basicConfig,
    });
    const config = await readConfig();
    assert.deepStrictEqual(config, basicConfig);
  });

  it("Applies defaults from package.json", async () => {
    configureVirtualFiles({
      workspaceEnvConfig: {},
      packageJson: {
        workspaces: ["packages/*"],
      },
    });
    const config = await readConfig();
    assert.deepStrictEqual(config, {
      workspaces: ["packages/*"],
      envDir: "./",
      syncEnvsTo: ["packages/*"],
    });
  });

  it("Applies defaults from pnpm-workspace.yaml", async () => {
    configureVirtualFiles({
      workspaceEnvConfig: {},
      pnpmWorkspaces: {
        packages: ["projects/*"],
      },
    });
    const config = await readConfig();
    assert.deepStrictEqual(config, {
      workspaces: ["projects/*"],
      envDir: "./",
      syncEnvsTo: ["projects/*"],
    });
  });

  describe("Applies defaults from package.json and handles override", () => {
    it("Overrides workspaces", async () => {
      configureVirtualFiles({
        workspaceEnvConfig: {
          workspaces: ["apps/*"],
        },
        packageJson: {
          workspaces: ["packages/*"],
        },
      });
      assert.deepStrictEqual(await readConfig(), {
        workspaces: ["apps/*"],
        envDir: "./",
        syncEnvsTo: ["apps/*"],
      });
    });

    it("Overrides envDir", async () => {
      configureVirtualFiles({
        workspaceEnvConfig: {
          envDir: "env",
        },
        packageJson: {
          workspaces: ["packages/*"],
        },
      });
      assert.deepStrictEqual(await readConfig(), {
        workspaces: ["packages/*"],
        envDir: "env",
        syncEnvsTo: ["packages/*"],
      });
    });

    it("Overrides syncEnvsTo", async () => {
      configureVirtualFiles({
        workspaceEnvConfig: {
          syncEnvsTo: ["frontend"],
        },
        packageJson: {
          workspaces: ["packages/*"],
        },
      });
      assert.deepStrictEqual(await readConfig(), {
        workspaces: ["packages/*"],
        envDir: "./",
        syncEnvsTo: ["frontend"],
      });
    });

    it("Overrides workspaces AND envDir", async () => {
      configureVirtualFiles({
        workspaceEnvConfig: {
          workspaces: ["apps/*"],
          envDir: "env",
        },
        packageJson: {
          workspaces: ["packages/*"],
        },
      });
      assert.deepStrictEqual(await readConfig(), {
        workspaces: ["apps/*"],
        envDir: "env",
        syncEnvsTo: ["apps/*"],
      });
    });

    it("Overrides workspaces AND syncEnvsTo", async () => {
      configureVirtualFiles({
        workspaceEnvConfig: {
          workspaces: ["apps/*"],
          syncEnvsTo: ["frontend"],
        },
        packageJson: {
          workspaces: ["packages/*"],
        },
      });
      assert.deepStrictEqual(await readConfig(), {
        workspaces: ["apps/*"],
        envDir: "./",
        syncEnvsTo: ["frontend"],
      });
    });

    it("Overrides envDir AND syncEnvsTo", async () => {
      configureVirtualFiles({
        workspaceEnvConfig: {
          envDir: "env",
          syncEnvsTo: ["frontend"],
        },
        packageJson: {
          workspaces: ["packages/*"],
        },
      });
      assert.deepStrictEqual(await readConfig(), {
        workspaces: ["packages/*"],
        envDir: "env",
        syncEnvsTo: ["frontend"],
      });
    });

    it("Overrides all", async () => {
      configureVirtualFiles({
        workspaceEnvConfig: {
          workspaces: ["apps/*"],
          envDir: "env",
          syncEnvsTo: ["frontend"],
        },
        packageJson: {
          workspaces: ["packages/*"],
        },
      });
      assert.deepStrictEqual(await readConfig(), {
        workspaces: ["apps/*"],
        envDir: "env",
        syncEnvsTo: ["frontend"],
      });
    });
  });

  describe("Applies defaults from pnpm-workspace.yaml and handles override", () => {
    it("Overrides workspaces", async () => {
      configureVirtualFiles({
        workspaceEnvConfig: {
          workspaces: ["apps/*"],
        },
        pnpmWorkspaces: {
          packages: ["packages/*"],
        },
      });
      assert.deepStrictEqual(await readConfig(), {
        workspaces: ["apps/*"],
        envDir: "./",
        syncEnvsTo: ["apps/*"],
      });
    });

    it("Overrides envDir", async () => {
      configureVirtualFiles({
        workspaceEnvConfig: {
          envDir: "env",
        },
        pnpmWorkspaces: {
          packages: ["packages/*"],
        },
      });
      assert.deepStrictEqual(await readConfig(), {
        workspaces: ["packages/*"],
        envDir: "env",
        syncEnvsTo: ["packages/*"],
      });
    });

    it("Overrides syncEnvsTo", async () => {
      configureVirtualFiles({
        workspaceEnvConfig: {
          syncEnvsTo: ["frontend"],
        },
        pnpmWorkspaces: {
          packages: ["packages/*"],
        },
      });
      assert.deepStrictEqual(await readConfig(), {
        workspaces: ["packages/*"],
        envDir: "./",
        syncEnvsTo: ["frontend"],
      });
    });

    it("Overrides workspaces AND envDir", async () => {
      configureVirtualFiles({
        workspaceEnvConfig: {
          workspaces: ["apps/*"],
          envDir: "env",
        },
        pnpmWorkspaces: {
          packages: ["packages/*"],
        },
      });
      assert.deepStrictEqual(await readConfig(), {
        workspaces: ["apps/*"],
        envDir: "env",
        syncEnvsTo: ["apps/*"],
      });
    });

    it("Overrides workspaces AND syncEnvsTo", async () => {
      configureVirtualFiles({
        workspaceEnvConfig: {
          workspaces: ["apps/*"],
          syncEnvsTo: ["frontend"],
        },
        pnpmWorkspaces: {
          packages: ["packages/*"],
        },
      });
      assert.deepStrictEqual(await readConfig(), {
        workspaces: ["apps/*"],
        envDir: "./",
        syncEnvsTo: ["frontend"],
      });
    });

    it("Overrides envDir AND syncEnvsTo", async () => {
      configureVirtualFiles({
        workspaceEnvConfig: {
          envDir: "env",
          syncEnvsTo: ["frontend"],
        },
        pnpmWorkspaces: {
          packages: ["packages/*"],
        },
      });
      assert.deepStrictEqual(await readConfig(), {
        workspaces: ["packages/*"],
        envDir: "env",
        syncEnvsTo: ["frontend"],
      });
    });

    it("Overrides all", async () => {
      configureVirtualFiles({
        workspaceEnvConfig: {
          workspaces: ["apps/*"],
          envDir: "env",
          syncEnvsTo: ["frontend"],
        },
        pnpmWorkspaces: {
          packages: ["packages/*"],
        },
      });
      assert.deepStrictEqual(await readConfig(), {
        workspaces: ["apps/*"],
        envDir: "env",
        syncEnvsTo: ["frontend"],
      });
    });
  });
});
