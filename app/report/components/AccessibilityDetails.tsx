import { FC } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, Alert, Grid } from '@mui/material';
import { CheckCircle, Error, Info } from '@mui/icons-material';

interface AccessibilityDetailsProps {
  data?: any;
}

const AccessibilityDetails: FC<AccessibilityDetailsProps> = ({ data }) => {
  if (!data) {
    return <Typography>لا توجد بيانات للعرض</Typography>;
  }

  // Extract accessibility data from PageSpeed API
  const accessibilityData = data?.pageSpeedData?.lighthouseResult;
  
  if (!accessibilityData) {
    return (
      <Alert severity="warning">
        لم يتم العثور على بيانات إمكانية الوصول (تحتاج بيانات من PageSpeed API)
      </Alert>
    );
  }

  // Extract accessibility data
  const accessibilityScore = accessibilityData?.categories?.accessibility?.score || 0;
  const accessibilityAudits = accessibilityData?.audits || {};

  // Create passed and failed audits lists
  const passedAudits = Object.values(accessibilityAudits)
    .filter((audit: any) => 
      audit.score === 1 && 
      audit.group === 'a11y' && 
      audit.title
    )
    .slice(0, 4);

  const failedAudits = Object.values(accessibilityAudits)
    .filter((audit: any) => 
      audit.score !== undefined && 
      audit.score < 1 && 
      audit.group === 'a11y' && 
      audit.title
    )
    .slice(0, 5);

  return (
    <Box>
      <Alert severity={accessibilityScore > 0.8 ? "success" : accessibilityScore > 0.5 ? "warning" : "error"} sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {accessibilityScore > 0.8 ? "موقعك متوافق بشكل جيد مع معايير إمكانية الوصول" : 
           accessibilityScore > 0.5 ? "هناك مجال لتحسين إمكانية الوصول لموقعك" : 
           "موقعك يحتاج إلى تحسينات كبيرة في إمكانية الوصول"}
        </Typography>
        <Typography variant="body2">
          درجة إمكانية الوصول الإجمالية: {Math.round(accessibilityScore * 100)}%
        </Typography>
      </Alert>

      <Typography variant="h6" fontWeight="bold" mb={2} color="primary">
        نتائج فحص إمكانية الوصول
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          المصدر: Google PageSpeed API (Lighthouse accessibility audits)
        </Typography>
      </Typography>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" mb={1} color="success.main">
            المعايير المحققة
          </Typography>
          <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2 }}>
            {passedAudits.length > 0 ? (
              <List disablePadding>
                {passedAudits.map((audit: any, index: number) => (
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
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={audit.title} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>لم يتم العثور على معايير محققة</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" mb={1} color="error.main">
            المعايير غير المحققة
          </Typography>
          <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2 }}>
            {failedAudits.length > 0 ? (
              <List disablePadding>
                {failedAudits.map((audit: any, index: number) => (
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
                      <Error color="error" />
                    </ListItemIcon>
                    <ListItemText primary={audit.title} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>لم يتم العثور على معايير غير محققة</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" fontWeight="bold" mb={2} color="primary">
        نصائح لتحسين إمكانية الوصول
      </Typography>
      
      <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2 }}>
        <List>
          <ListItem sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 1 }}>
            <ListItemIcon>
              <Info color="info" />
            </ListItemIcon>
            <ListItemText primary="استخدم نصوصًا بديلة وصفية للصور" secondary="تساعد الأشخاص ذوي الإعاقة البصرية على فهم محتوى الصور" />
          </ListItem>
          <ListItem sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 1 }}>
            <ListItemIcon>
              <Info color="info" />
            </ListItemIcon>
            <ListItemText primary="تحقق من تباين الألوان" secondary="يجب أن يكون هناك تباين كافٍ بين لون النص والخلفية" />
          </ListItem>
          <ListItem sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <ListItemIcon>
              <Info color="info" />
            </ListItemIcon>
            <ListItemText primary="استخدم هيكل عناوين واضح" secondary="يساعد مستخدمي قارئات الشاشة على فهم تنظيم المحتوى" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default AccessibilityDetails;