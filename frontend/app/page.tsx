'use client';

import dynamic from 'next/dynamic';
import { Typography, Box } from '@mui/material';
import { Data, Layout } from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function Home() {
  const data: Data[] = [
    {
      values: [16, 15, 12, 6, 5, 4, 42],
      labels: ['US', 'China', 'European Union', 'Russian Federation', 'Brazil', 'India', 'Rest of World'],
      domain: { column: 0 },
      name: 'GHG Emissions',
      hoverinfo: 'label+percent+name',
      hole: 0.4,
      type: 'pie'
    },
    {
      values: [27, 11, 25, 8, 1, 3, 25],
      labels: ['US', 'China', 'European Union', 'Russian Federation', 'Brazil', 'India', 'Rest of World'],
      text: 'CO2',
      textposition: 'inside',
      domain: { column: 1 },
      name: 'CO2 Emissions',
      hoverinfo: 'label+percent+name',
      hole: 0.4,
      type: 'pie'
    }
  ];

  const layout: Partial<Layout> = {
    title: {
      text: 'Global Emissions 1990-2011'
    },
    annotations: [
      {
        font: { size: 20 },
        showarrow: false,
        text: 'GHG',
        x: 0.17,
        y: 0.5
      },
      {
        font: { size: 20 },
        showarrow: false,
        text: 'CO2',
        x: 0.82,
        y: 0.5
      }
    ],
    height: 400,
    width: 600,
    showlegend: false,
    grid: { rows: 1, columns: 2 }
  };

  return (
    <Box>
      <Typography variant="h4">Hello world!</Typography>
      <Plot data={data} layout={layout} />
    </Box>
  );
}
