import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const projectUrl = new URL('../', import.meta.url);
const [shoppingSource, parserSource] = await Promise.all([
  readFile(new URL('components/ShoppingListModal.tsx', projectUrl), 'utf8'),
  readFile(new URL('lib/domain/ingredient-parser.ts', projectUrl), 'utf8'),
]);

test('shopping-list ingredient parsing is isolated from rendering and network state', () => {
  assert.match(shoppingSource, /import \{ formatQuantity, normalizeIngredientName, parseIngredientLine \}/);
  assert.doesNotMatch(parserSource, /React|apiFetch|useState|useEffect/);
});

test('ingredient parser preserves the existing aliases, factors and display units', () => {
  for (const token of ["kg: { base: 'g' }", "liter: { base: 'ml' }", "stück: { base: 'stk' }", "zehen: { base: 'stk' }"]) {
    assert.ok(parserSource.includes(token));
  }
  assert.match(parserSource, /const UNIT_FACTORS[^\n]+kg: 1000, l: 1000, liter: 1000/);
  assert.match(parserSource, /amountBase >= 1000/);
  assert.match(parserSource, /Stk/);
  assert.match(parserSource, /TL/);
  assert.match(parserSource, /EL/);
});
