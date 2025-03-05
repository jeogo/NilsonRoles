import { motion } from 'framer-motion';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export const PrincipleCard = ({ index }) => (
  <motion.div
    variants={cardVariants}
    initial="initial"
    animate="animate"
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <Card 
      className="card-hover glass"
      sx={{ 
        mb: 2, 
        borderRadius: 3,
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0,0,0,0.1)'
      }}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          {/* ... Card content ... */}
        </Grid>
      </CardContent>
    </Card>
  </motion.div>
);

// ... Continue with other Nelson principles components
