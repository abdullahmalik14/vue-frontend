import { isValuePresent } from './objectSafety.js';

export function filterZeroAmountEntries(items, amountKey = 'amount') {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.filter((item) => {
    if (!item || !isValuePresent(item)) {
      return false;
    }
    const amount = item[amountKey];
    return amount !== null && amount !== undefined && amount !== 0;
  });
}
