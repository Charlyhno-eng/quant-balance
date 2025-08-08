'use client';

import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import Plotly, { PieData, Layout } from 'plotly.js-dist-min';
import { ExtendedRiskData } from '@/shared/types/typeMainPage';
import { generateColors, sortByTotalDesc } from '@/shared/helpers';

export default function GraphiqueUn({ dataList }: { dataList: ExtendedRiskData[] }) {
  const chartRef = useRef<HTMLDivElement>(null);
console.log(dataList)
  useEffect(() => {
    if (!chartRef.current || dataList.length === 0) return;

    const chartNode = chartRef.current;
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
        showlegend: true
      }
    ];

    const layout: Partial<Layout> = {
      paper_bgcolor: 'rgba(10, 26, 51, 0.01)',
      plot_bgcolor: 'rgba(10, 26, 51, 0.01)',
      font: { color: 'white' }
    };

    Plotly.newPlot(chartNode, data, layout, { responsive: true });

    return () => Plotly.purge(chartNode);
  }, [dataList]);

  return (
    <Box sx={{ bgcolor: 'rgba(10, 26, 51, 0.7)', borderRadius: 1, height: '100%' }}>
      <Typography sx={{ p: 2, color: 'white' }}>Répartition du portefeuille</Typography>
      <Box ref={chartRef} sx={{ width: '100%', height: 'calc(100% - 48px)' }} />
    </Box>
  );
}
