import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const projectUrl = new URL('../', import.meta.url);
const [appSource, stateSource, payloadSource] = await Promise.all([
  readFile(new URL('RecipeApp.tsx', projectUrl), 'utf8'),
  readFile(new URL('lib/client/recipe-app-state.ts', projectUrl), 'utf8'),
  readFile(new URL('lib/domain/recipe-update-payload.ts', projectUrl), 'utf8'),
]);

test('pure RecipeApp helpers are extracted without changing timing/storage constants', () => {
  assert.match(stateSource, /feji_active_timers:v2/);
  assert.match(stateSource, /feji_active_timers/);
  assert.match(stateSource, /Math\.max\(0, Math\.ceil\(\(timer\.endTime - Date\.now\(\)\) \/ 1000\)\)/);
  assert.match(appSource, /useState<ActiveTimer\[\]>\(loadStoredTimers\)/);
});

test('recipe category updates preserve the exact request payload shape', () => {
  for (const field of ['name', 'time', 'category', 'servings', 'ingredients', 'instructions', 'stepIngredients', 'removeImage']) {
    assert.match(payloadSource, new RegExp(`${field}:`));
  }
  assert.match(payloadSource, /stepIngredients: recipe\.stepIngredients \|\| \{\}/);
  assert.match(payloadSource, /removeImage: false/);
  assert.match(appSource, /JSON\.stringify\(buildRecipeUpdatePayload\(recipe, newName\)\)/);
  assert.match(appSource, /JSON\.stringify\(buildRecipeUpdatePayload\(recipe, targetCategory\.name\)\)/);
});
