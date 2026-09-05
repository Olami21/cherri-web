// lib/substitution.ts
//
// Given a food, finds other foods in the same category with the
// closest nutritional profile (calories + protein). Rule-based,
// no AI, fully deterministic.

export type SubstitutionFood = {
  id: string;
  name: string;
  category: string;
  serving_description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type Substitute = SubstitutionFood & {
  similarityLabel: string;
};

function similarityScore(a: SubstitutionFood, b: SubstitutionFood): number {
  const calDiff = Math.abs(a.calories - b.calories) / Math.max(a.calories, 1);
  const proteinDiff = Math.abs(a.protein_g - b.protein_g) / Math.max(a.protein_g, 1);
  return calDiff * 0.6 + proteinDiff * 0.4;
}

function labelFor(target: SubstitutionFood, candidate: SubstitutionFood): string {
  const calDiffPct = ((candidate.calories - target.calories) / Math.max(target.calories, 1)) * 100;
  const proteinDiffPct = ((candidate.protein_g - target.protein_g) / Math.max(target.protein_g, 1)) * 100;

  if (Math.abs(calDiffPct) < 10 && Math.abs(proteinDiffPct) < 15) {
    return 'Very similar nutritionally';
  }
  if (calDiffPct <= -10) {
    return `${Math.round(Math.abs(calDiffPct))}% fewer calories`;
  }
  if (calDiffPct >= 10) {
    return `${Math.round(calDiffPct)}% more calories`;
  }
  if (proteinDiffPct >= 15) {
    return 'Higher in protein';
  }
  return 'A reasonable alternative';
}

export function findSubstitutes(
  target: SubstitutionFood,
  pool: SubstitutionFood[],
  limit: number = 5
): Substitute[] {
  const sameCategory = pool.filter(
    (f) => f.category === target.category && f.id !== target.id
  );

  const candidates = sameCategory.length > 0 ? sameCategory : pool.filter((f) => f.id !== target.id);

  return candidates
    .map((food) => ({ food, score: similarityScore(target, food) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ food }) => ({
      ...food,
      similarityLabel: labelFor(target, food),
    }));
}