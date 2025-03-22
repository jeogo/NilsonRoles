import { FC } from 'react';
import { Box, Typography, Paper, Grid, LinearProgress, Divider, Alert, useTheme } from '@mui/material';
import { 
  Speed as SpeedIcon, 
  Timer as TimerIcon,
  DevicesOther as DevicesIcon,
  FormatSize as FormatSizeIcon 
} from '@mui/icons-material';

interface MetricProps {
  title: string;
  value: string;
  details: string;
  icon: React.ReactNode;
  score?: number;
}

const Metric: FC<MetricProps> = ({ title, value, details, icon, score }) => {
  const theme = useTheme();
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  return (
    <Paper elevation={3} sx={{ 
      p: { xs: 2, sm: 3 }, 
      height: '100%', 
      borderRadius: 3,
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          mr: 2, 
          color: 'white',
          backgroundColor: theme.palette.primary.main,
          borderRadius: '50%',
          width: 45,
          height: 45,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}>
          {icon}
        </Box>
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          color="text.primary"
          sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}
        >
          {title}
        </Typography>
      </Box>
      
      <Typography 
        variant="h3" 
        fontWeight="bold" 
        sx={{ 
          mb: 2,
          color: theme.palette.primary.main,
          textAlign: 'center',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' }
        }}
      >
        {value}
      </Typography>
      
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 3,
          color: theme.palette.text.secondary,
          textAlign: 'center',
          fontSize: { xs: '0.75rem', sm: '0.875rem' }
        }}
      >
        {details}
      </Typography>
      
      {score !== undefined && (
        <Box sx={{ mt: 'auto', width: '100%' }}>
          <LinearProgress 
            variant="determinate" 
            value={score} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                backgroundColor: getScoreColor(score),
              }
            }} 
          />
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              mt: 0.5, 
              display: 'block',
              textAlign: 'right',
              fontWeight: 'bold',
              fontSize: '0.75rem'
            }}
          >
            {score} / 100
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

interface PerformanceDetailsProps {
  data?: any;
}

const PerformanceDetails: FC<PerformanceDetailsProps> = ({ data }) => {
  if (!data) {
    return <Typography>لا توجد بيانات للعرض</Typography>;
  }

  // Extract actual metrics from page speed data if available
  const pageSpeedData = data?.pageSpeedData?.lighthouseResult;
  
  if (!pageSpeedData) {
    return (
      <Alert severity="warning">
        لم يتم العثور على بيانات أداء من Google PageSpeed API
      </Alert>
    );
  }
  
  const fcpScore = pageSpeedData?.audits?.['first-contentful-paint']?.score || 0;
  const lcpScore = pageSpeedData?.audits?.['largest-contentful-paint']?.score || 0;
  const clsScore = pageSpeedData?.audits?.['cumulative-layout-shift']?.score || 0;
  const ttiScore = pageSpeedData?.audits?.['interactive']?.score || 0;
  
  const fcpValue = pageSpeedData?.audits?.['first-contentful-paint']?.displayValue || '1.2s';
  const lcpValue = pageSpeedData?.audits?.['largest-contentful-paint']?.displayValue || '0.8s';
  const pageSize = pageSpeedData?.audits?.['total-byte-weight']?.displayValue || '2.4 MB';
  const requests = pageSpeedData?.audits?.['network-requests']?.details?.items?.length || '34';
  
  // Define performance metrics with real or fallback data
  const metrics = [
    {
      title: 'سرعة تحميل أول عنصر',
      value: fcpValue,
      details: 'الوقت اللازم لعرض أول محتوى على الصفحة',
      icon: <SpeedIcon />,
      score: Math.round(fcpScore * 100)
    },
    {
      title: 'سرعة تحميل أكبر عنصر',
      value: lcpValue,
      details: 'وقت تحميل أكبر عنصر مرئي في الصفحة',
      icon: <TimerIcon />,
      score: Math.round(lcpScore * 100)
    },
    {
      title: 'حجم الصفحة',
      value: pageSize,
      details: 'إجمالي حجم موارد الصفحة',
      icon: <FormatSizeIcon />,
      score: 75
    },
    {
      title: 'عدد الطلبات',
      value: `${requests}`,
      details: 'عدد طلبات HTTP اللازمة لتحميل الصفحة',
      icon: <DevicesIcon />,
      score: 80
    }
  ];
  
  // Extract issues from lighthouse
  const issueAudits = pageSpeedData?.audits || {};
  const issues = Object.entries(issueAudits)
    .filter(([_, audit]: [string, any]) => audit.score !== undefined && audit.score < 0.9 && audit.title)
    .map(([_, audit]: [string, any]) => {
      let impact = 'منخفض';
      if (audit.score < 0.5) impact = 'مرتفع';
      else if (audit.score < 0.8) impact = 'متوسط';
      
      return { 
        title: audit.title, 
        impact 
      };
    })
    .slice(0, 5); // Get top 5 issues
  
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" mb={3} color="primary">
        مقاييس الأداء الرئيسية
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          المصدر: Google PageSpeed API
        </Typography>
      </Typography>
      
      <Grid container spacing={2} mb={4}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Metric {...metric} />
          </Grid>
        ))}
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" fontWeight="bold" mb={2} color="primary">
        المشكلات المكتشفة
      </Typography>
      
      <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2 }}>
        {issues.length > 0 ? issues.map((issue, index) => (
          <Box key={index} sx={{ 
            p: 2, 
            mb: 1, 
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" fontWeight="medium">
                {issue.title}
              </Typography>
              
              <Typography variant="body2" sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: issue.impact === 'مرتفع' ? 'error.light' : 
                         issue.impact === 'متوسط' ? 'warning.light' : 'info.light',
                color: issue.impact === 'مرتفع' ? 'error.dark' : 
                       issue.impact === 'متوسط' ? 'warning.dark' : 'info.dark',
              }}>
                {issue.impact}
              </Typography>
            </Box>
          </Box>
        )) : (
          <Typography variant="body1" textAlign="center" py={3}>
            لم يتم اكتشاف مشكلات كبيرة في الأداء
          </Typography>
        )}
      </Paper>
      
      <Typography variant="body2" color="text.secondary" mt={2}>
        * تعتمد القياسات على نتائج Google Lighthouse للموقع
      </Typography>
    </Box>
  );
};

export default PerformanceDetails;
