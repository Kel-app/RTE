/**
 * Basic integration tests for the RTE library
 * These tests verify core functionality without complex mocking
 */

describe("RTE Basic Integration", () => {
  it("should export the main textEditor component", () => {
    const textEditor = require("../src/components/textEditor");
    expect(textEditor.default).toBeDefined();
    expect(typeof textEditor.default).toBe("function");
  });

  it("should export utility functions", () => {
    // Test that utility modules can be imported
    expect(() => {
      require("../src/components/utils/toolbar");
    }).not.toThrow();

    expect(() => {
      require("../src/lib/utils");
    }).not.toThrow();
  });

  it("should have proper package exports", () => {
    const pkg = require("../package.json");
    expect(pkg.name).toBe("@kel-app/rte");
    expect(pkg.main).toBeDefined();
    expect(pkg.types).toBeDefined();
  });

  it("should have development scripts", () => {
    const pkg = require("../package.json");
    expect(pkg.scripts.dev).toBeDefined();
    expect(pkg.scripts.build).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
  });
});
