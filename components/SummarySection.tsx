import React from 'react';
import { Box, Typography, Paper, Grid, Chip, Divider, Rating } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SpeedIcon from '@mui/icons-material/Speed';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import SecurityIcon from '@mui/icons-material/Security';
import BrushIcon from '@mui/icons-material/Brush';

interface SummarySectionProps {
  data: any;
  averageScore: number;
}

export default function SummarySection({ data, averageScore }: SummarySectionProps) {
  const performanceScore = getScoreFromLighthouse(data, 'performance');
  const accessibilityScore = getScoreFromLighthouse(data, 'accessibility');
  const bestPracticesScore = getScoreFromLighthouse(data, 'best-practices');

  // Extract top strengths and weaknesses
  const strengths = data.nelsonPrinciples
    ?.filter((p: any) => p.score >= 90)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 3)
    .map((p: any) => p.name) || [];

  const weaknesses = data.nelsonPrinciples
    ?.filter((p: any) => p.score < 70)
    .sort((a: any, b: any) => a.score - b.score)
    .slice(0, 3)
    .map((p: any) => p.name) || [];

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#00C49F'; // Green
    if (score >= 80) return '#0088FE'; // Blue
    if (score >= 70) return '#FFBB28'; // Yellow
    if (score >= 50) return '#FF8042'; // Orange
    return '#FF4142';                 // Red
  };

  return (
    <Box>
      <Paper 
        sx={{ 
          p: 4, 
          mb: 3, 
          borderRadius: 4, 
          background: 'linear-gradient(45deg, #f8f9fa, #ffffff)' 
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              تقرير تحليل
              <Typography component="span" variant="h4" color="primary.main" fontWeight="bold" sx={{ mx: 1 }}>
                {data.websiteUrl}
              </Typography>
            </Typography>
            
            <Typography color="text.secondary" paragraph sx={{ lineHeight: 1.7 }}>
              تم تحليل الموقع وفقًا لمبادئ نيلسون للتصميم ومعايير الأداء والأمان وإمكانية الوصول.
              {data.analysisDate && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  تاريخ التحليل: {new Date(data.analysisDate).toLocaleString('ar-SA')}
                </Typography>
              )}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <SpeedIcon fontSize="large" sx={{ color: getScoreColor(performanceScore) }} />
                  <Typography variant="body2" align="center" mt={1}>الأداء</Typography>
                  <Typography variant="h6" align="center" fontWeight="bold">
                    {performanceScore}%
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <AccessibilityNewIcon fontSize="large" sx={{ color: getScoreColor(accessibilityScore) }} />
                  <Typography variant="body2" align="center" mt={1}>الوصول</Typography>
                  <Typography variant="h6" align="center" fontWeight="bold">
                    {accessibilityScore}%
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <SecurityIcon fontSize="large" sx={{ color: getScoreColor(getSecurityScore(data)) }} />
                  <Typography variant="body2" align="center" mt={1}>الأمان</Typography>
                  <Typography variant="h6" align="center" fontWeight="bold">
                    {getSecurityScore(data)}%
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <BrushIcon fontSize="large" sx={{ color: getScoreColor(bestPracticesScore) }} />
                  <Typography variant="body2" align="center" mt={1}>أفضل الممارسات</Typography>
                  <Typography variant="h6" align="center" fontWeight="bold">
                    {bestPracticesScore}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                نقاط القوة الرئيسية
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {strengths.length > 0 ? (
                  strengths.map((strength: string, i: number) => (
                    <Chip 
                      key={i} 
                      label={strength} 
                      color="success" 
                      size="small"
                      icon={<CheckCircleOutlineIcon />} 
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    لم يتم اكتشاف نقاط قوة بارزة
                  </Typography>
                )}
              </Box>
              
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                المجالات التي تحتاج تحسين
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {weaknesses.length > 0 ? (
                  weaknesses.map((weakness: string, i: number) => (
                    <Chip 
                      key={i} 
                      label={weakness} 
                      color="warning" 
                      size="small"
                      icon={<ErrorOutlineIcon />} 
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    لم يتم اكتشاف نقاط ضعف بارزة
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                background: getGradientByScore(averageScore),
                borderRadius: 3,
                p: 3,
                color: 'white'
              }}
            >
              <Typography variant="h6" align="center" fontWeight="bold" gutterBottom>
                التقييم الإجمالي
              </Typography>
              
              <Typography 
                variant="h2" 
                align="center" 
                sx={{ 
                  fontWeight: 'bold',
                  textShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                  mb: 2
                }}
              >
                {averageScore}%
              </Typography>
              
              <Rating 
                value={averageScore / 20} 
                precision={0.5} 
                readOnly 
                size="large"
                sx={{ mb: 2 }}
              />
              
              <Typography align="center" variant="body1">
                {getScoreDescription(averageScore)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

// Helper functions
function getScoreFromLighthouse(data: any, category: string) {
  try {
    if (data?.pageSpeedData?.lighthouseResult?.categories?.[category]?.score) {
      return Math.round(data.pageSpeedData.lighthouseResult.categories[category].score * 100);
    }
    return 75; // Default
  } catch (e) {
    return 75; // Default
  }
}

function getSecurityScore(data: any) {
  try {
    if (data?.securityData?.results?.length > 0) {
      const scores = data.securityData.results
        .map((result: any) => result.stats?.securityScore || 0)
        .filter((score: number) => score > 0);
      
      if (scores.length > 0) {
        return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
      }
    }
    return 75; // Default
  } catch (e) {
    return 75; // Default
  }
}

function getGradientByScore(score: number) {
  if (score >= 90) return 'linear-gradient(135deg, #00C49F 0%, #00A279 100%)'; // Excellent
  if (score >= 80) return 'linear-gradient(135deg, #0088FE 0%, #0066CC 100%)'; // Good
  if (score >= 70) return 'linear-gradient(135deg, #FFBB28 0%, #FF9900 100%)'; // Acceptable
  if (score >= 50) return 'linear-gradient(135deg, #FF8042 0%, #FF5500 100%)'; // Needs improvement
  return 'linear-gradient(135deg, #FF4142 0%, #CC0000 100%)';                // Poor
}

function getScoreDescription(score: number) {
  if (score >= 90) return 'تقييم ممتاز. الموقع يلبي أعلى معايير تجربة المستخدم.';
  if (score >= 80) return 'تقييم جيد جداً. الموقع يوفر تجربة مستخدم جيدة مع بعض المجالات للتحسين.';
  if (score >= 70) return 'تقييم جيد. الموقع يقدم تجربة مقبولة ولكن يمكن تحسينها.';
  if (score >= 50) return 'تقييم متوسط. هناك حاجة لتحسينات مهمة في تجربة المستخدم.';
  return 'تقييم ضعيف. الموقع يحتاج إلى تحسينات جوهرية في العديد من المجالات.';
}
