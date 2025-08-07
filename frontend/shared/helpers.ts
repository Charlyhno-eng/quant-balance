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
