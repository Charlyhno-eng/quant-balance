'use client';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { RiskData, ExtendedRiskData, SymbolAmount } from '@/shared/types/typeMainPage';
import PortfolioTable from './_components/PortfolioTable';
import PortfolioDistribution from './_components/PortfolioDistribution';
import PortfolioBalancer from './_components/PortfolioBalancer';
import myWalletWithAmount from '@/infrastructure/data/myWallet.json' assert { type: 'json' };

const typedMyWalletWithAmount = myWalletWithAmount as SymbolAmount[];

const fetchRiskData = async (symbol: string): Promise<RiskData> => {
  const response = await fetch(`http://127.0.0.1:8000/crypto_data?symbol=${encodeURIComponent(symbol)}`, { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Risk data fetch failed");
  }

  return response.json();
};

export default function Home() {
  const [myWalletList, setMyWalletList] = useState<ExtendedRiskData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      setError(null);

      try {
        const results = await Promise.all(
          typedMyWalletWithAmount.map(({ symbol, amount }) =>
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

        if (!isMounted) return;

        const filtered = results.filter((r): r is ExtendedRiskData => r !== null);
        const totalPortfolio = filtered.reduce((sum, d) => sum + d.total, 0);
        const withAllocation = filtered.map((d) => ({ ...d, allocation: totalPortfolio > 0 ? (d.total / totalPortfolio) * 100 : 0 }));

        setMyWalletList(withAllocation);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : String(err));
      }
    };

    fetchAll();
    const intervalId = setInterval(fetchAll, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      {error && (<Typography color="error" sx={{ mt: 2 }}>{error}</Typography>)}

      {myWalletList.length === 0 && !error && (<Typography>Chargement des données...</Typography>)}
      {myWalletList.length > 0 && (
        <>
          <Box sx={{ height: '40vh' }}><PortfolioTable dataList={myWalletList} /></Box>

          <Box sx={{ display: 'flex', height: '57vh', mt: 1, gap: 1 }}>
            <Box sx={{ width: '40%', height: '100%' }}><PortfolioDistribution dataList={myWalletList} /></Box>
            <Box sx={{ width: '60%', height: '100%' }}><PortfolioBalancer /></Box>
          </Box>
        </>
      )}
    </Box>
  );
}
