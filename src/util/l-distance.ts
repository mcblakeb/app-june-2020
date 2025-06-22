// Basic Levenshtein distance
function levenshteinDistance(s1: string, s2: string): number {
  if (s1.length < s2.length) {
    return levenshteinDistance(s2, s1);
  }

  let previousRow: number[] = Array.from(
    { length: s2.length + 1 },
    (_, i) => i
  );

  for (let i = 0; i < s1.length; i++) {
    const c1 = s1[i];
    const currentRow: number[] = [i + 1];

    for (let j = 0; j < s2.length; j++) {
      const c2 = s2[j];
      const insertions = previousRow[j + 1] + 1;
      const deletions = currentRow[j] + 1;
      const substitutions = previousRow[j] + (c1 !== c2 ? 1 : 0);
      currentRow.push(Math.min(insertions, deletions, substitutions));
    }

    previousRow = currentRow;
  }

  return previousRow[previousRow.length - 1];
}

// Similarity ratio based on edit distance
function similarityRatio(s1: string, s2: string): number {
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 1.0 : 1.0 - levenshteinDistance(s1, s2) / maxLen;
}

// Token-based overlap score
// (overlap for words)
function tokenOverlapScore(s1: string, s2: string): number {
  const tokens1 = new Set(s1.split(/\s+/));
  const tokens2 = new Set(s2.split(/\s+/));

  if (tokens1.size === 0 || tokens2.size === 0) {
    return 0.0;
  }

  const intersection = new Set(
    [...tokens1].filter((token) => tokens2.has(token))
  );
  const union = new Set([...tokens1, ...tokens2]);

  return intersection.size / union.size;
}

export { similarityRatio, tokenOverlapScore };
