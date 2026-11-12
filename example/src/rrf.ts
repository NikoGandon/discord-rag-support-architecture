/**
 * Reciprocal Rank Fusion : chaque liste est classée du meilleur au moins bon.
 * Le score d'un identifiant est la somme, sur les listes où il apparaît,
 * de 1 / (k + rang), le rang commençant à 1. Un doublon dans une même liste
 * n'est compté qu'une fois (première occurrence).
 */
export function reciprocalRankFusion(rankings: string[][], k: number): Map<string, number> {
  if (!Number.isFinite(k) || k < 0) throw new RangeError("k doit être un nombre positif ou nul");
  const scores = new Map<string, number>();
  for (const ranking of rankings) {
    const seen = new Set<string>();
    ranking.forEach((id, index) => {
      if (seen.has(id)) return;
      seen.add(id);
      scores.set(id, (scores.get(id) ?? 0) + 1 / (k + index + 1));
    });
  }
  return scores;
}

/** Identifiants triés par score décroissant ; l'ordre d'arrivée départage les égalités. */
export function sortByScore(scores: Map<string, number>): string[] {
  return [...scores.entries()]
    .map(([id, score], order) => ({ id, score, order }))
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((e) => e.id);
}
