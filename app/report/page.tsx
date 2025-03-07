"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Container, Typography, Button, Grid, Card, Paper,
  Chip, CircularProgress, List, ListItem, ListItemIcon,
  Divider, Avatar, Stack, Tooltip, IconButton, Rating
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { motion } from 'framer-motion';
import { DownloadIcon, Lightbulb, ExternalLink, Share2, AlertTriangle, CheckCircle, HelpCircle, Printer } from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  Radar, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid, XAxis, YAxis, BarChart, Bar
} from 'recharts';
import { AnalysisData } from '../../types/analysis';
import { pdf } from '@react-pdf/renderer';
import { ReportPDF } from '../../components/ReportPDF';
import { captureElementAsDataURL } from '../../utils/chartCapture';

// الإعداد للواجهة العربية
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
    secondary: { main: '#0097a7' },
    success: { main: '#4caf50' },
    warning: { main: '#ff9800' },
    error: { main: '#f44336' },
    background: { default: '#F9FAFB', paper: '#ffffff' },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.05)',
    '0px 6px 12px rgba(0, 0, 0, 0.08)',
    '0px 8px 16px rgba(0, 0, 0, 0.08)',
    '0px 10px 20px rgba(0, 0, 0, 0.08)',
    '0px 12px 24px rgba(0, 0, 0, 0.08)',
    '0px 14px 28px rgba(0, 0, 0, 0.08)',
    '0px 16px 32px rgba(0, 0, 0, 0.08)',
    '0px 18px 36px rgba(0, 0, 0, 0.08)',
    '0px 20px 40px rgba(0, 0, 0, 0.08)',
    '0px 22px 44px rgba(0, 0, 0, 0.08)',
    '0px 24px 48px rgba(0, 0, 0, 0.08)',
    '0px 26px 52px rgba(0, 0, 0, 0.08)',
    '0px 28px 56px rgba(0, 0, 0, 0.08)',
    '0px 30px 60px rgba(0, 0, 0, 0.08)',
    '0px 32px 64px rgba(0, 0, 0, 0.08)',
    '0px 34px 68px rgba(0, 0, 0, 0.08)',
    '0px 36px 72px rgba(0, 0, 0, 0.08)',
    '0px 38px 76px rgba(0, 0, 0, 0.08)',
    '0px 40px 80px rgba(0, 0, 0, 0.08)',
    '0px 42px 84px rgba(0, 0, 0, 0.08)',
    '0px 44px 88px rgba(0, 0, 0, 0.08)',
    '0px 46px 92px rgba(0, 0, 0, 0.08)',
    '0px 48px 96px rgba(0, 0, 0, 0.08)'
  ],
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

// تحديد لون الدرجة حسب القيمة بشكل أكثر دقة
const getScoreColor = (score: number) => {
  if (score >= 85) return '#43a047'; // أخضر داكن للممتاز
  if (score >= 75) return '#66bb6a'; // أخضر عادي للجيد جداً
  if (score >= 65) return '#ffb74d'; // برتقالي فاتح للجيد
  if (score >= 50) return '#ff9800'; // برتقالي للمتوسط
  return '#f44336'; // أحمر للضعيف
};

// تصنيف مستوى الأداء بشكل أكثر تفصيلاً
const getScoreRating = (score: number): { text: string; color: string } => {
  if (score >= 85) return { text: 'ممتاز', color: 'success' };
  if (score >= 75) return { text: 'جيد جداً', color: 'success' };
  if (score >= 65) return { text: 'جيد', color: 'warning' };
  if (score >= 50) return { text: 'مقبول', color: 'warning' };
  return { text: 'يحتاج تحسين', color: 'error' };
};

// مكون جديد للمخطط الشعاعي (الرادار)
const EnhancedRadarChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <RadarChart data={data}>
      <PolarGrid stroke="#e0e0e0" />
      <PolarAngleAxis 
        dataKey="subject"
        tick={{ fill: '#666666', fontSize: 10, fontFamily: 'Tajawal' }}
      />
      <Radar
        name="النتيجة"
        dataKey="score"
        stroke="#2c6faa"
        fill="#2c6faa"
        fillOpacity={0.3}
      />
      <RechartsTooltip formatter={(value) => [`${value}%`, 'النتيجة']} />
    </RadarChart>
  </ResponsiveContainer>
);

