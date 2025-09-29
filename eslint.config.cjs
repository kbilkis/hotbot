/* eslint-disable @typescript-eslint/no-require-imports */
const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const { defineConfig, globalIgnores } = require("eslint/config");
const importPlugin = require("eslint-plugin-import");
const react = require("eslint-plugin-react");
const unusedImports = require("eslint-plugin-unused-imports");
const globals = require("globals");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
    },

    extends: compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/recommended",
      "plugin:import/typescript",
      "plugin:react/recommended"
    ),

    plugins: {
      "@typescript-eslint": typescriptEslint,
      import: importPlugin,
      "unused-imports": unusedImports,
      react,
    },

    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      react: {
        version: "18.0", // Set to React 18 since Preact is compatible with React 18 APIs
      },
    },

    rules: {
      // Remove unused imports and variables
      "@typescript-eslint/no-unused-vars": "off", // Turn off the base rule
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/react-in-jsx-scope": "off",

      // Import ordering rules
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Node.js built-in modules
            "external", // npm packages
            "internal", // Internal modules (configured via paths)
            "parent", // Parent directories
            "sibling", // Same directory
            "index", // Index files
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // Other useful import rules
      "import/no-duplicates": "error",
      "import/no-unresolved": "error",
      "import/first": "error",
      "import/newline-after-import": "error",

      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  globalIgnores(["**/dist", "**/.eslintrc.js"]),
]);
