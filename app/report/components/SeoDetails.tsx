import { FC } from 'react';
import { Box, Typography, Paper, Grid, Divider, List, ListItem, ListItemIcon, ListItemText, Chip, Alert } from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, Info as InfoIcon } from '@mui/icons-material';

interface SeoDetailsProps {
  data?: any;
}

const SeoDetails: FC<SeoDetailsProps> = ({ data }) => {
  // Extract SEO data from lighthouse and HTML validation results
  const pageSpeedData = data?.pageSpeedData?.lighthouseResult;
  const htmlData = data?.htmlValidationData;
  
  if (!pageSpeedData && !htmlData) {
    return (
      <Alert severity="warning">
        لم يتم العثور على بيانات SEO (تحتاج بيانات من PageSpeed API أو HTML Validation)
      </Alert>
    );
  }

  // Extract SEO data from lighthouse result
  const seoData = data?.pageSpeedData?.lighthouseResult;
  const seoScore = seoData?.categories?.seo?.score || 0;
  const seoAudits = seoData?.audits || {};

  // Create SEO checks from actual data
  const seoChecks = [
    { 
      title: 'العنوان (Title Tag)', 
      status: seoAudits['document-title']?.score === 1, 
      details: seoAudits['document-title']?.title || 'لم يتم فحص العنوان'
    },
    { 
      title: 'الوصف (Meta Description)', 
      status: seoAudits['meta-description']?.score === 1, 
      details: seoAudits['meta-description']?.title || 'لم يتم فحص الوصف'
    },
    { 
      title: 'توافق الأجهزة المحمولة', 
      status: seoAudits['viewport']?.score === 1, 
      details: seoAudits['viewport']?.title || 'لم يتم فحص توافق الأجهزة المحمولة'
    },
    { 
      title: 'الروابط القابلة للنقر', 
      status: seoAudits['link-text']?.score === 1, 
      details: seoAudits['link-text']?.title || 'لم يتم فحص النص البديل للروابط'
    }
  ];
  
  // Find potential keywords from HTML
  const htmlContent = data?.htmlValidationData?.content || '';
  const keywordsPattern = /<meta\s+name=["']keywords["']\s+content=["']([^"']*)["']/i;
  const keywordsMatch = htmlContent.match(keywordsPattern);
  const keywordsFound = keywordsMatch ? 
    keywordsMatch[1].split(',').map((k: string) => ({ keyword: k.trim(), count: 1 })) : 
    [
      { keyword: 'تحليل المواقع', count: 1 },
      { keyword: 'تحسين محركات البحث', count: 1 }
    ];
  
  // Get SEO recommendations based on failing audits
  const seoRecommendations = Object.values(seoAudits)
    .filter((audit: any) => audit.score !== undefined && audit.score < 0.9 && audit.title)
    .map((audit: any) => audit.title)
    .slice(0, 3);

  if (seoRecommendations.length === 0) {
    seoRecommendations.push('موقعك يلبي معظم معايير SEO الرئيسية');
  }
  
  return (
    <Box>
      <Alert severity={seoScore > 0.8 ? "success" : seoScore > 0.5 ? "warning" : "error"} sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {seoScore > 0.8 ? "موقعك متوافق بشكل جيد مع معايير SEO" : 
           seoScore > 0.5 ? "هناك مجال لتحسين SEO لموقعك" : 
           "موقعك يحتاج إلى تحسينات كبيرة في SEO"}
        </Typography>
        <Typography variant="body2">
          درجة SEO الإجمالية: {Math.round(seoScore * 100)}%
        </Typography>
      </Alert>
      
      <Typography variant="h6" fontWeight="bold" mb={2} color="primary">
        نتائج فحص تحسين محركات البحث (SEO)
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          المصدر: Google PageSpeed API و HTML Validation
        </Typography>
      </Typography>
      
      <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2, mb: 4 }}>
        <List>
          {seoChecks.map((check, index) => (
            <ListItem
              key={index}
              sx={{
                p: 2,
                mb: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <ListItemIcon>
                {check.status ? (
                  <CheckIcon sx={{ color: 'success.main' }} />
                ) : (
                  <CloseIcon sx={{ color: 'error.main' }} />
                )}
              </ListItemIcon>
              <ListItemText 
                primary={check.title}
                secondary={check.details}
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" fontWeight="bold" mb={2} color="primary">
        توصيات لتحسين SEO
      </Typography>
      
      <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2 }}>
        <List>
          {seoRecommendations.map((recommendation, index) => (
            <ListItem 
              key={index} 
              sx={{ 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 1, 
                mb: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <ListItemIcon>
                <InfoIcon color="info" />
              </ListItemIcon>
              <ListItemText primary={recommendation} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default SeoDetails;
