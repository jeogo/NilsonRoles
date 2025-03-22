"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Typography, Box, Container, Grid, Snackbar, Alert, Button, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../utils/createEmotionCache';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';
import { useRouter } from 'next/navigation';

import { AnalysisData } from '../types/analysis';
import { validateUrl } from '../utils/urlValidator';
import { calculateNelsonPrinciples } from '../utils/analysisEngine';
import { getPageSpeedData, validateHTML, getSecurityAnalysis } from '@/utils/api';

import Header from '../components/Header';
import Footer from '../components/Footer';
import FeatureCard from '../components/FeatureCard';
import AnalysisForm from '../components/AnalysisForm';

// Create a client-side cache for emotion
const clientSideEmotionCache = createEmotionCache();

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Tajawal, sans-serif',
  },
  palette: {
    primary: {
      main: '#2c6faa',
    },
    secondary: {
      main: '#0097a7',
    },
  },
});

// Features data
const features = [
  {
    title: 'تحليل شامل',
    description: 'تحليل متكامل وفقاً لمبادئ نيلسون العشرة للتصميم',
    icon: '🎯',
  },
  {
    title: 'تقرير مفصل',
    description: 'تقرير تفصيلي مع توصيات للتحسين',
    icon: '📊',
  },
  {
    title: 'تحليل الأداء',
    description: 'قياس سرعة الموقع وتحسين تجربة المستخدم',
    icon: '⚡',
  },
  {
    title: 'فحص الأمان',
    description: 'تحليل معايير الأمان وشهادات SSL',
    icon: '🔒',
  }
];

