'use client';

import { useMemo } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import CustomTitle from '@/components/CustomTitle';
import { ExtendedRiskData } from '@/shared/types/typeMainPage';
import { getRiskColor, formatPercent, calculateTotalPortfolioValue } from '@/shared/helpers';
import { calculatePortfolioAverages } from '@/core/domain/portfolio';
import { useRouter } from 'next/navigation';
import PortfolioDistributionChart from './PortfolioDistributionChart';

export default function PortfolioDistribution({ dataList }: { dataList: ExtendedRiskData[] }) {
  const router = useRouter();

  const { avgRisk, avgVolatility, avgPerf1d, avgPerf7d, avgPerf30d, avgPerf60d, avgPerf90d, avgPerf120d } =
    useMemo(() => calculatePortfolioAverages(dataList), [dataList]);
  const totalPortfolioValue = useMemo(() => calculateTotalPortfolioValue(dataList), [dataList]);

  const perfLabels = [
    { label: '1 Day', value: avgPerf1d },
    { label: '7 Days', value: avgPerf7d },
    { label: '30 Days', value: avgPerf30d },
    { label: '60 Days', value: avgPerf60d },
    { label: '90 Days', value: avgPerf90d },
    { label: '120 Days', value: avgPerf120d },
  ];

  return (
    <Box sx={{ bgcolor: 'rgba(10, 26, 51, 0.7)', height: '100%', display: 'flex', flexDirection: 'column', color: 'white' }}>
      <CustomTitle
        title="RÉPARTITION DU WALLET"
        buttonLabel="Modifier le wallet"
        onButtonClick={() => router.push('/myWallet')}
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', px: 3, gap: 3 }}>
        <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
          <PortfolioDistributionChart dataList={dataList} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 1 }}>
          <Typography sx={{ color: '#8f00f5', fontWeight: 600, letterSpacing: 1, mb: 1, mt: 4 }}>
            Résumé du wallet
          </Typography>

          <Typography>
            <strong>Valeur totale:</strong>{' '}
            <span>{totalPortfolioValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
          </Typography>

          <Typography>
            <strong>Volatilité moyenne:</strong>{' '}
            <span style={{ color: 'white' }}>{avgVolatility.toFixed(3)}</span>
          </Typography>

          <Typography>
            <strong>Score de risque moyen:</strong>{' '}
            <span style={{ color: getRiskColor(avgRisk) }}>{avgRisk.toFixed(2)}</span>
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
    </Box>
  );
}
