import { Box, Container, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      sx={{
        width: '100%',
        py: 4,
        mt: 8,
        background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(244,247,254,1) 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © 2023 - جميع الحقوق محفوظة
        </Typography>
      </Container>
    </Box>
  );
}
