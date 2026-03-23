import nextJest from "next/jest.js";
import dotenv from "dotenv";

// Lade die Umgebungsvariablen direkt hier mit der ESM-Syntax
dotenv.config({ path: ".env.test.local" });

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: ["node_modules/(?!(mongoose|mongodb|bson)/)"],
};

export default createJestConfig(config);
