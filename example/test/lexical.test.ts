import { describe, expect, it } from "vitest";
import { distinctTerms, lexicalOverlap, tokenize } from "../src/lexical";

describe("lexical", () => {
  it("tokenise en minuscules avec lettres accentuées", () => {
    expect(tokenize("Réinitialiser le MOT de passe !")).toEqual(["réinitialiser", "le", "mot", "de", "passe"]);
  });

  it("déduplique les termes de la requête", () => {
    expect(distinctTerms("chat chat Chien")).toEqual(["chat", "chien"]);
  });

  it("calcule la fraction de termes présents", () => {
    expect(lexicalOverlap("réinitialiser le mot de passe", ["mot", "passe", "serveur", "bot"])).toBe(0.5);
  });

  it("n'accepte que les mots entiers", () => {
    expect(lexicalOverlap("le catalogue est en ligne", ["log"])).toBe(0);
    expect(lexicalOverlap("voir le log complet", ["log"])).toBe(1);
  });

  it("retourne 0 pour une requête vide", () => {
    expect(lexicalOverlap("texte", [])).toBe(0);
  });
});
