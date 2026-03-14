import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    {
        ignores: ["dist", "node_modules", ".turbo"]
    },
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        }
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
        }
    },
    {
        // 🔒 ARCHITECTURE RULE: No direct env access (Global)
        files: ["**/*.{js,mjs,cjs,ts}"],
        rules: {
            "no-restricted-syntax": [
                "error",
                {
                    // Forbid process.env
                    selector: "MemberExpression[object.name='process'][property.name='env']",
                    message: "Direct access to process.env is FORBIDDEN. Use getEnv(c) from @repo/config."
                },
                {
                    // Forbid c.env
                    selector: "MemberExpression[object.name='c'][property.name='env']",
                    message: "Direct access to c.env is FORBIDDEN. Use getEnv(c) from @repo/config."
                }
            ]
        }
    },
    {
        // 🔒 ARCHITECTURE RULE: No hardcoded strings in LOGIC files
        // Excludes: index.ts (routing), worker.ts (entry), config/* (constants), tests
        files: ["src/**/*.ts"],
        ignores: ["src/index.ts", "src/worker.ts", "src/**/index.ts", "src/**/routes.ts", "src/config/**"],
        rules: {
            "no-restricted-syntax": [
                "error",
                {
                    selector: ":matches(CallExpression, ReturnStatement, ThrowStatement) > :matches(Literal[raw=/^[\"'`]/], TemplateLiteral[expressions.length=0])",
                    message: "Hardcoded strings are STRICTLY FORBIDDEN in logic files. Use constants from src/config/labels.ts."
                }
            ]
        }
    }
];
