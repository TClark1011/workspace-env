import { describe, it, assert, expect } from "vitest";
import { deriveProgramState } from "@/deriveProgramState";
import { configureVirtualFiles, psm } from "./testUtils";
import { DEFAULT_ENV_FILE_PATTERNS } from "@/constants";

/**
 * TODO: test envFilePatterns method
 */

describe("Derive Program State Without CLI Args", () => {
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
    const programState = await deriveProgramState();
    expect(programState).toMatchObject(
      psm({
        workspacePaths: ["apps/frontend"],
        envDirectoryPath: "env",
        syncEnvsToWorkspaceDirectoryNames: ["frontend"],
        envFilePatterns: expect.arrayContaining(DEFAULT_ENV_FILE_PATTERNS),
      }),
    );
    assert.sameMembers(programState.envFilePatterns, DEFAULT_ENV_FILE_PATTERNS);
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

    const programState = await deriveProgramState();
    assert.sameMembers(programState.workspacePaths, [
      "packages/frontend",
      "packages/backend",
      "packages/utils",
    ]);
    assert.sameMembers(programState.syncEnvsToWorkspaceDirectoryNames, [
      "frontend",
      "backend",
    ]);
    assert.sameMembers(programState.envFilePatterns, DEFAULT_ENV_FILE_PATTERNS);
    expect(programState.envDirectoryPath).toEqual("./");
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
    const programState = await deriveProgramState();
    expect(programState).toMatchObject(
      psm({
        workspacePaths: ["packages/package1"],
        envDirectoryPath: "./",
        syncEnvsToWorkspaceDirectoryNames: ["package1"],
        envFilePatterns: expect.arrayContaining(DEFAULT_ENV_FILE_PATTERNS),
      }),
    );
    assert.sameMembers(programState.envFilePatterns, DEFAULT_ENV_FILE_PATTERNS);
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
    const programState = await deriveProgramState();
    expect(programState).toMatchObject(
      psm({
        workspacePaths: ["projects/project1"],
        envDirectoryPath: "./",
        syncEnvsToWorkspaceDirectoryNames: ["project1"],
        envFilePatterns: expect.arrayContaining(DEFAULT_ENV_FILE_PATTERNS),
      }),
    );
    assert.sameMembers(programState.envFilePatterns, DEFAULT_ENV_FILE_PATTERNS);
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
      const programState = await deriveProgramState();
      expect(programState).toMatchObject(
        psm({
          workspacePaths: ["apps/frontend"],
          envDirectoryPath: "./",
          syncEnvsToWorkspaceDirectoryNames: ["frontend"],
          envFilePatterns: expect.arrayContaining(DEFAULT_ENV_FILE_PATTERNS),
        }),
      );
      assert.sameMembers(
        programState.envFilePatterns,
        DEFAULT_ENV_FILE_PATTERNS,
      );
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

      const programState = await deriveProgramState();
      expect(programState).toMatchObject(
        psm({
          workspacePaths: ["packages/packageA"],
          envDirectoryPath: "env",
          syncEnvsToWorkspaceDirectoryNames: ["packageA"],
        }),
      );
      assert.sameMembers(
        programState.envFilePatterns,
        DEFAULT_ENV_FILE_PATTERNS,
      );
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

      const programState = await deriveProgramState();
      expect(programState).toMatchObject(
        psm({
          envDirectoryPath: "./",
          syncEnvsToWorkspaceDirectoryNames: ["frontend"],
        }),
      );
      assert.sameMembers(programState.workspacePaths, [
        "apps/frontend",
        "apps/backend",
      ]);
      assert.sameMembers(
        programState.envFilePatterns,
        DEFAULT_ENV_FILE_PATTERNS,
      );
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

      const programState = await deriveProgramState();
      expect(programState).toMatchObject(
        psm({
          workspacePaths: ["apps/frontend"],
          envDirectoryPath: "env",
          syncEnvsToWorkspaceDirectoryNames: ["frontend"],
        }),
      );
      assert.sameMembers(
        programState.envFilePatterns,
        DEFAULT_ENV_FILE_PATTERNS,
      );
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
      const programState = await deriveProgramState();
      expect(programState).toMatchObject(
        psm({
          envDirectoryPath: "./",
          syncEnvsToWorkspaceDirectoryNames: ["frontend"],
        }),
      );
      assert.sameMembers(programState.workspacePaths, [
        "apps/frontend",
        "apps/backend",
      ]);
      assert.sameMembers(
        programState.envFilePatterns,
        DEFAULT_ENV_FILE_PATTERNS,
      );
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
      const programState = await deriveProgramState();
      expect(programState).toMatchObject(
        psm({
          workspacePaths: ["packages/frontend"],
          envDirectoryPath: "env",
          syncEnvsToWorkspaceDirectoryNames: ["frontend"],
        }),
      );
      assert.sameMembers(
        programState.envFilePatterns,
        DEFAULT_ENV_FILE_PATTERNS,
      );
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

      const programState = await deriveProgramState();
      expect(programState).toMatchObject(
        psm({
          envDirectoryPath: "env",
          syncEnvsToWorkspaceDirectoryNames: ["frontend"],
        }),
      );
      assert.sameMembers(programState.workspacePaths, [
        "apps/frontend",
        "apps/backend",
      ]);
      assert.sameMembers(
        programState.envFilePatterns,
        DEFAULT_ENV_FILE_PATTERNS,
      );
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

      const programState = await deriveProgramState();
      expect(programState).toMatchObject(
        psm({
          workspacePaths: ["apps/frontend"],
          envDirectoryPath: "./",
          syncEnvsToWorkspaceDirectoryNames: ["frontend"],
        }),
      );
      assert.sameMembers(
        programState.envFilePatterns,
        DEFAULT_ENV_FILE_PATTERNS,
      );
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

      const programState = await deriveProgramState();
      expect(programState).toMatchObject(
        psm({
          workspacePaths: ["packages/packageA"],
          envDirectoryPath: "env",
          syncEnvsToWorkspaceDirectoryNames: ["packageA"],
        }),
      );
      assert.sameMembers(
        programState.envFilePatterns,
        DEFAULT_ENV_FILE_PATTERNS,
      );
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

      const programState = await deriveProgramState();
      expect(programState).toMatchObject(
        psm({
          envDirectoryPath: "./",
          syncEnvsToWorkspaceDirectoryNames: ["frontend"],
        }),
      );
      assert.sameMembers(programState.workspacePaths, [
        "apps/frontend",
        "apps/backend",
      ]);
      assert.sameMembers(
        programState.envFilePatterns,
        DEFAULT_ENV_FILE_PATTERNS,
      );
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

      const programState = await deriveProgramState();
      expect(programState).toMatchObject(
        psm({
          workspacePaths: ["apps/frontend"],
          envDirectoryPath: "env",
          syncEnvsToWorkspaceDirectoryNames: ["frontend"],
        }),
      );
      assert.sameMembers(
        programState.envFilePatterns,
        DEFAULT_ENV_FILE_PATTERNS,
      );
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

      const programState = await deriveProgramState();
      expect(programState).toMatchObject(
        psm({
          envDirectoryPath: "./",
          syncEnvsToWorkspaceDirectoryNames: ["frontend"],
        }),
      );
      assert.sameMembers(programState.workspacePaths, [
        "apps/frontend",
        "apps/backend",
      ]);
      assert.sameMembers(
        programState.envFilePatterns,
        DEFAULT_ENV_FILE_PATTERNS,
      );
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

      const programState = await deriveProgramState();
      expect(programState).toMatchObject(
        psm({
          workspacePaths: ["packages/frontend"],
          envDirectoryPath: "env",
          syncEnvsToWorkspaceDirectoryNames: ["frontend"],
        }),
      );
      assert.sameMembers(
        programState.envFilePatterns,
        DEFAULT_ENV_FILE_PATTERNS,
      );
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

      const programState = await deriveProgramState();
      expect(programState).toMatchObject(
        psm({
          envDirectoryPath: "env",
          syncEnvsToWorkspaceDirectoryNames: ["frontend"],
        }),
      );
      assert.sameMembers(programState.workspacePaths, [
        "apps/frontend",
        "apps/backend",
      ]);
      assert.sameMembers(
        programState.envFilePatterns,
        DEFAULT_ENV_FILE_PATTERNS,
      );
    });
  });
});

describe.todo("With CLI Args");
