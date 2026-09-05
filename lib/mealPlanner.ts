// lib/mealPlanner.ts
//
// Rule-based meal plan generator. Not AI — deterministic scoring
// that balances a food's fit against a calorie slice and a budget
// slice for each meal. Predictable and explainable, not "smart"
// in an AI sense.

export type PlannerFood = {
  id: string;
  name: string;
  category: string;
  calories: number;
  cost_naira: number;
};

export type PlanItem = {
  food: PlannerFood;
  servings: number;
};

export type MealSlot = {
  items: PlanItem[];
  totalCalories: number;
  totalCost: number;
};

export type DayPlan = {
  breakfast: MealSlot;
  lunch: MealSlot;
  dinner: MealSlot;
  snack: MealSlot;
  dayTotalCalories: number;
  dayTotalCost: number;
};

function score(food: PlannerFood, targetCal: number, targetBudget: number): number {
  const calScore = targetCal > 0 ? Math.abs(food.calories - targetCal) / targetCal : 1;
  const costScore =
    food.cost_naira > targetBudget * 1.3
      ? 1.5
      : targetBudget > 0
      ? Math.abs(food.cost_naira - targetBudget) / targetBudget
      : 0;
  return calScore * 0.6 + costScore * 0.4;
}

function pickBest(
  pool: PlannerFood[],
  targetCal: number,
  targetBudget: number,
  excludeIds: string[] = []
): PlannerFood | null {
  const withoutExcluded = pool.filter((f) => !excludeIds.includes(f.id));
  const candidates = withoutExcluded.length > 0 ? withoutExcluded : pool;
  if (candidates.length === 0) return null;

  return [...candidates].sort(
    (a, b) => score(a, targetCal, targetBudget) - score(b, targetCal, targetBudget)
  )[0];
}

function toItem(food: PlannerFood | null): PlanItem[] {
  return food ? [{ food, servings: 1 }] : [];
}

function slotTotals(items: PlanItem[]): { totalCalories: number; totalCost: number } {
  return items.reduce(
    (acc, item) => {
      acc.totalCalories += item.food.calories * item.servings;
      acc.totalCost += item.food.cost_naira * item.servings;
      return acc;
    },
    { totalCalories: 0, totalCost: 0 }
  );
}

export function generateDayPlan(
  foods: PlannerFood[],
  calorieTarget: number,
  dailyBudget: number,
  excludeByMeal: Record<string, string[]> = {}
): DayPlan {
  const priced = foods.filter((f) => f.cost_naira != null);

  const byCategory = (cats: string[]) => priced.filter((f) => cats.includes(f.category));

  // ---- Breakfast: 25% of calories/budget ----
  const breakfastTargetCal = calorieTarget * 0.25;
  const breakfastTargetBudget = dailyBudget * 0.25;
  const breakfastFood = pickBest(
    byCategory(['breakfast']),
    breakfastTargetCal,
    breakfastTargetBudget,
    excludeByMeal.breakfast ?? []
  );
  const breakfastItems = toItem(breakfastFood);

  // ---- Lunch: 35% of calories/budget — rice dish + protein ----
  const lunchTargetCal = calorieTarget * 0.35;
  const lunchTargetBudget = dailyBudget * 0.35;
  const riceFood = pickBest(
    byCategory(['rice_dish']),
    lunchTargetCal * 0.7,
    lunchTargetBudget * 0.6,
    excludeByMeal.lunch_rice ?? []
  );
  const remainingLunchCal = lunchTargetCal - (riceFood?.calories ?? 0);
  const remainingLunchBudget = lunchTargetBudget - (riceFood?.cost_naira ?? 0);
  const proteinFood =
    remainingLunchBudget > 0
      ? pickBest(
          byCategory(['protein']),
          remainingLunchCal,
          remainingLunchBudget,
          excludeByMeal.lunch_protein ?? []
        )
      : null;
  const lunchItems = [...toItem(riceFood), ...toItem(proteinFood)];

  // ---- Dinner: 30% of calories/budget — swallow + soup ----
  const dinnerTargetCal = calorieTarget * 0.3;
  const dinnerTargetBudget = dailyBudget * 0.3;
  const swallowFood = pickBest(
    byCategory(['swallow']),
    dinnerTargetCal * 0.35,
    dinnerTargetBudget * 0.3,
    excludeByMeal.dinner_swallow ?? []
  );
  const remainingDinnerCal = dinnerTargetCal - (swallowFood?.calories ?? 0);
  const remainingDinnerBudget = dinnerTargetBudget - (swallowFood?.cost_naira ?? 0);
  const soupFood =
    remainingDinnerBudget > 0
      ? pickBest(
          byCategory(['soup']),
          remainingDinnerCal,
          remainingDinnerBudget,
          excludeByMeal.dinner_soup ?? []
        )
      : null;
  const dinnerItems = [...toItem(swallowFood), ...toItem(soupFood)];

  // ---- Snack: 10% of calories/budget ----
  const snackTargetCal = calorieTarget * 0.1;
  const snackTargetBudget = dailyBudget * 0.1;
  const snackFood = pickBest(
    byCategory(['snack', 'fruit']),
    snackTargetCal,
    snackTargetBudget,
    excludeByMeal.snack ?? []
  );
  const snackItems = toItem(snackFood);

  const breakfast = { items: breakfastItems, ...slotTotals(breakfastItems) };
  const lunch = { items: lunchItems, ...slotTotals(lunchItems) };
  const dinner = { items: dinnerItems, ...slotTotals(dinnerItems) };
  const snack = { items: snackItems, ...slotTotals(snackItems) };

  return {
    breakfast,
    lunch,
    dinner,
    snack,
    dayTotalCalories:
      breakfast.totalCalories + lunch.totalCalories + dinner.totalCalories + snack.totalCalories,
    dayTotalCost: breakfast.totalCost + lunch.totalCost + dinner.totalCost + snack.totalCost,
  };
}

export function generateWeekPlan(
  foods: PlannerFood[],
  calorieTarget: number,
  dailyBudget: number
): DayPlan[] {
  const days: DayPlan[] = [];
  let lastPicks: Record<string, string[]> = {};

  for (let i = 0; i < 7; i++) {
    const day = generateDayPlan(foods, calorieTarget, dailyBudget, lastPicks);
    days.push(day);

    // Exclude today's picks from tomorrow's same slot, for variety
    lastPicks = {
      breakfast: day.breakfast.items.map((it) => it.food.id),
      lunch_rice: day.lunch.items[0] ? [day.lunch.items[0].food.id] : [],
      lunch_protein: day.lunch.items[1] ? [day.lunch.items[1].food.id] : [],
      dinner_swallow: day.dinner.items[0] ? [day.dinner.items[0].food.id] : [],
      dinner_soup: day.dinner.items[1] ? [day.dinner.items[1].food.id] : [],
      snack: day.snack.items.map((it) => it.food.id),
    };
  }

  return days;
}