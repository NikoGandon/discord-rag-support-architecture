import { describe, expect, it } from "vitest";
import { reciprocalRankFusion, sortByScore } from "../src/rrf";

describe("reciprocalRankFusion", () => {
  it("somme 1/(k+rang) sur les listes", () => {
    const s = reciprocalRankFusion([["a", "b"], ["b", "a"]], 1);
    expect(s.get("a")).toBeCloseTo(1 / 2 + 1 / 3);
    expect(s.get("b")).toBeCloseTo(1 / 3 + 1 / 2);
  });

  it("favorise un élément bien classé dans les deux listes", () => {
    const s = reciprocalRankFusion([["a", "b", "c"], ["a", "c", "b"]], 5);
    expect(sortByScore(s)[0]).toBe("a");
  });

  it("ne compte qu'une fois un doublon dans une liste", () => {
    const s = reciprocalRankFusion([["a", "a", "b"]], 0);
    expect(s.get("a")).toBe(1);
    expect(s.get("b")).toBeCloseTo(1 / 3);
  });

  it("rejette un k invalide", () => {
    expect(() => reciprocalRankFusion([["a"]], -1)).toThrow(RangeError);
  });

  it("gère l'absence de listes", () => {
    expect(reciprocalRankFusion([], 3).size).toBe(0);
  });

  it("départage les égalités par ordre d'arrivée", () => {
    const s = reciprocalRankFusion([["x"], ["y"]], 2);
    expect(sortByScore(s)).toEqual(["x", "y"]);
  });
});
