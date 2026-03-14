import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ============================================
  // AI COMPLIANCE RULES - PURE DI ENFORCEMENT
  // Force usage of useConfig() hook for all config/api
  // ============================================
  {
    rules: {
      // Warn on console.log (use proper logging)
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Enforce Pure DI - block all non-centralized imports
      'no-restricted-imports': ['error', {
        patterns: [
          // ❌ BLOCK: Direct module config imports (use useConfig().defaults)
          {
            group: ['**/modules/data-sources/config', '**/modules/data-sources/config/*'],
            message: '❌ Use useConfig() hook. Import: const { defaults, msg } = useConfig()',
          },
          // ❌ BLOCK: Direct module api imports in components (use useConfig().api)
          {
            group: ['**/modules/data-sources/api', '**/modules/data-sources/api/*'],
            message: '❌ Use useConfig().api hook. Import: const { api } = useConfig()',
          },
          // ❌ BLOCK: lucide-react (use @repo/config Icons)
          {
            group: ['lucide-react'],
            message: '❌ Import Icons from @repo/config instead. Use: import { Icons } from "@repo/config"',
          },
          // ❌ BLOCK: _core/icons (use @repo/config Icons)  
          {
            group: ['@/modules/_core/icons', '@/modules/_core/icons/*'],
            message: '❌ Import Icons from @repo/config instead. Use: import { Icons } from "@repo/config"',
          },
        ],
      }],
      // ❌ BLOCK: process.env (General Rule for .ts/.js)
      'no-restricted-syntax': ['error', {
        selector: "MemberExpression[object.name='process'][property.name='env']",
        message: "❌ Direct access to process.env is FORBIDDEN in Dashboard! Use import.meta.env.",
      }],
    },
  },

  // ============================================
  // TSX SPECIFIC RULES
  // Detect hardcoded strings in JSX
  // ============================================
  {
    files: ['**/*.tsx'],
    rules: {
      // ERROR on hardcoded strings in JSX
      // This forces usage of LABELS from @repo/config
      // NOTE: allowedStrings contains TECHNICAL CONSTANTS only (not user content)
      'react/jsx-no-literals': ['error', {
        noStrings: true,
        allowedStrings: [
          // Whitespace and separators
          '', ' ', '  ', '   ', '-', '/', ':', '.', ',', ';', '|',
          '(', ')', '{', '}', '[', ']', '_', '#', '@',
          // Units
          'ms', 'px', 'em', 'rem', 'vh', 'vw', 'KB', 'MB', 'GB', 'TB', 'B', 'kB',
          's', 'm', 'h', 'd', 'w', 'y', 'sec', 'min', 'hrs', 'days',
          // HTTP Methods
          'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS',
          // SQL
          'ASC', 'DESC', 'AND', 'OR', 'NOT', 'SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'AS',
          'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'LEFT JOIN', 'INNER JOIN', 'RIGHT JOIN',
          'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
          'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL', 'NULL', 'TRUE', 'FALSE',
          // Operators
          '=', '!=', '>', '<', '>=', '<=', '<>', '==', '===', '!==',
          'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'notNull',
          // Technical labels
          'Equals (=)', 'Not Equal (!=)', 'Greater (>)', 'Greater/Eq (>=)',
          'Less (<)', 'Less/Eq (<=)', 'Contains (LIKE)', 'In List (IN)', 'Is Null', 'Is Not Null',
          // Symbols
          '*', '+', '?', '!', '...', '..', '--', '++',
          // Data types
          'string', 'number', 'boolean', 'object', 'array', 'undefined',
          'int', 'float', 'double', 'decimal', 'bigint', 'text', 'varchar', 'char', 'blob', 'json', 'jsonb',
          'date', 'datetime', 'timestamp', 'time', 'uuid', 'serial', 'autoincrement',
          // Tokens
          'id', 'ID', 'key', 'value', 'type', 'name', 'true', 'false', 'on', 'off', 'yes', 'no',
          'OK', 'ok', 'N/A', 'n/a', 'TBD', 'null', 'like', 'in',
          // Status codes
          '200', '201', '204', '301', '302', '400', '401', '403', '404', '500', '502', '503',
          // Abbreviations
          'API', 'URL', 'URI', 'SQL', 'JSON', 'XML', 'HTML', 'CSS', 'JS', 'TS',
          'DB', 'UI', 'UX', 'UUID', 'PK', 'FK',
          // Versioning
          'v1', 'v2', 'v3', 'beta', 'alpha', 'rc',
        ],
        ignoreProps: true,
      }],

      // BLOCK ALL EMOJI - must use Icons from @repo/config
      'no-restricted-syntax': ['error', {
        selector: 'Literal[value=/[\\u{1F300}-\\u{1F9FF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}✓✕×✨⚡⚠️🔗🔍🗑️]/u]',
        message: '❌ Emoji are not allowed! Use Icons from @repo/config instead. Example: <Icons.sparkles />, <Icons.warning />, <Icons.check />',
      },
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: "❌ Direct access to process.env is FORBIDDEN in Dashboard! Use import.meta.env.",
        }],
    },
  },

  // ============================================
  // COMPONENT ARCHITECTURE RULES
  // Enforce composable pattern - no business logic in components
  // ============================================
  {
    // Apply to all module components EXCEPT api-tester (it's a testing tool that needs direct fetch)
    files: ['**/modules/**/components/**/*.tsx'],
    ignores: ['**/modules/api-tester/**'],
    rules: {
      'no-restricted-syntax': ['error',
        // ❌ No fetch() calls in components - move to composable
        {
          selector: 'CallExpression[callee.name="fetch"]',
          message: '☢️ STRICT ARCHITECTURE: fetch() not allowed in components. Move to composables/useXxx.ts or api/index.ts',
        },
        // ❌ No direct API calls in components
        {
          selector: 'MemberExpression[object.name="fetch"]',
          message: '☢️ STRICT ARCHITECTURE: fetch() not allowed in components. Move to composables/useXxx.ts',
        },
        // ❌ Block emoji in JSX (same as above, but for components specifically)
        {
          selector: 'Literal[value=/[\\u{1F300}-\\u{1F9FF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}✓✕×✨⚡⚠️🔗🔍🗑️]/u]',
          message: '❌ Emoji are not allowed! Use Icons from @repo/config instead.',
        },
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: "❌ Direct access to process.env is FORBIDDEN in Dashboard! Use @/lib/env.",
        },
      ],
    },
  },

  // ============================================
  // EXCEPTIONS
  // ============================================
  {
    // Allow process.env in env configuration file (Bridge) AND Build Configs
    files: ['src/lib/env.ts', 'next.config.ts', 'open-next.config.ts', 'worker.ts'],
    rules: {
      'no-restricted-syntax': 'off',
      'import/no-anonymous-default-export': 'off', // Allow default exports in configs
    },
  },
];


export default eslintConfig;
