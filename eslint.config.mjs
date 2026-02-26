import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		// Disable type-checked rules for JS config files
		files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
		extends: [tseslint.configs.disableTypeChecked],
	},
	{
		ignores: ["node_modules/", "dist/", ".turbo/"],
	},
);
