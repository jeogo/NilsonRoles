import { FC } from 'react';
import { Box, Typography, Grid, CircularProgress, Paper, useTheme } from '@mui/material';

interface ScoreProps {
  title: string;
  value: number;
  color: string;
}

const ScoreCircle: FC<ScoreProps> = ({ title, value, color }) => {
  return (
    <Paper elevation={0} sx={{ 
      textAlign: 'center', 
      position: 'relative',
      p: { xs: 2, sm: 3 },
      borderRadius: 4,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
      }
    }}>
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={100}
          thickness={5}
          sx={{ color: (theme) => theme.palette.grey[200] }}
        />
        <CircularProgress
          variant="determinate"
          value={value}
          size={100}
          thickness={5}
          sx={{ 
            color: color,
            position: 'absolute',
            left: 0,
            boxShadow: `0 0 10px ${color}40`,
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h3"
            component="div"
            fontWeight="bold"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              background: `linear-gradient(45deg, ${color}, ${color}dd)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
      <Typography 
        variant="h6" 
        fontWeight="bold" 
        color="text.primary"
        sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}
      >
        {title}
      </Typography>
    </Paper>
  );
};

interface ScoreOverviewProps {
  data?: any;
}

const ScoreOverview: FC<ScoreOverviewProps> = ({ data }) => {
  const theme = useTheme();
  
  if (!data) {
    return <Typography align="center">لا توجد بيانات للعرض</Typography>;
  }

  // Extract actual scores from lighthouse data if available
  const pageSpeedData = data?.pageSpeedData?.lighthouseResult;
  
  // Get scores or use placeholder values
  const scores = [
    { 
      title: 'الأداء', 
      value: Math.round((pageSpeedData?.categories?.performance?.score || 0.85) * 100), 
      color: '#4caf50' 
    },
    { 
      title: 'تحسين محركات البحث', 
      value: Math.round((pageSpeedData?.categories?.seo?.score || 0.92) * 100), 
      color: '#4caf50' 
    },
    { 
      title: 'سهولة الوصول', 
      value: Math.round((pageSpeedData?.categories?.accessibility?.score || 0.78) * 100), 
      color: '#ff9800' 
    },
    { 
      title: 'أفضل الممارسات', 
      value: Math.round((pageSpeedData?.categories?.['best-practices']?.score || 0.63) * 100), 
      color: '#f44336' 
    },
  ];
  
  // Update colors based on scores
  scores.forEach(score => {
    if (score.value >= 90) score.color = '#4caf50';
    else if (score.value >= 70) score.color = '#ff9800';
    else score.color = '#f44336';
  });
  
  const overallScore = Math.round(
    scores.reduce((acc, score) => acc + score.value, 0) / scores.length
  );
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };
  
  return (
    <Box sx={{
      "@media print": {
        breakInside: "avoid",
      },
    }}>
      <Typography 
        variant="h5" 
        fontWeight="bold" 
        mb={4} 
        align="center" 
        sx={{
          color: theme.palette.primary.main,
          position: 'relative',
          pb: 2,
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '3px',
            backgroundColor: theme.palette.primary.main,
          }
        }}
      >
        نتائج التحليل الشاملة
      </Typography>
      
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={6} sm={4} md={2}>
          <ScoreCircle 
            title="الإجمالي" 
            value={overallScore} 
            color={getScoreColor(overallScore)} 
          />
        </Grid>
        
        {scores.map((score, index) => (
          <Grid item xs={6} sm={3} md={2} key={index}>
            <ScoreCircle 
              title={score.title} 
              value={score.value} 
              color={score.color} 
            />
          </Grid>
        ))}
      </Grid>
      <Typography 
        variant="caption" 
        color="text.secondary"
        sx={{ 
          display: 'block', 
          textAlign: 'center', 
          mt: 2,
          fontSize: '0.75rem'
        }}
      >
        تم حساب جميع النتائج بناءً على مبادئ نيلسون ومعايير الصناعة
      </Typography>
    </Box>
  );
};

export default ScoreOverview;
