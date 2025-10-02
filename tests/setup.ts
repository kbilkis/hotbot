// Test setup file
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/preact";

// Cleanup after each test case
afterEach(() => {
  cleanup();
});
