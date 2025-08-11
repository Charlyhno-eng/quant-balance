import { CryptoData } from '@/shared/types/typeMainPage';

const MIN_ALLOCATION = 3;
const MAX_ALLOCATION = 35;
const HIGH_RISK_THRESHOLD = 7.5;
const MAX_CRYPTOS = 8;

/**
 * Determines the allocation share for USDC based on the proportion of high-risk assets.
 * @param {CryptoData[]} cryptos - Array of crypto data objects.
 * @returns {number} - The percentage of the portfolio allocated to USDC.
 */
function getUSDCShare(cryptos: CryptoData[]): number {
  const highRiskCount = cryptos.filter(c => c.data.risk_score > HIGH_RISK_THRESHOLD).length;
  const totalCount = cryptos.length;

  if (highRiskCount === totalCount) return 100;
  if (highRiskCount >= totalCount * 0.75) return 75;
  if (highRiskCount > totalCount / 2) return 50;
  if (highRiskCount >= totalCount * 0.25) return 25;
  return 0;
}

/**
 * Filters cryptocurrencies to include only those meeting RSI and performance criteria.
 * @param {CryptoData[]} cryptos - Array of crypto data objects.
 * @returns {CryptoData[]} - Filtered array of eligible cryptocurrencies.
 */
function filterEligibleCryptos(cryptos: CryptoData[]): CryptoData[] {
  return cryptos.filter(c => {
    const rsiOK = c.data.rsi_1d >= 1 && c.data.rsi_1d <= 60;
    const perfOK =
      (c.data.perf_120d ?? 0) !== 0 ||
      (c.data.perf_90d ?? 0) !== 0 ||
      (c.data.perf_60d ?? 0) !== 0 ||
      (c.data.perf_30d ?? 0) !== 0 ||
      c.data.perf_7d > 0 ||
      c.data.perf_1d > 0;
    return c.data.risk_score <= HIGH_RISK_THRESHOLD || (rsiOK && perfOK);
  });
}

/**
 * Calculates the average performance from multiple timeframes, ignoring zeros.
 * @param {CryptoData} c - A single crypto data object.
 * @returns {number} - The average performance value.
 */
function calculatePerfValue(c: CryptoData): number {
  const perfList = [c.data.perf_30d, c.data.perf_60d, c.data.perf_90d, c.data.perf_120d].filter(p => p !== undefined && p !== 0);
  return perfList.length > 0 ? perfList.reduce((a, b) => a + b, 0) / perfList.length : 0;
}

/**
 * Distributes portfolio allocations among candidates based on their metrics.
 * Respects minimum and maximum allocation constraints.
 * @param {{ symbol: string; metric: number }[]} candidates - Array of crypto symbols with their computed metrics.
 * @param {number} totalShare - The percentage of the portfolio available for allocation.
 * @returns {{ symbol: string; allocation: number }[]} - Array of symbols with their allocated percentage.
 */
function distributeAllocations(candidates: { symbol: string; metric: number }[], totalShare: number) {
  const wallet: { symbol: string; allocation: number }[] = [];
  let remaining = totalShare;
  let workingCandidates = candidates.map(c => ({ ...c, allocation: 0 }));

  while (workingCandidates.length > 0 && remaining > 0) {
    const sumMetric = workingCandidates.reduce((s, c) => s + (c.metric > 0 ? c.metric : 0), 0);
    let redistributed = false;

    for (const c of workingCandidates) {
      const alloc = sumMetric > 0 ? (c.metric / sumMetric) * remaining : remaining / workingCandidates.length;
      if (alloc > MAX_ALLOCATION) {
        wallet.push({ symbol: c.symbol, allocation: MAX_ALLOCATION });
        remaining -= MAX_ALLOCATION;
        redistributed = true;
      } else if (alloc < MIN_ALLOCATION) {
        wallet.push({ symbol: c.symbol, allocation: MIN_ALLOCATION });
        remaining -= MIN_ALLOCATION;
        redistributed = true;
      } else {
        c.allocation = alloc;
      }
    }

    if (!redistributed) {
      for (const c of workingCandidates) {
        wallet.push({ symbol: c.symbol, allocation: Number(c.allocation.toFixed(2)) });
      }
      break;
    }

    workingCandidates = workingCandidates.filter(c => !wallet.find(w => w.symbol === c.symbol));
  }

  return wallet;
}

/**
 * Computes the ideal portfolio allocation based on crypto data.
 * Considers risk, volatility, and performance metrics, enforcing constraints on min/max allocation.
 * @param {CryptoData[]} cryptos - Array of crypto data objects.
 * @returns {Promise<{ symbol: string; allocation: number }[]>} - The ideal portfolio allocation.
 */
export async function computeIdealWallet(cryptos: CryptoData[]) {
  const usdcShare = getUSDCShare(cryptos);
  const eligibleCryptos = filterEligibleCryptos(cryptos);

  const scored = eligibleCryptos.map(c => {
    const perfValue = calculatePerfValue(c);
    const safeRisk = Math.max(c.data.risk_score, 0.0001);
    const metric = perfValue > 0 ? perfValue / (safeRisk * safeRisk) : -Infinity;

    console.log(`${c.symbol} → avgPerf=${perfValue}, risk_score=${c.data.risk_score}, metric=${metric}`);

    return { ...c, metric };
  });

  const scoredNoUSDC = scored
    .filter(c => c.symbol.toUpperCase() !== 'USDC' && c.metric !== -Infinity)
    .sort((a, b) => b.metric - a.metric)
    .slice(0, MAX_CRYPTOS);

  const wallet: { symbol: string; allocation: number }[] = [];
  if (usdcShare > 0) wallet.push({ symbol: 'USDC', allocation: usdcShare });

  if (scoredNoUSDC.length === 0) {
    if (wallet.length === 0) wallet.push({ symbol: 'USDC', allocation: 100 });
    return wallet;
  }

  wallet.push(
    ...distributeAllocations(
      scoredNoUSDC.map(c => ({ symbol: c.symbol, metric: c.metric })),
      Math.max(0, 100 - usdcShare)
    )
  );

  let totalAlloc = wallet.reduce((s, w) => s + w.allocation, 0);
  totalAlloc = Math.round((totalAlloc + Number.EPSILON) * 100) / 100;
  const diff = Number((100 - totalAlloc).toFixed(2));

  if (Math.abs(diff) > 0) {
    const idxUSDC = wallet.findIndex(w => w.symbol.toUpperCase() === 'USDC');
    const targetIndex = idxUSDC !== -1 ? idxUSDC : 0;
    wallet[targetIndex].allocation = Number((wallet[targetIndex].allocation + diff).toFixed(2));
  }

  return wallet;
}
