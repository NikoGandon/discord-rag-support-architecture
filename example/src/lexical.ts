/** Découpe un texte en termes (lettres/chiffres Unicode, minuscules). */
export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

/** Termes distincts d'une requête, dans l'ordre d'apparition. */
export function distinctTerms(query: string): string[] {
  return [...new Set(tokenize(query))];
}

/**
 * Fraction des termes de la requête présents dans le document, en mot entier
 * (« log » ne correspond pas à « catalogue »). Retourne 0 si la requête est vide.
 */
export function lexicalOverlap(document: string, terms: string[]): number {
  if (terms.length === 0) return 0;
  const present = new Set(tokenize(document));
  let hits = 0;
  for (const t of terms) if (present.has(t)) hits++;
  return hits / terms.length;
}
