'use client';

import { useState, useEffect } from 'react';
import { Box, Table, TableHead, TableRow, TableCell, TableBody, Typography, Paper, CircularProgress } from '@mui/material';
import { RiskData } from '@/shared/types/typeMainPage';

const symbolsWithAmount: { symbol: string; amount: number }[] = [
  { symbol: "ENA", amount: 8000 },
  { symbol: "RAY", amount: 1142 },
  { symbol: "JUP", amount: 6000 },
  { symbol: "MORPHO", amount: 1285 },
  { symbol: "EIGEN", amount: 1700 },
  { symbol: "RSR", amount: 180000 },
];

const columns = [
  { key: 'symbol', label: 'Ticker' },
  { key: 'amount', label: 'Nombre de token' },
  { key: 'price_eur', label: 'Prix (€)', decimals: 4 },
  { key: 'total', label: 'Total (€)', decimals: 2 },
  { key: 'allocation', label: 'Répartition (%)', decimals: 2 },
  { key: 'volatility', label: 'Volatilité', decimals: 4 },
  { key: 'risk_score', label: 'Risque', decimals: 2 },
  { key: 'perf_1d', label: 'Perf 1d', isPercent: true, decimals: 2 },
  { key: 'perf_7d', label: 'Perf 7d', isPercent: true, decimals: 2 },
  { key: 'perf_30d', label: 'Perf 30d', isPercent: true, decimals: 2 },
  { key: 'perf_60d', label: 'Perf 60d', isPercent: true, decimals: 2 },
  { key: 'perf_90d', label: 'Perf 90d', isPercent: true, decimals: 2 },
  { key: 'perf_120d', label: 'Perf 120d', isPercent: true, decimals: 2 },
  { key: 'rsi_1h', label: 'RSI 1h', decimals: 2 },
  { key: 'rsi_4h', label: 'RSI 4h', decimals: 2 },
  { key: 'rsi_1d', label: 'RSI 1d', decimals: 2 },
];

const fetchRiskData = async (symbol: string): Promise<RiskData> => {
  const response = await fetch(`http://127.0.0.1:8000/crypto_data?symbol=${encodeURIComponent(symbol)}`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Risk data fetch failed");
  }

  return response.json();
};

type ExtendedRiskData = RiskData & { amount: number; total: number; allocation?: number };
type ExtendedRiskDataKeys = keyof RiskData | 'amount' | 'total' | 'allocation';

export default function Home() {
  const [dataList, setDataList] = useState<ExtendedRiskData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setError(null);
      setLoading(true);

      try {
        const results = await Promise.all(
          symbolsWithAmount.map(({ symbol, amount }) =>
            fetchRiskData(symbol)
              .then((data) => {
                const total = data.price_eur * amount;
                return { ...data, amount, total };
              })
              .catch((err: unknown) => {
                console.error(`Failed to fetch ${symbol}:`, err);
                return null;
              })
          )
        );

        const filtered = results.filter((r): r is ExtendedRiskData => r !== null);
        const totalPortfolio = filtered.reduce((sum, d) => sum + d.total, 0);

        const withAllocation = filtered.map((d) => ({
          ...d, allocation: totalPortfolio > 0 ? (d.total / totalPortfolio) * 100 : 0,
        }));

        setDataList(withAllocation);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {loading && <CircularProgress />}
      {error && (<Typography color="error" sx={{ mt: 2 }}>{error}</Typography>)}
      {!loading && dataList.length === 0 && !error && (<Typography>Aucune donnée disponible.</Typography>)}

      {!loading && dataList.length > 0 && (
        <Paper sx={{ width: "100%", height: "40vh", overflowY: "auto" }}>
          <Table sx={{ width: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                {columns.map(({ label }) => (
                  <TableCell key={label} sx={{ fontWeight: 600 }}>{label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dataList.map((data) => (
                <TableRow key={data.symbol}>
                  {columns.map(({ key, isPercent, decimals = 2 }) => {
                    const typedKey = key as ExtendedRiskDataKeys;
                    const value = data[typedKey];
                    if (typeof value === "number") {
                      return (
                        <TableCell key={key}>{value.toFixed(decimals)} {isPercent ? "%" : ""}</TableCell>
                      );
                    }
                    return <TableCell key={key}>{value}</TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
