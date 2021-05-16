const packageJSON = require("./package.json");

/** @type {import("@jest/types").Config.InitialOptions} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  globals: {
    __NAME__: packageJSON.name,
  },
  testMatch: ["<rootDir>/__tests__/**/?*.spec.[jt]s?(x)"],
  collectCoverageFrom: ["src/**"],
};
