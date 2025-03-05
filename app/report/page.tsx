"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Container, Typography, Button, Grid, Card, 
  Chip, CircularProgress, List, ListItem, ListItemIcon
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { Lightbulb } from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  Radar, Tooltip, PieChart, Pie, Legend, Cell
} from 'recharts';
import { AnalysisData } from '../../types/analysis';

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Tajawal, sans-serif',
  },
  palette: {
    primary: { main: '#2c6faa' },
    background: { default: '#F9FAFB' },
  },
});

const getScoreColor = (score: number) => {
  if (score >= 80) return '#4caf50';
  if (score >= 60) return '#ff9800';
  return '#f44336';
};

const CustomRadarChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RadarChart data={data}>
      <PolarGrid />
      <PolarAngleAxis 
        dataKey="subject"
        tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'Tajawal' }}
      />
      <Radar
        name="النتيجة"
        dataKey="score"
        stroke="#2c6faa"
        fill="#2c6faa"
        fillOpacity={0.3}
      />
      <Tooltip />
    </RadarChart>
  </ResponsiveContainer>
);

const CustomPieChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
      >
        {data.map((entry, index) => (
          <Cell 
            key={`cell-${index}`} 
            fill={['#4caf50', '#ff9800', '#f44336'][index % 3]} 
          />
        ))}
      </Pie>
      <Legend />
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

function Header() {
  return (
    <Box
      sx={{
        width: '100%',
        py: 2,
        px: 4,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        position: 'fixed',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h6" fontWeight="bold" color="primary">
          تقرير تحليل الموقع
        </Typography>
      </Container>
    </Box>
  );
}

function Footer() {
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
        <Typography variant="body2" color="text.secondary">
          © 2025 تحليل المواقع
        </Typography>
      </Container>
    </Box>
  );
}

function SummarySection({ data, averageScore }: { data: any; averageScore: number; }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, textAlign: 'center', mb: 2 }}>
          <Typography variant="h5">معلومات الموقع</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {data.url || 'رابط الموقع غير متوفر'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: '#6b7280' }}>
            {data.analysisDate ? `تاريخ التحليل: ${new Date(data.analysisDate).toLocaleString()}` : 'تاريخ التحليل غير متوفر'}
          </Typography>
        </Card>
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5">النتيجة الإجمالية</Typography>
          <Typography variant="h2" color="primary">{averageScore}%</Typography>
          <Chip 
            label={
              averageScore >= 80 ? 'ممتاز' : 
              averageScore >= 60 ? 'جيد' : 'يحتاج تحسين'
            } 
            color={averageScore >= 80 ? 'success' : averageScore >= 60 ? 'warning' : 'error'}
            sx={{ mt: 1 }}
          />
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h5">التوصيات الرئيسية</Typography>
          <List>
            {data.nelsonPrinciples
              .filter((p: any) => p.score < 70)
              .slice(0, 3)
              .map((principle: any, index: number) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Lightbulb />
                  </ListItemIcon>
                  <Typography>{principle.feedback}</Typography>
                </ListItem>
              ))}
          </List>
        </Card>
      </Grid>
    </Grid>
  );
}

function ChartsSection({ radarData, distributionData }: { radarData: any[]; distributionData: any[]; }) {
  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6">تحليل المعايير</Typography>
          <CustomRadarChart data={radarData} />
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6">توزيع النتائج</Typography>
          <CustomPieChart data={distributionData} />
        </Card>
      </Grid>
    </Grid>
  );
}

function DetailsSection({ data }: { data: any; }) {
  return (
    <Grid item xs={12} sx={{ mt: 3 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>تفاصيل المعايير</Typography>
        <Grid container spacing={2}>
          {data.nelsonPrinciples.map((principle: any, index: number) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                variant="outlined"
                sx={{ 
                  p: 2,
                  bgcolor: 'rgba(44, 111, 170, 0.05)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{principle.name}</Typography>
                  <Chip 
                    label={`${principle.score}%`}
                    sx={{ 
                      bgcolor: getScoreColor(principle.score), 
                      color: 'white' 
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {principle.feedback}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Grid>
  );
}

export default function Report() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('websiteData');
      if (!stored) {
        setError('No analysis data found');
        return;
      }

      const parsedData = JSON.parse(stored) as AnalysisData;
      if (!parsedData.websiteUrl || !parsedData.nelsonPrinciples) {
        setError('Invalid analysis data');
        return;
      }

      setData(parsedData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error loading analysis data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 4 }}>
        <Typography color="error">{error || 'No data available'}</Typography>
        <Button variant="contained" onClick={() => router.push('/')}>
          تحليل جديد
        </Button>
      </Box>
    );
  }

  const averageScore = Math.round(
    data.nelsonPrinciples.reduce((sum, p) => sum + p.score, 0) / 
    data.nelsonPrinciples.length
  );

  const radarData = data.nelsonPrinciples.map((p: any) => ({
    subject: p.name,
    score: p.score,
  }));

  const distributionData = [
    { name: 'ممتاز', value: data.nelsonPrinciples.filter((p: any) => p.score >= 80).length },
    { name: 'جيد', value: data.nelsonPrinciples.filter((p: any) => p.score >= 60 && p.score < 80).length },
    { name: 'يحتاج تحسين', value: data.nelsonPrinciples.filter((p: any) => p.score < 60).length },
  ];

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)' }}>
          <Header />
          <Container maxWidth="lg" sx={{ pt: 10 }}>
            <SummarySection data={data} averageScore={averageScore} />
            <ChartsSection radarData={radarData} distributionData={distributionData} />
            <DetailsSection data={data} />
          </Container>
          <Footer />
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}