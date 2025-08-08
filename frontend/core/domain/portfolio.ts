import { ExtendedRiskData } from '@/shared/types/typeMainPage';

export type PortfolioAverages = {
  avgRisk: number;
  avgVolatility: number;
  avgPerf1d: number;
  avgPerf7d: number;
  avgPerf30d: number;
  avgPerf60d: number;
  avgPerf90d: number;
  avgPerf120d: number;
}

/**
 * Calculate weighted averages of risk, volatility and performance metrics for a portfolio.
 *
 * @param dataList - List of ExtendedRiskData representing each asset in the portfolio
 * @returns PortfolioAverages - Object containing weighted averages of key metrics
 */
export function calculatePortfolioAverages(dataList: ExtendedRiskData[]): PortfolioAverages {
  if (dataList.length === 0) {
    return {
      avgRisk: 0,
      avgVolatility: 0,
      avgPerf1d: 0,
      avgPerf7d: 0,
      avgPerf30d: 0,
      avgPerf60d: 0,
      avgPerf90d: 0,
      avgPerf120d: 0,
    };
  }

  const totalPortfolio = dataList.reduce((sum, item) => sum + item.total, 0);

  const weightedSum = dataList.reduce(
    (acc, item) => {
      const weight = item.total / totalPortfolio;
      acc.risk += item.risk_score * weight;
      acc.volatility += item.volatility * weight;
      acc.perf1d += item.perf_1d * weight;
      acc.perf7d += item.perf_7d * weight;
      acc.perf30d += item.perf_30d * weight;
      acc.perf60d += item.perf_60d * weight;
      acc.perf90d += item.perf_90d * weight;
      acc.perf120d += item.perf_120d * weight;
      return acc;
    },
    {
      risk: 0,
      volatility: 0,
      perf1d: 0,
      perf7d: 0,
      perf30d: 0,
      perf60d: 0,
      perf90d: 0,
      perf120d: 0,
    }
  );

  return {
    avgRisk: weightedSum.risk,
    avgVolatility: weightedSum.volatility,
    avgPerf1d: weightedSum.perf1d,
    avgPerf7d: weightedSum.perf7d,
    avgPerf30d: weightedSum.perf30d,
    avgPerf60d: weightedSum.perf60d,
    avgPerf90d: weightedSum.perf90d,
    avgPerf120d: weightedSum.perf120d,
  };
}
