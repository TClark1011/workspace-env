#!/usr/bin/env node
import { theCommand } from "@/cli/command";
import * as cmd from "cmd-ts";

cmd.run(theCommand, process.argv.slice(2));
