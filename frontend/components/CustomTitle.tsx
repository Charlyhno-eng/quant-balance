import { Box, Typography, Divider, Button } from '@mui/material';

type CustomTitleProps = {
  title: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function CustomTitle({ title, buttonLabel, onButtonClick, loading, disabled }: CustomTitleProps) {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '1.2rem', letterSpacing: 1 }}>
          {title}
        </Typography>

        {buttonLabel && onButtonClick && (
          <Button
            variant="contained"
            onClick={onButtonClick}
            disabled={disabled}
            sx={{ bgcolor: '#8f00f5', fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#6c00b8' } }}
          >
            {loading ? 'Chargement...' : buttonLabel}
          </Button>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.3)', mx: 3, mb: 1, borderWidth: 1 }} />
    </>
  );
}