export default function Home() {
  const router = useRouter();
  // Add state for controlling client-side rendering
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('warning');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [showDataDialog, setShowDataDialog] = useState(false);

  // Use useEffect to mark when client-side rendering is active
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAnalyze = async (url: string) => {
    if (!url) {
      setError('يرجى إدخال رابط موقع الويب');
      return;
    }
    
    setLoading(true);
    setError('');
    setProgress(0);
    showSnackbar('جاري التحقق من الرابط...', 'warning');
    
    try {
      // Validate URL
      const validationResult = await validateUrl(url);
      if (!validationResult.isValid) {
        setError(validationResult.message || 'الرابط غير صالح');
        setLoading(false);
        return;
      }
      
      const processedUrl = validationResult.url;
      
      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 90));
      }, 200);
      
      // Initialize analysis data
      let data: AnalysisData = {
        websiteUrl: processedUrl,
        analysisDate: new Date().toISOString(),
        pageSpeedData: null,
        accessibilityData: null,
        htmlValidationData: null,
        securityData: null,
        cssValidationData: null,
        nelsonPrinciples: [],
        screenshotUrl: '',
      };

      // Perform API calls in parallel
      showSnackbar('جاري تحليل الموقع...', 'warning');
      
      console.log('Starting API calls for URL:', processedUrl);
      
      // Store raw API responses for debugging
      const rawResponses: Record<string, any> = {};
      
      const [pageSpeedResult, htmlResult, securityResult] = await Promise.allSettled([
        getPageSpeedData(processedUrl).then(response => {
          console.log('PageSpeed API response received');
          rawResponses.pageSpeed = response;
          return response;
        }),
        validateHTML(processedUrl).then(response => {
          console.log('HTML Validation API response received');
          rawResponses.html = response;
          return response;
        }),
        getSecurityAnalysis(processedUrl).then(response => {
          console.log('Security API response received');
          rawResponses.security = response;
          return response;
        })
      ]);
      
      // Update analysis data with results
      if (pageSpeedResult.status === 'fulfilled') {
        data.pageSpeedData = pageSpeedResult.value;
        console.log('PageSpeed data added to analysis');
      } else {
        console.error('PageSpeed API failed:', pageSpeedResult.reason);
      }
      
      if (htmlResult.status === 'fulfilled') {
        data.htmlValidationData = htmlResult.value;
        console.log('HTML validation data added to analysis');
      } else {
        console.error('HTML validation API failed:', htmlResult.reason);
      }
      
      if (securityResult.status === 'fulfilled') {
        data.securityData = securityResult.value;
        console.log('Security data added to analysis');
      } else {
        console.error('Security API failed:', securityResult.reason);
      }
      
      
      // Calculate Nelson principles
      console.log('Calculating Nelson principles');
      data.nelsonPrinciples = calculateNelsonPrinciples(data, processedUrl);
      
      // Save data
      localStorage.setItem('websiteData', JSON.stringify(data));
      setAnalysisData(data);
      
      // Complete analysis
      clearInterval(progressInterval);
      setProgress(100);
      
      // Show success and results
      showSnackbar('تم الانتهاء من التحليل بنجاح!', 'success');
      
      // Calculate average score
      const avgScore = Math.round(
        data.nelsonPrinciples.reduce((sum, p) => sum + p.score, 0) / 
        data.nelsonPrinciples.length
      );
      
      console.log('Analysis completed with average score:', avgScore);
      
      // Show simple results
      setTimeout(() => {
        alert(`تم تحليل ${processedUrl} بنجاح!\n\nالنتيجة الإجمالية: ${avgScore}%`);
        setLoading(false);
        router.push('/report');
      }, 1000);
      
    } catch (error) {
      console.error("Analysis error:", error);
      showSnackbar('حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.', 'error');
      setLoading(false);
    }
  };

  const downloadAnalysisData = () => {
    if (!analysisData) return;
    
    const dataStr = JSON.stringify(analysisData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis-${analysisData.websiteUrl.replace(/https?:\/\//, '').replace(/[\/\.]/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showSnackbar('تم تنزيل بيانات التحليل بنجاح!', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Only render with Emotion cache on the client side to avoid hydration mismatch
  if (!isClient) {
    return null; // Return null during SSR
  }

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)' }}>
          <Header />
          
          <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 16 }, pb: 8 }}>
            <Grid container spacing={4}>
              {/* Hero Section */}
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography 
                    variant="h2" 
                    fontWeight="bold"
                    sx={{ 
                      mb: 2,
                      background: 'linear-gradient(45deg, #1a365d, #2c6faa)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    حلل موقعك بذكاء
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    تحليل شامل لموقعك وفق قواعد نظرية نيلسون للتصميم
                  </Typography>
                </motion.div>
              </Grid>

              {/* Analysis Form */}
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <AnalysisForm 
                    onAnalyze={handleAnalyze}
                    loading={loading}
                    error={error}
                    progress={progress}
                  />
                </motion.div>
              </Grid>

              {/* Data Actions (only shown after analysis) */}
              {analysisData && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<DownloadIcon />}
                      onClick={downloadAnalysisData}
                    >
                      تنزيل بيانات التحليل (JSON)
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<CodeIcon />}
                      onClick={() => setShowDataDialog(true)}
                    >
                      عرض البيانات الخام
                    </Button>
                  </Box>
                </Grid>
              )}

              {/* Features Section */}
              <Grid item xs={12} sx={{ mt: 8 }}>
                <Typography 
                  variant="h4" 
                  align="center" 
                  fontWeight="bold"
                  sx={{ mb: 6 }}
                  color='black'
                >
                  مميزات التحليل
                </Typography>
                <Grid container spacing={3}>
                  {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <FeatureCard 
                        title={feature.title}
                        description={feature.description}
                        icon={feature.icon}
                        index={index}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Container>

          <Footer />
        </Box>

        {/* Raw Data Dialog */}
        <Dialog
          open={showDataDialog}
          onClose={() => setShowDataDialog(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>بيانات التحليل الخام</DialogTitle>
          <DialogContent>
            <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
              <pre style={{ direction: 'ltr', textAlign: 'left', fontSize: '12px', lineHeight: 1.5 }}>
                {analysisData ? JSON.stringify(analysisData, null, 2) : 'لا توجد بيانات'}
              </pre>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDataDialog(false)}>إغلاق</Button>
            <Button onClick={downloadAnalysisData} startIcon={<DownloadIcon />}>
              تنزيل البيانات
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </CacheProvider>
  );
}
