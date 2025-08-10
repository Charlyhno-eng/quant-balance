import { CryptoData } from '@/shared/types/typeMainPage';

/**
 * Computes the ideal wallet allocation based on crypto data.
 *
 * The function calculates the allocation for each cryptocurrency considering
 * risk scores, volatility, performance metrics, and enforces constraints on
 * minimum and maximum allocation per crypto. USDC allocation is dynamically
 * determined based on the proportion of high-risk assets.
 *
 * @param {CryptoData[]} cryptos - Array of crypto data objects containing metrics for scoring.
 * @returns {Array<{ symbol: string; allocation: number }>} An array of objects representing the
 *          ideal wallet allocation with crypto symbols and their respective percentages.
 */
export async function computeIdealWallet(cryptos: CryptoData[]) {
  const highRiskCount = cryptos.filter((c) => c.data.risk_score > 8).length;
  const totalCount = cryptos.length;
  let usdcShare = 0;

  if (highRiskCount === totalCount) {
    usdcShare = 100;
  } else if (highRiskCount >= totalCount * 0.75) {
    usdcShare = 75;
  } else if (highRiskCount > totalCount / 2) {
    usdcShare = 50;
  } else if (highRiskCount >= totalCount * 0.25) {
    usdcShare = 25;
  }

  const eligibleCryptos = cryptos.filter((c) => {
    const rsiOK = c.data.rsi_1d >= 1 && c.data.rsi_1d <= 60;
    const perfOK = c.data.perf_7d > 0 || c.data.perf_30d > 0 || c.data.perf_1d > 0;
    return c.data.risk_score <= 8 || (rsiOK && perfOK);
  });

  const scoredCryptos = eligibleCryptos.map((c) => {
    const perfScore = c.data.perf_1d + c.data.perf_7d + c.data.perf_30d;
    const weightedRiskPenalty = (c.data.risk_score * 3);
    const penaltyFactor = c.data.risk_score > 7 ? Math.pow(1.3, c.data.risk_score - 7) : 1;
    const volatilityBoost = 1 + ((10 - Math.min(c.data.volatility, 10)) / 10);
    const score = (perfScore * volatilityBoost) / ((weightedRiskPenalty || 1) * penaltyFactor);
    return { ...c, score };
  });

  const topCryptos = scoredCryptos
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const remainingShare = 100 - usdcShare;
  const totalScore = topCryptos.reduce((sum, c) => sum + c.score, 0);

  const wallet = [];
  if (usdcShare > 0) {
    wallet.push({ symbol: 'USDC', allocation: usdcShare });
  }

  for (const c of topCryptos) {
    let weight = (c.score / totalScore) * remainingShare;
    if (weight < 5) weight = 5;
    if (weight > 30) weight = 30;
    wallet.push({ symbol: c.symbol, allocation: Number(weight.toFixed(2)) });
  }

  const totalAlloc = wallet.reduce((sum, a) => sum + a.allocation, 0);
  const diff = 100 - totalAlloc;
  if (diff !== 0) wallet[0].allocation = Number((wallet[0].allocation + diff).toFixed(2));

  return wallet;
}
