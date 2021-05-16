module.exports = {
  root: true,
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  extends: [
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  overrides: [
    {
      files: ["**/__tests__/**/*.{j,t}s?(x)"],
      env: {
        jest: true,
      },
      extends: ["plugin:jest/recommended"],
      rules: {
        "@typescript-eslint/unbound-method": "off",
        "jest/unbound-method": "error",
      },
    },
  ],
  ignorePatterns: [
    ".eslintrc.js",
    "jest.config.js",
    "rollup.config.js",
    "scripts/**",
    "dist/**",
  ],
};
