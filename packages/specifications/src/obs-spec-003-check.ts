import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { NonConformanceType as NonConformance } from "@standards-body/core-specifications/core";

interface PackageJson {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
}

async function readJson(filePath: string): Promise<unknown> {
	try {
		const content = await fs.readFile(filePath, "utf-8");
		return JSON.parse(content) as unknown;
	} catch {
		return null;
	}
}

async function getWorkspacePackagePaths(repoRoot: string): Promise<string[]> {
	const paths = [path.join(repoRoot, "package.json")];

	let workspaceContent: string;
	try {
		workspaceContent = await fs.readFile(path.join(repoRoot, "pnpm-workspace.yaml"), "utf-8");
	} catch {
		return paths;
	}

	const packagePatterns: string[] = [];
	const lines = workspaceContent.split("\n");
	let inPackages = false;
	for (const line of lines) {
		if (line.startsWith("packages:")) {
			inPackages = true;
			continue;
		}
		if (inPackages) {
			const match = /^\s+-\s+['"]?([^'"]+)['"]?/.exec(line);
			if (match?.[1]) {
				packagePatterns.push(match[1]);
			} else if (/^\S/.test(line)) {
				break;
			}
		}
	}

	for (const pattern of packagePatterns) {
		const base = pattern.replace(/\/\*$/, "").replace(/\*$/, "");
		if (!base) continue;
		try {
			const dir = path.join(repoRoot, base);
			const entries = await fs.readdir(dir, { withFileTypes: true });
			for (const entry of entries) {
				if (entry.isDirectory()) {
					const pkgPath = path.join(dir, entry.name, "package.json");
					try {
						await fs.access(pkgPath);
						paths.push(pkgPath);
					} catch {
						// no package.json in this dir
					}
				}
			}
		} catch {
			// directory doesn't exist
		}
	}

	return paths;
}

function hasPackage(pkg: PackageJson, name: string): boolean {
	return (
		(pkg.dependencies !== undefined && name in pkg.dependencies) ||
		(pkg.devDependencies !== undefined && name in pkg.devDependencies)
	);
}

export async function checkLogtapeOtelFast(repoRoot: string): Promise<NonConformance[]> {
	const findings: NonConformance[] = [];

	const packagePaths = await getWorkspacePackagePaths(repoRoot);
	let hasLogtape = false;
	let hasOtelSink = false;

	for (const pkgPath of packagePaths) {
		const pkg = (await readJson(pkgPath)) as PackageJson | null;
		if (!pkg) continue;

		if (hasPackage(pkg, "@logtape/logtape")) hasLogtape = true;
		if (hasPackage(pkg, "@logtape/otel")) hasOtelSink = true;
	}

	if (!hasLogtape) {
		findings.push({
			message:
				"@logtape/logtape is not found in any package.json dependencies. All TypeScript projects must use LogTape.",
		});
	}

	if (!hasOtelSink) {
		findings.push({
			message:
				"@logtape/otel is not found in any package.json dependencies. LogTape must be configured with the OTEL sink.",
		});
	}

	return findings;
}

async function findSourceFiles(dir: string, extensions: string[]): Promise<string[]> {
	const results: string[] = [];

	try {
		const entries = await fs.readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				if (
					entry.name === "node_modules" ||
					entry.name === ".git" ||
					entry.name === "dist"
				) {
					continue;
				}
				const nested = await findSourceFiles(fullPath, extensions);
				results.push(...nested);
			} else if (extensions.some((ext) => entry.name.endsWith(ext))) {
				results.push(fullPath);
			}
		}
	} catch {
		// directory not readable
	}

	return results;
}

export async function checkLogtapeOtelThorough(repoRoot: string): Promise<NonConformance[]> {
	const findings = await checkLogtapeOtelFast(repoRoot);

	if (findings.length > 0) {
		return findings;
	}

	const sourceFiles = await findSourceFiles(repoRoot, [".ts", ".tsx", ".mts"]);
	let foundOtelSinkUsage = false;

	for (const file of sourceFiles) {
		let content: string;
		try {
			content = await fs.readFile(file, "utf-8");
		} catch {
			continue;
		}

		if (/getOpenTelemetrySink|OtelSink/.test(content) && /configure\s*\(/.test(content)) {
			foundOtelSinkUsage = true;
			break;
		}
	}

	if (!foundOtelSinkUsage) {
		findings.push({
			message:
				"No LogTape configure() call with OTEL sink found in source files. LogTape must be configured with getOpenTelemetrySink().",
		});
	}

	return findings;
}
