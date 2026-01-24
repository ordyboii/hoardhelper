import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
    {
        ignores: ["dist/", "dist-electron/", "release/", "node_modules/"]
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.{ts,tsx}"],
        plugins: {
            react,
            "react-hooks": reactHooks
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: { jsx: true }
            }
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_"
                }
            ],
            "@typescript-eslint/no-explicit-any": "error"
        }
    },
    {
        files: ["test/**/*.ts"],
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_"
                }
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unsafe-function-type": "warn",
            "@typescript-eslint/ban-ts-comment": "warn"
        }
    },
    eslintConfigPrettier
);
