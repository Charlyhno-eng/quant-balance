'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import CustomTitle from '@/components/CustomTitle';
import cryptoSelection from '@/core/domain/data/cryptoSelection.json' assert { type: 'json' };
import { CryptoSelection, CryptoData } from '@/shared/types/typeMainPage';
import { computeIdealWallet } from '@/core/domain/idealPortfolio';
import PortfolioBalancerChart from './PortfolioBalancerChart';

export default function PortfolioBalancer() {
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<{ symbol: string; allocation: number }[] | null>(null);

  const fetchRiskData = async (symbol: string) => {
    const response = await fetch(`http://127.0.0.1:8000/crypto_data?symbol=${encodeURIComponent(symbol)}`, { method: 'GET' });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Risk data fetch failed');
    }

    return response.json();
  };

  const handleFetchData = async () => {
    setLoading(true);
    setWallet(null); // reset previous data
    try {
      const results = await Promise.all(
        (cryptoSelection as CryptoSelection[]).map(({ symbol }) =>
          fetchRiskData(symbol)
            .then((data) => ({ symbol, data }))
            .catch((err) => {
              console.error(`Failed to fetch ${symbol}:`, err);
              return null;
            })
        )
      );

      const cryptos: CryptoData[] = results.filter((r): r is CryptoData => r !== null);
      const computedWallet = await computeIdealWallet(cryptos);
      console.table(computedWallet);
      setWallet(computedWallet);
    } catch (err) {
      console.error('Error fetching crypto selection data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'rgba(10, 26, 51, 0.7)', height: '100%' }}>
      <CustomTitle
        title="RÉPARTITION DU WALLET OPTIMISÉE"
        buttonLabel="Générer le wallet optimal"
        onButtonClick={handleFetchData}
        loading={loading}
      />

      {wallet && (
        <Box sx={{ mt: 4 }}>
          <PortfolioBalancerChart wallet={wallet} />
        </Box>
      )}
    </Box>
  );
}
