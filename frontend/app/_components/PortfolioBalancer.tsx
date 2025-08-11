'use client';

import { useState } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import CustomTitle from '@/components/CustomTitle';
import cryptoSelection from '@/core/domain/data/cryptoSelection.json' assert { type: 'json' };
import { CryptoSelection, CryptoData } from '@/shared/types/typeMainPage';
import { computeIdealWallet } from '@/core/domain/idealPortfolio';
import PortfolioBalancerChart from './PortfolioBalancerChart';
import { getRiskColor, formatPercent } from '@/shared/helpers';

export default function PortfolioBalancer() {
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<{ symbol: string; allocation: number }[] | null>(null);
  const [stats, setStats] = useState<{
    volatility: number;
    risk: number;
    perf_1d: number;
    perf_7d: number;
    perf_30d: number;
    perf_60d: number;
    perf_90d: number;
    perf_120d: number;
  } | null>(null);

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
    setWallet(null);
    setStats(null);
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
      setWallet(computedWallet);

      const initial = {
        volatility: 0,
        risk: 0,
        perf_1d: 0,
        perf_7d: 0,
        perf_30d: 0,
        perf_60d: 0,
        perf_90d: 0,
        perf_120d: 0,
      };

      const aggregated = computedWallet.reduce((acc, { symbol, allocation }) => {
        const w = allocation / 100;
        const found = cryptos.find((c) => c.symbol === symbol);
        if (found) {
          acc.volatility += (found.data.volatility ?? 0) * w;
          acc.risk += (found.data.risk_score ?? 0) * w;
          acc.perf_1d += (found.data.perf_1d ?? 0) * w;
          acc.perf_7d += (found.data.perf_7d ?? 0) * w;
          acc.perf_30d += (found.data.perf_30d ?? 0) * w;
          acc.perf_60d += (found.data.perf_60d ?? 0) * w;
          acc.perf_90d += (found.data.perf_90d ?? 0) * w;
          acc.perf_120d += (found.data.perf_120d ?? 0) * w;
        }

        return acc;
      }, initial);

      setStats(aggregated);
    } catch (err) {
      console.error('Error fetching crypto selection data:', err);
    } finally {
      setLoading(false);
    }
  };

  const perfLabels = stats
    ? [
        { label: '1 Day', value: stats.perf_1d },
        { label: '7 Days', value: stats.perf_7d },
        { label: '30 Days', value: stats.perf_30d },
        { label: '60 Days', value: stats.perf_60d },
        { label: '90 Days', value: stats.perf_90d },
        { label: '120 Days', value: stats.perf_120d },
      ]
    : [];

  return (
    <Box sx={{ bgcolor: 'rgba(10, 26, 51, 0.7)', height: '100%', display: 'flex', flexDirection: 'column', color: 'white' }}>
      <CustomTitle
        title="RÉPARTITION DU WALLET OPTIMISÉE"
        buttonLabel="Générer le wallet optimal"
        onButtonClick={handleFetchData}
        loading={loading}
      />

      {wallet && stats && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', px: 3, gap: 3 }}>
          <Box sx={{ flex: 1, width: 0, height: '100%' }}>
            <PortfolioBalancerChart wallet={wallet} />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 1 }}>
            <Typography sx={{ color: '#8f00f5', fontWeight: 600, letterSpacing: 1, mb: 1, mt: 4 }}>
              Résumé du wallet
            </Typography>

            <Typography>
              <strong>Volatilité moyenne:</strong>{' '}
              <span style={{ color: 'white' }}>{stats.volatility.toFixed(3)}</span>
            </Typography>

            <Typography>
              <strong>Score de risque moyen:</strong>{' '}
              <span style={{ color: getRiskColor(stats.risk) }}>{stats.risk.toFixed(2)}</span>
            </Typography>

            <Divider sx={{ borderColor: '#ffffff', my: 2, opacity: 0.3 }} />

            <Typography sx={{ color: '#8f00f5', fontWeight: 600 }}>Performance moyenne</Typography>
            {perfLabels.map(({ label, value }) => (
              <Typography key={label}>
                <strong>{label}:</strong>{' '}
                <span style={{ color: '#00ff88' }}>{formatPercent(value)}</span>
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
