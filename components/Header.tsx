import { Box, Container, Typography, Button } from '@mui/material';

export default function Header() {
  return (
    <Box
      sx={{
        width: '100%',
        py: 2,
        px: 4,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        position: 'fixed',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            تحليل المواقع
          </Typography>
     
        </Box>
      </Container>
    </Box>
  );
}
