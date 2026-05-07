import { describe, expect, it } from "vitest";
import { shortCommit } from "../../src/features/version/buildInfo";

describe("shortCommit", () => {
  it("keeps short values unchanged", () => {
    expect(shortCommit("abc123")).toBe("abc123");
  });

  it("trims long commit values", () => {
    expect(shortCommit("1234567890abcdef")).toBe("1234567890ab");
  });
});
