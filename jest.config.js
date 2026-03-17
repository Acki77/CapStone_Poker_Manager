import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    // Nur der Alias, den Rest erledigt Next.js
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(config);
