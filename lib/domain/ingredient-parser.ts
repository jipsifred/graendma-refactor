export type ParsedIngredient = {
  name: string;
  amount: number | null;
  unitBase: string | null;
  isAggregatable: boolean;
};

const UNIT_ALIASES: Record<string, { base: string }> = {
  g: { base: 'g' }, gr: { base: 'g' }, gramm: { base: 'g' }, kg: { base: 'g' },
  ml: { base: 'ml' }, l: { base: 'ml' }, liter: { base: 'ml' },
  stk: { base: 'stk' }, stueck: { base: 'stk' }, stück: { base: 'stk' }, zehe: { base: 'stk' }, zehen: { base: 'stk' },
  tl: { base: 'tl' }, el: { base: 'el' },
};

const UNIT_FACTORS: Record<string, number> = { kg: 1000, l: 1000, liter: 1000 };

function parseNumberToken(token: string): number | null {
  const c = token.trim().replace(',', '.');
  if (/^\d+\/\d+$/.test(c)) {
    const [n, d] = c.split('/').map(Number);
    return d === 0 ? null : n / d;
  }
  if (/^\d+(\.\d+)?$/.test(c)) return Number(c);
  return null;
}

export function normalizeIngredientName(name: string): string {
  return name.toLowerCase().replace(/[.,;:()]/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatNumber(v: number): string {
  const r = Math.round(v * 100) / 100;
  return (Number.isInteger(r) ? String(r) : String(r).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')).replace('.', ',');
}

export function formatQuantity(amountBase: number, unitBase: string): string {
  if (unitBase === 'g' && amountBase >= 1000) return `${formatNumber(amountBase / 1000)} kg`;
  if (unitBase === 'ml' && amountBase >= 1000) return `${formatNumber(amountBase / 1000)} l`;
  if (unitBase === 'stk') return `${formatNumber(amountBase)} Stk`;
  if (unitBase === 'tl') return `${formatNumber(amountBase)} TL`;
  if (unitBase === 'el') return `${formatNumber(amountBase)} EL`;
  return `${formatNumber(amountBase)} ${unitBase}`;
}

export function parseIngredientLine(rawLine: string): ParsedIngredient {
  const normalized = rawLine.replace(/(\d)([A-Za-zÄÖÜäöü])/g, '$1 $2').replace(/([A-Za-zÄÖÜäöü])(\d)/g, '$1 $2').trim();
  if (!normalized) return { name: rawLine, amount: null, unitBase: null, isAggregatable: false };
  const parts = normalized.split(/\s+/);
  let consumed = 0;
  let amount: number | null = null;
  const firstAmount = parseNumberToken(parts[0] || '');
  if (firstAmount !== null) {
    amount = firstAmount;
    consumed = 1;
    if (/^\d+$/.test(parts[0] || '') && /^\d+\/\d+$/.test(parts[1] || '')) {
      const secondaryAmount = parseNumberToken(parts[1] || '');
      if (secondaryAmount !== null) {
        amount = firstAmount + secondaryAmount;
        consumed = 2;
      }
    }
  }
  const maybeUnit = (parts[consumed] || '').toLowerCase();
  const unitDef = UNIT_ALIASES[maybeUnit];
  let unitBase: string | null = null;
  if (unitDef) {
    unitBase = unitDef.base;
    if (UNIT_FACTORS[maybeUnit]) amount = (amount ?? 1) * UNIT_FACTORS[maybeUnit];
    consumed += 1;
  }
  let name = parts.slice(consumed).join(' ').trim();
  if (!name && amount !== null) name = normalized;
  if (amount !== null && !unitBase && name) unitBase = 'stk';
  return { name: name || normalized, amount, unitBase, isAggregatable: Boolean(amount !== null && unitBase && name) };
}
