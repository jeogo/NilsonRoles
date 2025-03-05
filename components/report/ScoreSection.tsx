import { motion } from 'framer-motion';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const ScoreCircle = ({ score, size = 120 }) => (
  <Box
    component={motion.div}
    whileHover={{ scale: 1.05 }}
    sx={{
      position: 'relative',
      width: size,
      height: size,
      borderRadius: '50%',
      background: `conic-gradient(
        ${score >= 80 ? '#4caf50' : score >= 60 ? '#ff9800' : '#f44336'} ${score}%,
        rgba(0,0,0,0.1) ${score}%
      )`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: '5px',
        borderRadius: '50%',
        background: 'white'
      }
    }}
  >
    <Typography 
      variant="h3" 
      component="div" 
      sx={{ 
        position: 'relative',
        zIndex: 1,
        fontWeight: 'bold',
        background: 'linear-gradient(45deg, #1a365d, #2c6faa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}
    >
      {score}
    </Typography>
  </Box>
);

// ... Continue with other score-related components
