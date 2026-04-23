module.exports = {
  root: true,
  extends: [
    "@react-native",
    "eslint:recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
    "plugin:import/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-native", "react-hooks"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    project: "./tsconfig.json"
  },
  env: {
    "react-native/react-native": true
  },
  rules: {
    "react/react-in-jsx-scope": 0,
    "react/display-name": 0,
    "import/named": 0,
    "import/namespace": 0,
    "import/no-named-as-default": 0,
    "import/no-unresolved": 0,
    "@typescript-eslint/consistent-type-imports": 0,
    "@typescript-eslint/strict-boolean-expressions": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/consistent-type-definitions": 0,
    "@typescript-eslint/array-type": 0,
    "@typescript-eslint/prefer-nullish-coalescing": 0,
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false
      }
    ],
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],
    "react/no-unstable-nested-components": ["error", { allowAsProps: true }]
  }
};
