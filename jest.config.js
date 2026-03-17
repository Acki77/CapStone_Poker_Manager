import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  testEnvironment: "jest-environment-jsdom", // oder "node" für reine API-Tests
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  // Wir lassen den Mapper weg, da next/jest das @/ meist selbst auflöst
};

export default createJestConfig(config);
