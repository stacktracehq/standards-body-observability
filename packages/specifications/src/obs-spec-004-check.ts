import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { NonConformanceType as NonConformance } from "@standards-body/core-specifications/core";

async function findHookFiles(repoRoot: string): Promise<string[]> {
	const hooksDir = path.join(repoRoot, "hooks");
	const files: string[] = [];

	try {
		const entries = await fs.readdir(hooksDir, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.isFile() && entry.name.endsWith(".ts")) {
				files.push(path.join(hooksDir, entry.name));
			}
		}
	} catch {
		// hooks directory doesn't exist
	}

	return files;
}

export async function checkHookLoggingFast(repoRoot: string): Promise<NonConformance[]> {
	const findings: NonConformance[] = [];
	const hookFiles = await findHookFiles(repoRoot);

	if (hookFiles.length === 0) {
		return findings;
	}

	for (const file of hookFiles) {
		const relPath = path.relative(repoRoot, file);
		let content: string;
		try {
			content = await fs.readFile(file, "utf-8");
		} catch {
			continue;
		}

		if (!content.includes("@logtape/logtape")) {
			findings.push({
				file: relPath,
				message:
					"Hook file does not import from @logtape/logtape. Hooks must use LogTape for logging.",
			});
			continue;
		}

		if (!/performance\.now\(\)|Date\.now\(\)/.test(content)) {
			findings.push({
				file: relPath,
				message:
					"Hook file does not include timing instrumentation (performance.now() or Date.now()).",
			});
		}
	}

	return findings;
}

export async function checkHookLoggingThorough(repoRoot: string): Promise<NonConformance[]> {
	const findings = await checkHookLoggingFast(repoRoot);

	if (findings.length > 0) {
		return findings;
	}

	const hookFiles = await findHookFiles(repoRoot);

	for (const file of hookFiles) {
		const relPath = path.relative(repoRoot, file);
		let content: string;
		try {
			content = await fs.readFile(file, "utf-8");
		} catch {
			continue;
		}

		if (!/getLogger\s*\(\s*\[.*"standards-body"/.test(content)) {
			findings.push({
				file: relPath,
				message:
					'LogTape category does not follow required format ["standards-body", "<plugin-name>", "hooks", "<hook-name>"].',
			});
		}

		if (/console\.log\s*\(/.test(content)) {
			findings.push({
				file: relPath,
				message:
					"Hook uses console.log() which writes unstructured output to stdout. Use LogTape instead.",
			});
		}
	}

	return findings;
}
