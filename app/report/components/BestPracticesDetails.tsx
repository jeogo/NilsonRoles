import { FC } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, Alert, Grid } from '@mui/material';
import { Check, Warning, Error, Security, Speed, Code } from '@mui/icons-material';

interface BestPracticesDetailsProps {
  data?: any;
}

const BestPracticesDetails: FC<BestPracticesDetailsProps> = ({ data }) => {
  if (!data) {
    return <Typography>لا توجد بيانات للعرض</Typography>;
  }

  // Extract best practices data from PageSpeed and Security APIs
  const pageSpeedData = data?.pageSpeedData?.lighthouseResult;
  const securityData = data?.securityData;
  
  if (!pageSpeedData && !securityData) {
    return (
      <Alert severity="warning">
        لم يتم العثور على بيانات أفضل الممارسات (تحتاج بيانات من PageSpeed API أو Security API)
      </Alert>
    );
  }

  // Extract best practices data
  const bestPracticesData = data?.pageSpeedData?.lighthouseResult;
  const bestPracticesScore = bestPracticesData?.categories?.['best-practices']?.score || 0;
  const bestPracticesAudits = bestPracticesData?.audits || {};

  // Create list of issues categorized by severity
  const criticalIssues = [];
  const moderateIssues = [];
  const minorIssues = [];

  // Loop through audits to find best practices issues
  for (const key in bestPracticesAudits) {
    const audit = bestPracticesAudits[key];
    if (audit.group === 'best-practices' && audit.score !== undefined && audit.score < 1) {
      const issue = {
        title: audit.title,
        description: audit.description
      };
      
      if (audit.score < 0.5) {
        criticalIssues.push(issue);
      } else if (audit.score < 0.8) {
        moderateIssues.push(issue);
      } else {
        minorIssues.push(issue);
      }
    }
  }

  // Get top issues from each category
  const topCritical = criticalIssues.slice(0, 3);
  const topModerate = moderateIssues.slice(0, 3);
  const topMinor = minorIssues.slice(0, 2);

  return (
    <Box>
      <Alert severity={bestPracticesScore > 0.8 ? "success" : bestPracticesScore > 0.5 ? "warning" : "error"} sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {bestPracticesScore > 0.8 ? "موقعك يتبع معظم أفضل الممارسات" : 
           bestPracticesScore > 0.5 ? "هناك مجال لتحسين اتباع أفضل الممارسات في موقعك" : 
           "موقعك يحتاج إلى تحسينات كبيرة في اتباع أفضل الممارسات"}
        </Typography>
        <Typography variant="body2">
          درجة أفضل الممارسات الإجمالية: {Math.round(bestPracticesScore * 100)}%
        </Typography>
      </Alert>

      <Typography variant="h6" fontWeight="bold" mb={2} color="primary">
        المشكلات المكتشفة
      </Typography>

      {topCritical.length > 0 && (
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight="bold" mb={1} color="error.main">
            مشكلات حرجة
          </Typography>
          <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2 }}>
            <List disablePadding>
              {topCritical.map((issue, index) => (
                <ListItem 
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'error.light'
                  }}
                >
                  <ListItemIcon>
                    <Error color="error" />
                  </ListItemIcon>
                  <ListItemText primary={issue.title} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {topModerate.length > 0 && (
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight="bold" mb={1} color="warning.main">
            مشكلات متوسطة
          </Typography>
          <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2 }}>
            <List disablePadding>
              {topModerate.map((issue, index) => (
                <ListItem 
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'warning.light'
                  }}
                >
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={issue.title} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" fontWeight="bold" mb={2} color="primary">
        أفضل الممارسات
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          المصدر: Google PageSpeed API و Security API
        </Typography>
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Security color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                الأمان
              </Typography>
            </Box>
            <Typography variant="body2">
              استخدم HTTPS، وتأكد من تحديث المكتبات والتبعيات، وحماية موقعك من هجمات XSS وحقن SQL.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Speed color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                الأداء
              </Typography>
            </Box>
            <Typography variant="body2">
              استخدم ضغط الصور والملفات، واستخدم التخزين المؤقت، وقم بتقليل عدد طلبات HTTP.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Code color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                جودة الكود
              </Typography>
            </Box>
            <Typography variant="body2">
              استخدم معايير HTML وCSS الحديثة، وتجنب استخدام الكود المكرر، واختبر موقعك على مختلف المتصفحات.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BestPracticesDetails;