import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
// import boundaries from "eslint-plugin-boundaries"; // Disabled for now

/** @type {import('eslint').Linter.Config[]} */
export default [
    { ignores: ["**/cli.ts"] },
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-explicit-any": "warn"
        }
    }
];
