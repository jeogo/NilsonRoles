import { FC } from 'react';
import { Box, Typography, Grid, Paper, ListItemIcon, Alert, useTheme } from '@mui/material';
import { CheckCircle, Warning, Error } from '@mui/icons-material';

interface PieChartProps {
  data: any;
}

export const PieChart: FC<PieChartProps> = ({ data }) => {
  const theme = useTheme();
  
  // Skip rendering if no data available
  if (!data?.nelsonPrinciples?.length) {
    return (
      <Alert 
        severity="info" 
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        لم يتم العثور على بيانات مبادئ نيلسون للتصميم
      </Alert>
    );
  }

  // Sort principles by score for better readability
  const principles = [...data.nelsonPrinciples].sort((a, b) => b.score - a.score);

  const getStatusIcon = (score: number) => {
    if (score >= 80) return <CheckCircle color="success" sx={{ fontSize: 28 }} />;
    if (score >= 50) return <Warning color="warning" sx={{ fontSize: 28 }} />;
    return <Error color="error" sx={{ fontSize: 28 }} />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box>
      <Typography 
        variant="h5" 
        fontWeight="bold" 
        textAlign="center" 
        mb={4}
        color="primary"
        sx={{
          position: 'relative',
          pb: 2,
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '3px',
            backgroundColor: theme.palette.primary.main,
            borderRadius: '2px',
          }
        }}
      >
        ملخص تقييم مبادئ نيلسون العشرة للتصميم
      </Typography>
      
      <Typography 
        variant="subtitle1" 
        color="text.secondary" 
        sx={{ 
          textAlign: 'center', 
          mb: 4,
          maxWidth: '700px',
          mx: 'auto'
        }}
      >
        مصدر البيانات: تحليل داخلي يعتمد على بيانات PageSpeed وHTML وSecurity
      </Typography>
      
      <Grid container spacing={3}>
        {principles.map((principle: any, index: number) => {
          const scoreColor = getScoreColor(principle.score);
          return (
            <Grid item xs={12} sm={6} key={index}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                  },
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '5px',
                    height: '100%',
                    backgroundColor: scoreColor,
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  pl: 1
                }}>
                  <ListItemIcon sx={{ minWidth: '40px' }}>
                    {getStatusIcon(principle.score)}
                  </ListItemIcon>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold"
                    sx={{
                      color: theme.palette.text.primary
                    }}
                  >
                    {principle.name}
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ mb: 2, pl: 6 }}
                >
                  {principle.description}
                </Typography>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    alignItems: 'center' 
                  }}
                >
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx={{
                      color: scoreColor
                    }}
                  >
                    {principle.score}%
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
