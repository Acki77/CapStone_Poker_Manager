import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    // Der Alias für deine Modelle (falls Jest ihn noch nicht kennt)
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(config);
