import { Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import { ExtendedRiskDataKeys, ExtendedRiskData } from '@/shared/types/typeMainPage';
import { getPerfColor, getRSIColor, getRiskColor } from '@/shared/helpers';
import { TABLE_COLUMNS } from '@/shared/constants';

export default function PortfolioTable({ dataList }: { dataList: ExtendedRiskData[] }) {
  return (
    <Paper sx={{ width: "100%", p: 2, height: "40vh", overflowY: "auto", bgcolor: "rgba(10, 26, 51, 0.7)" }}>
      <Table sx={{ width: "100%", tableLayout: "fixed", borderCollapse: "separate", borderSpacing: 0 }}>
        <TableHead>
          <TableRow>
            {TABLE_COLUMNS.map(({ label, key }) => (
              <TableCell
                key={key}
                sx={{ fontWeight: 600, color: "#ffffff", borderRight: key === 'symbol' || key === 'risk_score' || key === 'perf_120d' ? '2px solid rgba(255,255,255,0.2)' : undefined }}
              >
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dataList.map((data) => (
            <TableRow key={data.symbol} sx={{ '&:last-child td': { borderBottom: 'none' } }}>
              {TABLE_COLUMNS.map(({ key, isPercent, decimals = 2 }) => {
                const typedKey = key as ExtendedRiskDataKeys;
                const value = data[typedKey];
                let color = "#e0e0e0";

                if (typeof value === "number") {
                  if (key.startsWith('perf_')) {
                    color = getPerfColor(value);
                  } else if (key.startsWith('rsi_')) {
                    color = getRSIColor(value);
                  } else if (key === 'risk_score') {
                    color = getRiskColor(value);
                  }

                  return (
                    <TableCell key={key} sx={{ color, borderRight: key === 'symbol' || key === 'risk_score' || key === 'perf_120d' ? '2px solid rgba(255,255,255,0.2)' : undefined }}>
                      {value.toFixed(decimals)} {isPercent ? "%" : ""}
                    </TableCell>
                  );
                }

                return (
                  <TableCell key={key} sx={{ color: "#e0e0e0", borderRight: key === 'symbol' || key === 'risk_score' || key === 'perf_120d' ? '2px solid rgba(255,255,255,0.2)' : undefined }}>
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
