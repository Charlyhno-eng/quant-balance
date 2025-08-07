import { Box, Typography } from '@mui/material';
import { ExtendedRiskData } from '@/shared/types/typeMainPage';

export default function GraphiqueUn({ dataList }: { dataList: ExtendedRiskData[] }) {
  return (
    <Box sx={{ bgcolor: 'rgba(10, 26, 51, 0.7)', borderRadius: 1, height: '100%' }}>
      <Typography sx={{ p: 2, color: 'white' }}>Graphique Un</Typography>
    </Box>
  );
}
