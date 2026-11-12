import { describe, expect, it } from "vitest";
import { rerankCandidates } from "../src/rerank";

// Ordre vectoriel : c1, c3, c2.
const candidates = [
  { id: "c1", text: "présentation générale de l'équipe" },
  { id: "c3", text: "tarifs et abonnements" },
  { id: "c2", text: "procédure pour réinitialiser le mot de passe du compte" },
];

describe("rerankCandidates", () => {
  it("remonte le candidat qui contient les termes de la requête", () => {
    const order = rerankCandidates("réinitialiser mot de passe", candidates, 10);
    expect(order.indexOf("c2")).toBeLessThan(order.indexOf("c3"));
  });

  it("ne renvoie que les candidats fournis (reclasse sans élargir)", () => {
    const order = rerankCandidates("abonnements remboursement", candidates, 10);
    expect([...order].sort()).toEqual(["c1", "c2", "c3"]);
  });

  it("conserve l'ordre vectoriel si la requête est vide", () => {
    expect(rerankCandidates("", candidates, 10)).toEqual(["c1", "c3", "c2"]);
  });
});
