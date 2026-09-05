'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type GroceryItem = {
  foodId: string;
  name: string;
  totalServings: number;
  totalCost: number;
};

export default function GroceryListPage() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [planBudget, setPlanBudget] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setErrorMsg('You need to be logged in to view your grocery list.');
        setLoading(false);
        return;
      }

      const { data: plan } = await supabase
        .from('meal_plans')
        .select('id, budget_naira')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!plan) {
        setErrorMsg('No saved meal plan yet, generate and save one first.');
        setLoading(false);
        return;
      }

      setPlanBudget(plan.budget_naira);

      const { data: planItems, error } = await supabase
        .from('meal_plan_items')
        .select('food_id, servings, cost_naira, foods ( name )')
        .eq('plan_id', plan.id);

      if (error || !planItems) {
        setErrorMsg('Could not load your grocery list.');
        setLoading(false);
        return;
      }

      const grouped: Record<string, GroceryItem> = {};
      (planItems as any[]).forEach((item) => {
        const id = item.food_id;
        if (!grouped[id]) {
          grouped[id] = {
            foodId: id,
            name: item.foods.name,
            totalServings: 0,
            totalCost: 0,
          };
        }
        grouped[id].totalServings += item.servings;
        grouped[id].totalCost += item.cost_naira * item.servings;
      });

      setItems(Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    }

    load();
  }, []);

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) {
    return (
      <main className="grocery-wrap">
        <p className="summary-hint">Loading your grocery list...</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="grocery-wrap">
        <p className="summary-hint">{errorMsg}</p>
      </main>
    );
  }

  const totalCost = items.reduce((sum, i) => sum + i.totalCost, 0);

  return (
    <main className="grocery-wrap">
      <h1 className="section-title">Grocery list</h1>
      {planBudget !== null && (
        <p className="grocery-budget-note">
          Based on your last saved plan (₦{planBudget.toLocaleString()}/day budget)
        </p>
      )}

      <ul className="grocery-list">
        {items.map((item) => (
          <li key={item.foodId} className={checked[item.foodId] ? 'is-checked' : ''}>
            <label>
              <input
                type="checkbox"
                checked={!!checked[item.foodId]}
                onChange={() => toggle(item.foodId)}
              />
              <span className="grocery-item-name">
                {item.name} × {item.totalServings}
              </span>
            </label>
            <span className="grocery-item-cost">
              ₦{Math.round(item.totalCost).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>

      <div className="grocery-total">
        <span>Estimated total</span>
        <strong>₦{Math.round(totalCost).toLocaleString()}</strong>
      </div>
    </main>
  );
}