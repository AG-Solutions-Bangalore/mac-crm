/**
 * Distributes a total amount into milestone integer amounts according to the given percentages.
 * When the sum of percentages equals 100%, uses the Largest Remainder Method (Hare-Niemeyer)
 * so that the sum of the integer milestone amounts matches Math.round(total) EXACTLY,
 * eliminating any +/- 1 rupee rounding discrepancy in financial records.
 *
 * @param {number|string} total - The total monetary amount to split
 * @param {Array<number|string>} pcts - Array of percentage values, e.g. [30, 60, 10]
 * @returns {number[]} Array of calculated integer amounts, matching the length of pcts
 */
export const calculateMilestoneAmounts = (total, pcts = []) => {
  const roundTotal = Math.round(Number(total) || 0);
  if (roundTotal <= 0 || !Array.isArray(pcts) || pcts.length === 0) {
    return (pcts || []).map(() => 0);
  }

  const cleanPcts = pcts.map((p) => Math.max(0, Number(p) || 0));
  const sumPcts = cleanPcts.reduce((a, b) => a + b, 0);

  // If percentages do not sum to 100%, calculate proportional amounts independently
  if (sumPcts !== 100) {
    return cleanPcts.map((pct) => Math.round((roundTotal * pct) / 100));
  }

  // When sum is 100%, use Largest Remainder Method to guarantee zero rounding drift
  const exacts = cleanPcts.map((pct) => (roundTotal * pct) / 100);
  const floors = exacts.map((x) => Math.floor(x));
  const floorSum = floors.reduce((a, b) => a + b, 0);
  const remainderToDistribute = roundTotal - floorSum;

  const remainders = exacts.map((x, idx) => ({
    idx,
    rem: x - floors[idx],
  }));

  // Sort descending by fractional remainder
  remainders.sort((a, b) => b.rem - a.rem);

  const amounts = [...floors];
  for (let i = 0; i < remainderToDistribute && i < remainders.length; i++) {
    amounts[remainders[i].idx] += 1;
  }

  return amounts;
};
