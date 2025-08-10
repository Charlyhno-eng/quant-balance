export type RiskData = {
  symbol: string;
  price_eur: number;
  volatility: number;
  risk_score: number;
  rsi_1h: number;
  rsi_4h: number;
  rsi_1d: number;
  perf_1d: number;
  perf_7d: number;
  perf_30d: number;
  perf_60d: number;
  perf_90d: number;
  perf_120d: number;
};

export type ExtendedRiskData = RiskData & { amount: number; total: number; allocation?: number };
export type ExtendedRiskDataKeys = keyof RiskData | 'amount' | 'total' | 'allocation';

export type SymbolAmount = { symbol: string; amount: number };

export type CryptoSelection = {
  symbol: string;
}

export type CryptoData = {
  symbol: string;
  data: {
    symbol: string;
    price_eur: number;
    risk_score: number;
    volatility: number;
    rsi_1d: number;
    perf_1d: number;
    perf_7d: number;
    perf_30d: number;
    perf_60d: number;
    perf_90d: number;
    perf_120d: number;
  };
}

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