// مكون جديد للمخطط الدائري
const EnhancedPieChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={80}
        innerRadius={60}
        paddingAngle={2}
      >
        {data.map((entry, index) => (
          <Cell 
            key={`cell-${index}`} 
            fill={['#4caf50', '#ff9800', '#f44336'][index % 3]} 
            stroke="#ffffff"
            strokeWidth={2}
          />
        ))}
      </Pie>
      <Legend verticalAlign="bottom" height={36} />
      <RechartsTooltip formatter={(value) => [`${value} معايير`, '']} />
    </PieChart>
  </ResponsiveContainer>
);

// مكون جديد للرسم البياني الخطي
const TrendLineChart = ({ data }: { data: any[] }) => {
  // إعادة ترتيب البيانات تصاعدياً حسب النتيجة
  const sortedData = [...data].sort((a, b) => a.score - b.score);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={sortedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="subject" 
          height={60}
          tick={{ fill: '#666666', fontSize: 10, fontFamily: 'Tajawal' }}
          angle={-45}
          textAnchor="end"
          allowDataOverflow 
          scale="band"
          padding={{ left: 20, right: 20 }}
        />
        <YAxis domain={[0, 100]} />
        <RechartsTooltip formatter={(value) => [`${value}%`, 'النتيجة']} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#2c6faa"
          strokeWidth={2}
          activeDot={{ r: 8 }}
          dot={{ strokeWidth: 2, r: 4, fill: "#ffffff" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// مكون جديد للمخطط الشريطي
const CategoryBarChart = ({ data }: { data: any[] }) => {
  // تجميع البيانات حسب الفئات
  const categories = useMemo(() => {
    const categoryGroups: { [key: string]: number[] } = {
      'أداء وسرعة': [],
      'سهولة الاستخدام': [],
      'المعايير والاتساق': [],
    };
    
    data.forEach((item) => {
      if (item.subject.includes('وضوح') || item.subject.includes('المرونة') || item.subject.includes('كفاءة')) {
        categoryGroups['أداء وسرعة'].push(item.score);
      } else if (item.subject.includes('المستخدم') || item.subject.includes('التذكر') || item.subject.includes('تشخيص')) {
        categoryGroups['سهولة الاستخدام'].push(item.score);
      } else {
        categoryGroups['المعايير والاتساق'].push(item.score);
      }
    });
    
    return Object.keys(categoryGroups).map(name => ({
      name,
      score: categoryGroups[name].reduce((a, b) => a + b, 0) / (categoryGroups[name].length || 1)
    }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={categories}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <RechartsTooltip formatter={(value) => [`${Math.round(value as number)}%`, 'النتيجة']} />
        <Bar 
          dataKey="score" 
          fill="#2c6faa" 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

function Header() {
  return (
    <Box
      sx={{
        width: '100%',
        py: 2,
        px: 4,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        position: 'fixed',
        top: 0,
        zIndex: 1000,
        boxShadow: '0px 1px 10px rgba(0,0,0,0.04)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            تقرير تحليل الموقع
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" color="primary" title="مشاركة">
              <Share2 size={20} />
            </IconButton>
            <IconButton size="small" color="primary" title="طباعة"  onClick={() => window.print()}>
              <Printer size={20} />
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

function Footer() {
  return (
    <Box
      sx={{
        width: '100%',
        py: 3,
        mt: 4,
        background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(244,247,254,1) 100%)',
        borderTop: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="body2" color="text.secondary">
              تم إنشاء هذا التقرير تلقائياً استناداً إلى تحليل الموقع وفقاً لمبادئ نيلسون العشرة للتصميم. النتائج تقريبية وتهدف لمساعدتك في تحسين موقعك.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="body2" color="text.secondary">
              © 2023 تحليل المواقع - جميع الحقوق محفوظة
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function SummarySection({ data, averageScore }: { data: any; averageScore: number; }) {
  const scoreRating = getScoreRating(averageScore);
  
  return (
    <Paper elevation={2} sx={{ p: 0, overflow: 'hidden', mb: 3 }}>
      <Grid container>
        <Grid item xs={12} md={4} sx={{
          p: 4,
          position: 'relative',
          backgroundColor: 'rgba(44, 111, 170, 0.03)',
          borderRight: { xs: 'none', md: '1px solid rgba(0,0,0,0.08)' },
          borderBottom: { xs: '1px solid rgba(0,0,0,0.08)', md: 'none' },
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>معلومات الموقع</Typography>
            <Typography
              variant="h6"
              component="a"
              href={data.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                mb: 1,
                ':hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              {data.websiteUrl} <ExternalLink size={14} />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.analysisDate ? `تاريخ التحليل: ${new Date(data.analysisDate).toLocaleString('ar-SA')}` : ''}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Box sx={{ p: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              mb: 2
            }}>
              <Typography variant="h5" fontWeight="bold">التقييم العام</Typography>
              <Chip
                label={scoreRating.text}
                color={scoreRating.color as any}
                variant="filled"
                sx={{ fontWeight: 'bold', px: 1 }}
              />
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: { xs: 'center', md: 'flex-start' },
              mb: 3,
              mt: 4
            }}>
              <Box
                sx={{
                  position: 'relative',
                  width: 120,
                  height: 120,
                  mr: 3,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: `radial-gradient(closest-side, white 79%, transparent 80%), 
                                conic-gradient(${getScoreColor(averageScore)} ${averageScore}%, rgba(240, 240, 240, 0.8) 0)`,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h3" fontWeight="bold" color="#333333">
                    {averageScore}
                  </Typography>
                  <Typography variant="h6" mt={1}>%</Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <Typography component="span" fontWeight="bold">نقاط القوة: </Typography>
                  {findStrengths(data.nelsonPrinciples)}
                </Typography>
                
                <Typography variant="body1">
                  <Typography component="span" fontWeight="bold">نقاط التحسين: </Typography>
                  {findWeaknesses(data.nelsonPrinciples)}
                </Typography>
              </Box>
            </Box>
                        
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                التوصيات الرئيسية:
              </Typography>
              <List disablePadding>
                {data.nelsonPrinciples
                  .filter((p: any) => p.score < 65)
                  .slice(0, 2)
                  .map((principle: any, index: number) => (
                    <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <AlertTriangle color="#f57c00" size={20} />
                      </ListItemIcon>
                      <Typography variant="body2">{principle.feedback}</Typography>
                    </ListItem>
                  ))}
                
                {data.nelsonPrinciples
                  .filter((p: any) => p.score >= 65 && p.score < 75)
                  .slice(0, 1)
                  .map((principle: any, index: number) => (
                    <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Lightbulb color="#ffb74d" size={20} />
                      </ListItemIcon>
                      <Typography variant="body2">{principle.feedback}</Typography>
                    </ListItem>
                  ))}
              </List>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

// وظيفة لاستخراج نقاط القوة
function findStrengths(principles: any[]): string {
  const strengths = principles
    .filter(p => p.score >= 75)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(p => p.name)
    .join(' و ');
  
  return strengths || 'لا توجد نقاط قوة ملحوظة';
}

// وظيفة لاستخراج نقاط الضعف
function findWeaknesses(principles: any[]): string {
  const weaknesses = principles
    .filter(p => p.score < 65)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map(p => p.name)
    .join(' و ');
  
  return weaknesses || 'لا توجد نقاط ضعف ملحوظة';
}

function ChartsSection({ 
  radarData, 
  distributionData,
  lineChartRef,
  radarChartRef,
  pieChartRef,
  barChartRef
}: { 
  radarData: any[]; 
  distributionData: any[];
  lineChartRef: React.RefObject<HTMLDivElement | null>;
  radarChartRef: React.RefObject<HTMLDivElement | null>;
  pieChartRef: React.RefObject<HTMLDivElement | null>;
  barChartRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        تحليل النتائج البياني
      </Typography>
      
      <Grid container spacing={3}>
        {/* مخطط الرادار */}
        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ p: { xs: 2, md: 3 }, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              تحليل المعايير
            </Typography>
            <Box ref={radarChartRef} sx={{ width: '100%', height: 330 }}>
              <EnhancedRadarChart data={radarData} />
            </Box>
          </Card>
        </Grid>
        
        {/* مخطط الدائرة */}
        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ p: { xs: 2, md: 3 }, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              توزيع النتائج حسب التقييم
            </Typography>
            <Box ref={pieChartRef} sx={{ width: '100%', height: 330 }}>
              <EnhancedPieChart data={distributionData} />
            </Box>
          </Card>
        </Grid>
        
        {/* المخطط الخطي الجديد */}
        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ p: { xs: 2, md: 3 }, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              ترتيب المعايير حسب الأداء
            </Typography>
            <Box ref={lineChartRef} sx={{ width: '100%', height: 330 }}>
              <TrendLineChart data={radarData} />
            </Box>
          </Card>
        </Grid>
        
        {/* المخطط الشريطي الجديد */}
        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ p: { xs: 2, md: 3 }, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              متوسط الأداء حسب الفئة
            </Typography>
            <Box ref={barChartRef} sx={{ width: '100%', height: 330 }}>
              <CategoryBarChart data={radarData} />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

function DetailsSection({ data }: { data: any }) {
  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mt: 5, 
        mb: 3 
      }}>
        <Typography variant="h5" fontWeight="bold">
          تفاصيل معايير التقييم
        </Typography>
        <Tooltip title="معايير نيلسون للتصميم هي مجموعة من المبادئ للتقييم وتحسين واجهة المستخدم">
          <IconButton size="small" color="primary">
            <HelpCircle size={18} />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Grid container spacing={3}>
        {data.nelsonPrinciples.map((principle: any, index: number) => {
          const scoreRating = getScoreRating(principle.score);
          
          return (
            <Grid item xs={12} md={6} key={index}>
              <Card
                variant="outlined"
                sx={{ 
                  p: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  mb: 2
                }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {principle.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {principle.description}
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{
                      backgroundColor: `${getScoreColor(principle.score)}22`,
                      color: getScoreColor(principle.score),
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      lineHeight: '1',
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                    }}
                  >
                    {principle.score}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating 
                    value={principle.score / 20} 
                    precision={0.5} 
                    readOnly
                    sx={{ color: getScoreColor(principle.score) }}
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mr: 1, 
                      color: getScoreColor(principle.score),
                      fontWeight: 'medium'
                    }}
                  >
                    {scoreRating.text}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  {principle.score >= 65 ? (
                    <CheckCircle size={18} color="#43a047" style={{ marginLeft: 8, marginTop: 3 }} />
                  ) : (
                    <AlertTriangle size={18} color="#ff9800" style={{ marginLeft: 8, marginTop: 3 }} />
                  )}
                  <Typography variant="body2">
                    {principle.feedback}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}

// مكون جديد: قسم ملخص التوصيات
function RecommendationsSection({ data }: { data: any }) {
  // تصنيف التوصيات حسب الأولوية
  const criticalIssues = data.nelsonPrinciples.filter((p: any) => p.score < 55);
  const importantIssues = data.nelsonPrinciples.filter((p: any) => p.score >= 55 && p.score < 65);
  const minorIssues = data.nelsonPrinciples.filter((p: any) => p.score >= 65 && p.score < 75);
  
  // لا نعرض هذا القسم إذا لم تكن هناك توصيات
  if (criticalIssues.length === 0 && importantIssues.length === 0 && minorIssues.length === 0) {
    return null;
  }
  
  return (
    <>
      <Typography variant="h5" fontWeight="bold" sx={{ mt: 5, mb: 3 }}>
        التوصيات للتحسين
      </Typography>
      
      <Grid container spacing={3}>
        {criticalIssues.length > 0 && (
          <Grid item xs={12}>
            <Card 
              sx={{ 
                p: 3,
                borderRight: '4px solid #f44336'
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" color="error" gutterBottom>
                توصيات ذات أولوية قصوى
              </Typography>
              <List disablePadding>
                {criticalIssues.map((issue: any, index: number) => (
                  <ListItem 
                    key={index} 
                    disablePadding 
                    sx={{ 
                      mb: 1 
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <AlertTriangle color="#f44336" size={20} />
                    </ListItemIcon>
                    <Typography variant="body2">{issue.feedback}</Typography>
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>
        )}
        
        {importantIssues.length > 0 && (
          <Grid item xs={12}>
            <Card 
              sx={{ 
                p: 3,
                borderRight: '4px solid #ff9800'
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" color="warning" gutterBottom>
                توصيات هامة
              </Typography>
              <List disablePadding>
                {importantIssues.map((issue: any, index: number) => (
                  <ListItem 
                    key={index} 
                    disablePadding 
                    sx={{ 
                      mb: 1 
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Lightbulb color="#ff9800" size={20} />
                    </ListItemIcon>
                    <Typography variant="body2">{issue.feedback}</Typography>
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>
        )}
        
        {minorIssues.length > 0 && (
          <Grid item xs={12}>
            <Card 
              sx={{ 
                p: 3,
                borderRight: '4px solid #ffb74d'
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" color="secondary" gutterBottom>
                توصيات ثانوية
              </Typography>
              <List disablePadding>
                {minorIssues.map((issue: any, index: number) => (
                  <ListItem 
                    key={index} 
                    disablePadding 
                    sx={{ 
                      mb: 1 
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <HelpCircle color="#ffb74d" size={20} />
                    </ListItemIcon>
                    <Typography variant="body2">{issue.feedback}</Typography>
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>
        )}
      </Grid>
    </>
  );
}

export default function Report() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radarChartImage, setRadarChartImage] = useState<string>('');
  const [pieChartImage, setPieChartImage] = useState<string>('');
  const [lineChartImage, setLineChartImage] = useState<string>('');
  const [barChartImage, setBarChartImage] = useState<string>('');
  const radarChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (radarChartRef.current && pieChartRef.current && lineChartRef.current && barChartRef.current) {
      const timer = setTimeout(() => {
        Promise.all([
          captureElementAsDataURL(radarChartRef.current as HTMLElement),
          captureElementAsDataURL(pieChartRef.current as HTMLElement),
          captureElementAsDataURL(lineChartRef.current as HTMLElement),
          captureElementAsDataURL(barChartRef.current as HTMLElement),
        ]).then(([radarImg, pieImg, lineImg, barImg]) => {
          setRadarChartImage(radarImg);
          setPieChartImage(pieImg);
          setLineChartImage(lineImg);
          setBarChartImage(barImg);
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleExportPDF = async () => {
    if (!data) return;
    
    try {
      setLoading(true);
      const blob = await pdf(
        <ReportPDF 
          data={data} 
          radarChart={radarChartImage} 
          pieChart={pieChartImage} 
          lineChart={lineChartImage}
          barChart={barChartImage}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis-report-${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Show error message to user
      alert('حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

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
            {/* Add Export Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleExportPDF}
                startIcon={<DownloadIcon />}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #2c6faa, #3c8dda)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #245a8c, #3178b9)',
                  },
                }}
              >
                تحميل التقرير PDF
              </Button>
            </Box>
            
            {/* Existing Sections */}
            <SummarySection data={data} averageScore={averageScore} />
            <ChartsSection 
              radarData={radarData} 
              distributionData={distributionData} 
              radarChartRef={radarChartRef}
              pieChartRef={pieChartRef}
              lineChartRef={lineChartRef}
              barChartRef={barChartRef}
            />
            <DetailsSection data={data} />
            <RecommendationsSection data={data} />
          </Container>
          <Footer />
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}