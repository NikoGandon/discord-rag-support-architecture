import { distinctTerms, lexicalOverlap } from "./lexical";
import { reciprocalRankFusion, sortByScore } from "./rrf";

export interface Candidate {
  id: string;
  text: string;
}

/**
 * Reclasse des candidats déjà retenus par une recherche vectorielle
 * (ordre d'entrée = ordre vectoriel, meilleur d'abord) : le classement lexical
 * est calculé uniquement sur ces candidats, puis fusionné en RRF.
 * La fonction reclasse, elle n'ajoute jamais de candidat.
 */
export function rerankCandidates(query: string, candidates: Candidate[], k: number): string[] {
  const terms = distinctTerms(query);
  const vectorOrder = candidates.map((c) => c.id);
  const lexicalOrder = candidates
    .map((c, order) => ({ id: c.id, order, score: lexicalOverlap(c.text, terms) }))
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((c) => c.id);
  return sortByScore(reciprocalRankFusion([vectorOrder, lexicalOrder], k));
}
