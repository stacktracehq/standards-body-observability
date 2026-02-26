import { specCommand } from "./commands/spec/index.ts";
import { runCLI } from "./stdlib.ts";

const exitCode = await runCLI([specCommand], {
	programName: "run",
	help: "option",
	version: "0.0.1",
	completion: "option",
	colors: true,
});

process.exit(exitCode);
