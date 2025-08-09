import { ExtendedRiskData, ExtendedRiskDataKeys } from '@/shared/types/typeMainPage';

/**
 * Returns a color based on the performance value.
 * Positive values are green, negative are red, and zero is neutral grey.
 *
 * @param value - The performance value to evaluate.
 * @returns A hex color string representing the performance.
 */
export const getPerfColor = (value: number) => {
  if (value > 0) return '#4caf50';
  if (value < 0) return '#f44336';
  return '#e0e0e0';
};

/**
 * Returns a dynamic RGB color representing the RSI level.
 * - RSI ≤ 40 → green shades (stronger green for lower RSI)
 * - RSI 41–70 → yellow to orange shades (increasing intensity)
 * - RSI 71–100 → red shades (stronger red for higher RSI)
 *
 * @param value - The RSI value (expected between 0 and 100).
 * @returns An RGB color string corresponding to the RSI level.
 */
export const getRSIColor = (value: number) => {
  if (value <= 40) {
    const intensity = Math.round((40 - value) * 5);
    return `rgb(0, ${100 + intensity}, 0)`;
  }
  if (value <= 70) {
    const intensity = Math.round((value - 40) * 5);
    return `rgb(255, ${255 - intensity}, 0)`;
  }
  if (value <= 100) {
    const intensity = Math.round((value - 70) * 5);
    return `rgb(${155 + intensity}, 0, 0)`;
  }
  return '#e0e0e0';
};

/**
 * Returns a dynamic RGB color representing the risk score.
 * Risk ranges from 1 (low) to 10 (high):
 * - Low scores → green
 * - High scores → red
 * - Gradient transition in between
 *
 * @param value - The risk score value (expected from 1 to 10).
 * @returns An RGB color string corresponding to the risk score.
 */
export const getRiskColor = (value: number) => {
  const clamped = Math.min(10, Math.max(1, value));
  const ratio = (clamped - 1) / 9;
  const red = Math.round(50 + ratio * 205);
  const green = Math.round(255 - ratio * 205);
  return `rgb(${red}, ${green}, 0)`;
};

/**
 * Generates an array of RGB colors with a cyberpunk neon style.
 * Cycles through a base palette and adjusts brightness slightly for variety.
 *
 * @param count - The number of colors to generate.
 * @returns An array of RGB color strings in the format 'rgb(r, g, b)'.
 */
export function generateColors(count: number) {
  const baseColors = [
    [255, 20, 147],   // Deep Pink
    [0, 255, 255],    // Cyan
    [138, 43, 226],   // Blue Violet
    [255, 105, 180],  // Hot Pink
    [0, 191, 255],    // Deep Sky Blue
    [199, 21, 133],   // Medium Violet Red
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const base = baseColors[i % baseColors.length];
    const factor = 0.9 + (i / count) * 0.2;
    colors.push(`rgb(${Math.min(255, Math.round(base[0] * factor))}, ${Math.min(255, Math.round(base[1] * factor))}, ${Math.min(255, Math.round(base[2] * factor))})`);
  }
  return colors;
}

/**
 * Sorts an array of data objects descending by their 'total' property.
 *
 * @param dataList - Array of objects containing a numeric 'total' property.
 * @returns A new array sorted by 'total' in descending order.
 */
export function sortByTotalDesc<T extends { total: number }>(dataList: T[]): T[] {
  return [...dataList].sort((a, b) => b.total - a.total);
}

/**
 * Sorts an array of ExtendedRiskData objects based on a given key and direction.
 *
 * @param dataList - The array of data to sort.
 * @param key - The key of the data objects to sort by.
 * @param direction - The direction of the sort, either 'asc' for ascending or 'desc' for descending.
 * @returns A new array sorted by the specified key and direction. If the key is null or the values are not numbers, the original order is preserved.
 */
export function sortByKey( dataList: ExtendedRiskData[], key: ExtendedRiskDataKeys | null, direction: 'asc' | 'desc' = 'desc'): ExtendedRiskData[] {
  if (!key) return [...dataList];

  return [...dataList].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return direction === 'asc' ? valueA - valueB : valueB - valueA;
    }
    return 0;
  });
}

/**
 * Formats a number as a percentage string with two decimal places.
 *
 * @param {number} num - The numeric value to format as a percentage.
 * @returns {string} The formatted percentage string (e.g., "12.34 %").
 */
export function formatPercent(num: number) {
  return `${num.toFixed(2)} %`;
}

/**
 * Calculates the total portfolio value in euros.
 * @param dataList - An array of ExtendedRiskData objects representing each asset in the portfolio.
 * @returns The total portfolio value in euros as a number.
 */
export function calculateTotalPortfolioValue(dataList: { total: number }[]): number {
  return dataList.reduce((sum, item) => sum + item.total, 0);
}
