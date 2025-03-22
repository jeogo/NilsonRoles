"use client";
import { FC, useEffect, useState, useMemo } from "react";
import {
  Box,
  Container,
  Paper,
  CircularProgress,
  Typography,
  Alert,
  Divider,
  Grid,
  useTheme,
  Button,
} from "@mui/material";
import ReportHeader from "./components/ReportHeader";
import ScoreOverview from "./components/ScoreOverview";
import PerformanceDetails from "./components/PerformanceDetails";
import SeoDetails from "./components/SeoDetails";
import BestPracticesDetails from "./components/BestPracticesDetails";
import ExportOptions from "./components/ExportOptions";
import AccessibilityDetails from "./components/AccessibilityDetails";
import React from "react";
import { ChartSection } from './ChartSection';
import { PieChart } from './components/PieChart';
import NelsonPrinciplesModal from './components/NelsonPrinciplesModal';

interface ReportPageProps {}

const ReportPage: FC<ReportPageProps> = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedData = localStorage.getItem('websiteData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
      } else {
        setError("لم يتم العثور على بيانات تحليل. يرجى تحليل موقع أولاً.");
      }
    } catch (e) {
      console.error("Error loading stored data:", e);
      setError("حدث خطأ أثناء تحميل بيانات التحليل.");
    }
  }, []);

  const printStyle = useMemo(() => ({
    "@media print": {
      "#report-container": {
        margin: 0,
        padding: 0,
      },
      ".MuiPaper-root": {
        boxShadow: "none !important",
        border: "1px solid #ccc",
      },
    },
  }), []);

  // Render nothing until mounted to prevent hydration errors
  if (!isMounted) {
    return null;
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f0fd 100%)',
      minHeight: '100vh',
      pt: { xs: 2, sm: 3 },
      pb: { xs: 4, sm: 6 }
    }}>
      <Container 
        maxWidth="lg" 
        sx={{ 
          my: { xs: 2, sm: 4 }, 
          ...printStyle 
        }} 
        id="report-container"
      >
        {/* Page header with new styling */}
        <Box sx={{ 
          textAlign: "center", 
          mb: { xs: 3, sm: 5 },
          p: { xs: 2, sm: 3 },
          borderRadius: 4,
          background: 'linear-gradient(90deg, #1a365d 0%, #2c6faa 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          color: 'white'
        }}>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            mb={1}
            sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' } }}
          >
            تقرير تحليل شامل
          </Typography>
          <Typography 
            variant="subtitle1"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            تحليل وفق مبادئ نيلسون ومعايير الصناعة
          </Typography>
        </Box>

        {/* Error alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Loading state */}
        {!data && !error ? (
          <Paper 
            elevation={3} 
            sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              my: 8, 
              py: 6,
              px: 2,
              borderRadius: 4,
              background: 'white'
            }}
          >
            <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ mt: 3, color: theme.palette.text.primary }}>
              جاري تحميل بيانات التقرير...
            </Typography>
          </Paper>
        ) : (
          data && (
            <>
              <ReportHeader data={data} />
              
              {/* Overview section with new styling */}
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  mb: 4, 
                  borderRadius: 4,
                  background: 'white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
              >
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold" 
                    color="primary" 
                    gutterBottom
                    sx={{
                      position: 'relative',
                      pb: 1,
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '60px',
                        height: '3px',
                        backgroundColor: theme.palette.primary.main,
                      }
                    }}
                  >
                    مصادر البيانات في هذا التقرير
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary }}>
                    يعتمد هذا التقرير على عدة مصادر بيانات رئيسية للتحليل:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    <Typography component="li" variant="body2">
                      <strong>Google PageSpeed Insights API</strong>: لتحليل الأداء وإمكانية الوصول وSEO وأفضل الممارسات
                    </Typography>
                    <Typography component="li" variant="body2">
                      <strong>HTML Validation API</strong>: لفحص صحة كود HTML
                    </Typography>
                    <Typography component="li" variant="body2">
                      <strong>Security API</strong>: لتحليل جوانب الأمان
                    </Typography>
                    <Typography component="li" variant="body2">
                      <strong>تحليل مبادئ نيلسون</strong>: تحليل داخلي يعتمد على نتائج الواجهات السابقة
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 4 }} />
                
                <ScoreOverview data={data} />
              </Paper>

              {/* Continue with the other sections, applying similar styling */}
              <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 4, background: 'white', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <PieChart data={data} />
              </Paper>
              <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 4, background: 'white', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <ChartSection data={data} />
              </Paper>
              <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 4, background: 'white', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <PerformanceDetails data={data} />
              </Paper>
              <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 4, background: 'white', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <SeoDetails data={data} />
              </Paper>
              <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 4, background: 'white', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <AccessibilityDetails data={data} />
              </Paper>
              <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 4, background: 'white', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <BestPracticesDetails data={data} />
              </Paper>
              
              <Box sx={{ mt: 4, mb: 3 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => setModalOpen(true)}
                  sx={{ 
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    background: 'linear-gradient(45deg, #1a365d, #2c6faa)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #15294a, #265d91)',
                    }
                  }}
                >
                  ما هي مبادئ نيلسون العشرة؟
                </Button>
              </Box>
              
              <NelsonPrinciplesModal open={modalOpen} onClose={() => setModalOpen(false)} />
              
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 5 }}>
                <ExportOptions data={data} />
              </Box>
            </>
          )
        )}
      </Container>
    </Box>
  );
};

export default ReportPage;
