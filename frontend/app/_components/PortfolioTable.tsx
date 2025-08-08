'use client';

import { useState } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import { ExtendedRiskDataKeys, ExtendedRiskData } from '@/shared/types/typeMainPage';
import { getPerfColor, getRSIColor, getRiskColor, sortByKey } from '@/shared/helpers';
import { TABLE_COLUMNS } from '@/shared/constants';

const sortableKeys = [
  'total',
  'volatility',
  'risk_score',
  'perf_1d',
  'perf_7d',
  'perf_30d',
  'perf_60d',
  'perf_90d',
  'perf_120d',
  'rsi_1h',
  'rsi_4h',
  'rsi_1d',
] as ExtendedRiskDataKeys[];

export default function PortfolioTable({ dataList }: { dataList: ExtendedRiskData[] }) {
  const [sortConfig, setSortConfig] = useState<{ key: ExtendedRiskDataKeys | null; direction: 'asc' | 'desc' }>({
    key: 'total',
    direction: 'desc',
  });

  const handleSort = (key: ExtendedRiskDataKeys) => {
    if (sortConfig.key === key) {
      setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ key, direction: 'desc' });
    }
  };

  const sortedData = sortByKey(dataList, sortConfig.key, sortConfig.direction);

  return (
    <Paper sx={{ width: "100%", p: 2, height: "40vh", overflowY: "auto", bgcolor: "rgba(10, 26, 51, 0.7)" }}>
      <Table sx={{ width: "100%", tableLayout: "fixed", borderCollapse: "separate", borderSpacing: 0 }}>
        <TableHead>
          <TableRow>
            {TABLE_COLUMNS.map(({ label, key }) => {
              const typedKey = key as ExtendedRiskDataKeys;
              const isSortable = sortableKeys.includes(typedKey);

              return (
                <TableCell
                  key={key}
                  onClick={() => isSortable && handleSort(typedKey)}
                  sx={{
                    fontWeight: 600,
                    color: isSortable ? "#8f00f5" : "#ffffff",
                    cursor: isSortable ? 'pointer' : 'default',
                    borderRight: key === 'symbol' || key === 'risk_score' || key === 'perf_120d' ? '2px solid rgba(255,255,255,0.2)' : undefined
                  }}
                >
                  {label}
                  {isSortable && sortConfig.key === typedKey && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((data) => (
            <TableRow key={data.symbol} sx={{ '&:last-child td': { borderBottom: 'none' } }}>
              {TABLE_COLUMNS.map(({ key, isPercent, decimals = 2 }) => {
                const typedKey = key as ExtendedRiskDataKeys;
                const value = data[typedKey];
                let color = "#e0e0e0";

                if (typeof value === "number") {
                  if (key.startsWith('perf_')) color = getPerfColor(value);
                  else if (key.startsWith('rsi_')) color = getRSIColor(value);
                  else if (key === 'risk_score') color = getRiskColor(value);

                  return (
                    <TableCell
                      key={key}
                      sx={{
                        color,
                        fontWeight: key === 'total' ? 600 : undefined,
                        borderRight: key === 'symbol' || key === 'risk_score' || key === 'perf_120d' ? '2px solid rgba(255,255,255,0.2)' : undefined
                      }}
                    >
                      {value.toFixed(decimals)} {isPercent ? "%" : ""}
                    </TableCell>
                  );
                }

                return (
                  <TableCell
                    key={key}
                    sx={{
                      color: "#e0e0e0",
                      fontWeight: key === 'total' ? 600 : undefined,
                      borderRight: key === 'symbol' || key === 'risk_score' || key === 'perf_120d' ? '2px solid rgba(255,255,255,0.2)' : undefined
                    }}
                  >
                    {value}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
