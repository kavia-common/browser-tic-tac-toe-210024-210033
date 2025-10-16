import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  { 
    languageOptions: { 
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      globals: {
        document: true,
        window: true,
        console: true,
        // Jest/test globals
        test: true,
        expect: true,
        describe: true,
        beforeEach: true,
        afterEach: true,
        jest: true
      }
    },
    rules: {
      // Allow React and App symbol to be unused where needed (entry points/tests)
      'no-unused-vars': ['error', { varsIgnorePattern: 'React|App' }]
    }
  },
  pluginJs.configs.recommended,
  {
    plugins: { react: pluginReact },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error"
    }
  }
]
