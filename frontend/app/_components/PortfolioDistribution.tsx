'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import type { PieData, Layout } from 'plotly.js-dist-min';
import { ExtendedRiskData } from '@/shared/types/typeMainPage';
import { generateColors, sortByTotalDesc, getRiskColor, formatPercent } from '@/shared/helpers';
import { calculatePortfolioAverages } from '@/core/domain/portfolio';

export default function PortfolioDistribution({ dataList }: { dataList: ExtendedRiskData[] }) {
  const chartRef = useRef<HTMLDivElement>(null);

  const { avgRisk, avgVolatility, avgPerf1d, avgPerf7d, avgPerf30d, avgPerf60d, avgPerf90d, avgPerf120d } = useMemo(() => calculatePortfolioAverages(dataList), [dataList]);

  useEffect(() => {
    if (!chartRef.current || dataList.length === 0) return;

    import('plotly.js-dist-min').then(Plotly => {
      const chartNode = chartRef.current!;
      const sortedData = sortByTotalDesc(dataList);
      const values = sortedData.map(item => item.total);
      const labels = sortedData.map(item => item.symbol);
      const colors = generateColors(sortedData.length);

      const data: Partial<PieData>[] = [
        {
          values,
          labels,
          type: 'pie',
          hole: 0.4,
          hovertemplate: '%{label}<br>%{percent}<br>%{value:.2f} €<extra></extra>',
          textinfo: 'label+percent',
          textposition: 'inside',
          marker: { colors },
          showlegend: true,
        },
      ];

      const layout: Partial<Layout> = {
        paper_bgcolor: 'rgba(10, 26, 51, 0.01)',
        plot_bgcolor: 'rgba(10, 26, 51, 0.01)',
        font: { color: '#8f00f5', family: "'Orbitron', sans-serif" },
        legend: { font: { color: 'white' }, orientation: 'v', x: 1, y: 0.5 },
        margin: { t: 30, b: 30, l: 20, r: 100 },
      };

      Plotly.newPlot(chartNode, data, layout, { responsive: true });

      return () => {
        if (chartRef.current) Plotly.purge(chartRef.current);
      };
    });
  }, [dataList]);

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
      <Typography sx={{ px: 3, py: 2, fontWeight: 600, fontSize: '1.2rem', letterSpacing: 1, color: 'white', textShadow: 'none' }}>
        RÉPARTITION DU WALLET
      </Typography>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.3)', mx: 3, mb: 1, borderWidth: 1 }} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', px: 3, gap: 3, overflow: 'hidden' }}>
        <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
          <Box ref={chartRef} sx={{ width: '100%', height: '100%' }} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 1 }}>
          <Typography sx={{ color: '#8f00f5', fontWeight: 600, letterSpacing: 1, mb: 1, mt: 8 }}>
            Résumé du wallet
          </Typography>

          <Typography>
            <strong>Score de risque moyen:</strong>{' '}
            <span style={{ color: getRiskColor(avgRisk) }}>{avgRisk.toFixed(2)}</span>
          </Typography>

          <Typography>
            <strong>Volatilité moyenne:</strong>{' '}
            <span style={{ color: 'white' }}>{avgVolatility.toFixed(3)}</span>
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
