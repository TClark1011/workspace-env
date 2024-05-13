/**
 * This file is auto-imported by the test environment.
 */

import fs from "fs/promises";
import { fs as virtualFs } from "memfs";
import { mock } from "node:test";

/**
 * Mock all fs calls with an in-memory file system.
 */
mock.method(fs, "readFile", virtualFs.promises.readFile);
mock.method(fs, "writeFile", virtualFs.promises.writeFile);
mock.method(fs, "appendFile", virtualFs.promises.appendFile);
mock.method(fs, "unlink", virtualFs.promises.unlink);
mock.method(fs, "readdir", virtualFs.promises.readdir);
mock.method(fs, "mkdir", virtualFs.promises.mkdir);
mock.method(fs, "rmdir", virtualFs.promises.rmdir);
mock.method(fs, "rm", virtualFs.promises.rm);
mock.method(fs, "open", virtualFs.promises.open);
mock.method(fs, "opendir", virtualFs.promises.opendir);
mock.method(fs, "access", virtualFs.promises.access);
mock.method(fs, "stat", virtualFs.promises.stat);
mock.method(fs, "rename", virtualFs.promises.rename);
mock.method(fs, "copyFile", virtualFs.promises.copyFile);
mock.method(fs, "symlink", virtualFs.promises.symlink);
mock.method(fs, "readlink", virtualFs.promises.readlink);
mock.method(fs, "realpath", virtualFs.promises.realpath);
mock.method(fs, "chmod", virtualFs.promises.chmod);
mock.method(fs, "lchmod", virtualFs.promises.lchmod);
mock.method(fs, "lchown", virtualFs.promises.lchown);
mock.method(fs, "link", virtualFs.promises.link);
mock.method(fs, "utimes", virtualFs.promises.utimes);
mock.method(fs, "mkdtemp", virtualFs.promises.mkdtemp);
