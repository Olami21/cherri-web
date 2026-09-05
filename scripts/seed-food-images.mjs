// scripts/seed-food-images.mjs
//
// One-time script: for every row in `foods` without an image_url,
// search Pexels, download the top match, upload it to the
// `food-images` Supabase Storage bucket, and save the public URL
// back onto that row.
//
// Run with:  node scripts/seed-food-images.mjs
//
// Requires SUPABASE_SERVICE_ROLE_KEY and PEXELS_API_KEY in .env.local
// (both server-only, no NEXT_PUBLIC_ prefix).

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !PEXELS_API_KEY) {
  console.error(
    'Missing env vars. Confirm NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and PEXELS_API_KEY are all set in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const BUCKET = 'food-images';

// Dishes likely to return weak/wrong matches from a Western-leaning
// stock library — flagged upfront so you know what to eyeball first.
const LIKELY_NEEDS_REVIEW = new Set([
  'Ofada rice and ayamase',
  'Afang soup',
  'Oha soup',
  'Banga soup',
  'Edikang ikong',
  'Tiger nut milk (kunun aya)',
  'Kunu',
  'Kilishi',
  'Boli (roasted plantain)',
  'Garden egg',
]);

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function searchPexels(query) {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
    { headers: { Authorization: PEXELS_API_KEY } }
  );

  if (!res.ok) {
    throw new Error(`Pexels search failed (${res.status}) for "${query}"`);
  }

  const data = await res.json();
  return data.photos?.[0]?.src?.large ?? null;
}

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image download failed (${res.status})`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function run() {
  const { data: foods, error } = await supabase
    .from('foods')
    .select('id, name, category, image_url')
    .order('name');

  if (error) {
    console.error('Failed to fetch foods:', error.message);
    process.exit(1);
  }

  console.log(`Found ${foods.length} foods. Starting image fetch...\n`);

  const results = { success: [], failed: [], needsReview: [] };

  for (const food of foods) {
    const slug = slugify(food.name);

    try {
      let imageUrl = await searchPexels(food.name);
      if (!imageUrl) {
        imageUrl = await searchPexels(`${food.name} nigerian food`);
      }

      if (!imageUrl) {
        console.log(`✗ No match found: ${food.name}`);
        results.failed.push(food.name);
        continue;
      }

      const buffer = await downloadImage(imageUrl);
      const path = `${slug}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) {
        console.log(`✗ Upload failed: ${food.name} — ${uploadError.message}`);
        results.failed.push(food.name);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

      const { error: updateError } = await supabase
        .from('foods')
        .update({ image_url: publicUrlData.publicUrl })
        .eq('id', food.id);

      if (updateError) {
        console.log(`✗ DB update failed: ${food.name} — ${updateError.message}`);
        results.failed.push(food.name);
        continue;
      }

      const flag = LIKELY_NEEDS_REVIEW.has(food.name) ? ' (flagged for review)' : '';
      console.log(`✓ ${food.name}${flag}`);
      results.success.push(food.name);
      if (LIKELY_NEEDS_REVIEW.has(food.name)) results.needsReview.push(food.name);

      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.log(`✗ Error on ${food.name}: ${err.message}`);
      results.failed.push(food.name);
    }
  }

  console.log('\n===== SUMMARY =====');
  console.log(`Success: ${results.success.length}`);
  console.log(`Failed:  ${results.failed.length}`);
  if (results.failed.length) {
    console.log('\nFailed items (add these manually, or re-run the script — it skips nothing, so a re-run just overwrites):');
    results.failed.forEach((n) => console.log(`  - ${n}`));
  }

  console.log('\nReview these first — likely inaccurate stock matches for niche/local dishes:');
  results.needsReview.forEach((n) => console.log(`  - ${n}`));
  console.log('\nDone. Check the food-images bucket and your Supabase table to confirm.');
}

run();