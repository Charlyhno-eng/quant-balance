'use client';

import { useEffect, useRef } from 'react';
import type { PieData, Layout } from 'plotly.js-dist-min';
import { ExtendedRiskData } from '@/shared/types/typeMainPage';
import { generateColors, sortByTotalDesc } from '@/shared/helpers';

export default function PortfolioDistributionChart({ dataList }: { dataList: ExtendedRiskData[] }) {
  const chartRef = useRef<HTMLDivElement>(null);

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

      return () => { if (chartRef.current) Plotly.purge(chartRef.current) };
    });
  }, [dataList]);

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
}
