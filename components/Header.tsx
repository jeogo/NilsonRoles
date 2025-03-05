import { Box, Container, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

export const Header = () => (
  <Box
    component={motion.div}
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    sx={{
      width: '100%',
      py: 2,
      px: 4,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0,0,0,0.1)',
      position: 'fixed',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)'
    }}
  >
    <Container maxWidth="lg">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        gap: 2
      }}>
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          sx={{
            background: 'linear-gradient(45deg, #1a365d, #2c6faa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          محلل المواقع
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            sx={{ 
              borderRadius: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }
            }}
            href="https://www.nngroup.com/articles/ten-usability-heuristics/"
            target="_blank"
          >
            مبادئ نيلسون
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #2c6faa, #3c8dda)',
              '&:hover': {
                background: 'linear-gradient(45deg, #245a8c, #3178b9)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(44, 111, 170, 0.3)'
              }
            }}
          >
            ابدأ التحليل
          </Button>
        </Box>
      </Box>
    </Container>
  </Box>
);
