import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Paper, Typography, Box, useTheme } from '@mui/material';

export function ChartSection({ data }: { data: any }) {
  const theme = useTheme();
  
  if (!data?.pageSpeedData?.lighthouseResult?.categories) return null;

  // Translate category names to Arabic
  const categoryNames: {[key: string]: string} = {
    'performance': 'الأداء',
    'seo': 'تحسين محركات البحث',
    'accessibility': 'سهولة الوصول',
    'best-practices': 'أفضل الممارسات'
  };

  const chartData = Object.entries(data.pageSpeedData.lighthouseResult.categories).map(
    ([key, value]: any) => ({
      name: categoryNames[key] || key,
      score: Math.round((value.score * 100)),
    })
  );

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ 
          bgcolor: '#fff', 
          p: 2, 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: `1px solid ${theme.palette.grey[200]}`,
          borderRadius: 1
        }}>
          <Typography fontWeight="bold">{label}</Typography>
          <Typography color="primary">النتيجة: {payload[0].value}%</Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Paper elevation={3} sx={{ 
      p: { xs: 2, sm: 3 }, 
      mb: 3, 
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      <Typography 
        variant="h6" 
        fontWeight="bold" 
        textAlign="center" 
        mb={3} 
        color="primary"
        sx={{
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          position: 'relative',
          pb: 1,
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
        مقارنة النتائج حسب الفئة
      </Typography>
      
      <Box sx={{ 
        width: '100%', 
        height: { xs: 300, sm: 400 },
        mt: 3
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[200]} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={customTooltip} />
            <Legend wrapperStyle={{ paddingTop: 20 }} />
            <Bar 
              dataKey="score" 
              fill={theme.palette.primary.main}
              radius={[4, 4, 0, 0]} 
              barSize={40}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block', 
          textAlign: 'center', 
          mt: 2,
          color: theme.palette.text.secondary
        }}
      >
        مصدر البيانات: واجهة برمجة تطبيقات Google PageSpeed
      </Typography>
    </Paper>
  );
}
