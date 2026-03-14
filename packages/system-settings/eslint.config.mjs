
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";

export default tseslint.config(
    { ignores: ["dist", "node_modules"] },
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
        languageOptions: { globals: globals.node },
        plugins: {
            boundaries
        },
        settings: {
            "boundaries/include": ["src/**/*"],
            "boundaries/elements": [
                { type: "config", pattern: "src/config/*" },
                { type: "services", pattern: "src/services/*" },
                { type: "types", pattern: "src/types/*" }
            ]
        },
        extends: [pluginJs.configs.recommended, ...tseslint.configs.recommended],
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',

            // 🔒 ARCHITECTURE RULE: No direct DB access in Services
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['drizzle-orm', '@repo/database', 'drizzle-orm/*'],
                            message: '❌ VIOLATION: Service cannot import database directly. Inject IRepository interfaces instead.'
                        }
                    ]
                }
            ],

            // 🔒 ARCHITECTURE RULE: No hardcoded strings or direct env access
            'no-restricted-syntax': [
                'error',
                {
                    // Selector Explanation:
                    // 1. Target Literals that start with quotes (strings) OR static Template Literals.
                    // 2. This automatically excludes null, boolean, numbers.
                    // 3. Excludes Imports, Properties, etc. via parent check (Call/Return/Throw only).
                    selector: ":matches(CallExpression, ReturnStatement, ThrowStatement) > :matches(Literal[raw=/^[\"'`]/], TemplateLiteral[expressions.length=0])",
                    message: "Hardcoded strings are STRICTLY FORBIDDEN in logic files. Use constants from src/config/labels.ts."
                },
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
    }
);
