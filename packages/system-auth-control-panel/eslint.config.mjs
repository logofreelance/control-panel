import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            boundaries
        },
        settings: {
            "boundaries/include": ["src/**/*"],
            "boundaries/elements": [
                {
                    type: "config",
                    pattern: "src/config/*"
                },
                {
                    type: "services",
                    pattern: "src/services/*"
                },
                {
                    type: "server",
                    pattern: "src/server/*"
                }
            ]
        },
        rules: {
            // Aturan Arsitektur Ketat
            "boundaries/element-types": [
                "error",
                {
                    default: "disallow",
                    rules: [
                        {
                            from: "server",
                            allow: ["services", "config"]
                        },
                        {
                            from: "services",
                            allow: ["config"]
                        },
                        {
                            from: "config",
                            allow: [] // Config tidak boleh import apapun dari layer lain
                        }
                    ]
                }
            ],
            // Aturan No Hardcode Refined
            "no-restricted-syntax": [
                "error",
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
    },
    // Exception: Allow strings in config files
    {
        files: ["src/config/*.ts"],
        rules: {
            "no-restricted-syntax": "off"
        }
    }
];
