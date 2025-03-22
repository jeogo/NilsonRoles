import { FC } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Grid, Button } from '@mui/material';

interface NelsonPrinciplesModalProps {
  open: boolean;
  onClose: () => void;
}

const NelsonPrinciplesModal: FC<NelsonPrinciplesModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>ما هي مبادئ نيلسون العشرة؟</DialogTitle>
      <DialogContent>
        <Typography variant="body2" paragraph>
          مبادئ نيلسون هي مجموعة من 10 قواعد عامة لتصميم واجهات المستخدم، اقترحها جاكوب نيلسون. تُعتبر هذه المبادئ إرشادات أساسية في مجال تجربة المستخدم (UX) وتساعد في إنشاء واجهات سهلة الاستخدام ومفيدة:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box component="ol" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2">
                <strong>رؤية حالة النظام</strong>: إبقاء المستخدمين على علم بما يحدث
              </Typography>
              <Typography component="li" variant="body2">
                <strong>التطابق بين النظام والعالم الواقعي</strong>: استخدام مفاهيم مألوفة للمستخدم
              </Typography>
              <Typography component="li" variant="body2">
                <strong>التحكم والحرية</strong>: توفير "مخارج طوارئ" واضحة للإجراءات
              </Typography>
              <Typography component="li" variant="body2">
                <strong>الاتساق والمعايير</strong>: اتباع اتفاقيات منصة متسقة
              </Typography>
              <Typography component="li" variant="body2">
                <strong>منع الأخطاء</strong>: تصميم يمنع حدوث المشكلات
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box component="ol" start={6} sx={{ pl: 2 }}>
              <Typography component="li" variant="body2">
                <strong>التعرف بدلاً من التذكر</strong>: جعل الإجراءات والخيارات مرئية
              </Typography>
              <Typography component="li" variant="body2">
                <strong>المرونة والكفاءة</strong>: توفير اختصارات للمستخدمين المتقدمين
              </Typography>
              <Typography component="li" variant="body2">
                <strong>التصميم الجمالي والبسيط</strong>: تجنب المعلومات غير الضرورية
              </Typography>
              <Typography component="li" variant="body2">
                <strong>مساعدة المستخدمين في التعرف على الأخطاء</strong>: رسائل خطأ واضحة
              </Typography>
              <Typography component="li" variant="body2">
                <strong>المساعدة والتوثيق</strong>: توفير وثائق مساعدة مناسبة عند الحاجة
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={onClose} variant="contained" color="primary">
            إغلاق
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NelsonPrinciplesModal;