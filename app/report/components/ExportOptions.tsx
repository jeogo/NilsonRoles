import { FC, useState } from 'react';
import { Box, Button, Menu, MenuItem, ListItemIcon, ListItemText, Snackbar, Alert, Typography } from '@mui/material';
import { 
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { generatePDF } from '../utils/exportUtils';

interface ExportOptionsProps {
  data?: any;
}

const ExportOptions: FC<ExportOptionsProps> = ({ data }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleExport = async (format: 'pdf') => {
    handleClose();
    
    try {
      switch (format) {
        case 'pdf':
          const pdfResult = await generatePDF();
          if (pdfResult) {
            showSnackbar('تم تصدير التقرير بنجاح كملف PDF', 'success');
          } else {
            throw new Error('فشل تصدير PDF');
          }
          break;
      }
    } catch (error) {
      console.error('خطأ في التصدير:', error);
      showSnackbar('حدث خطأ أثناء تصدير التقرير', 'error');
    }
  };
  
  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={handleClick}
        sx={{ 
          fontWeight: 'bold',
          px: 3,
          py: 1
        }}
      >
        تصدير التقرير
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleExport('pdf')}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>تصدير كملف PDF</ListItemText>
        </MenuItem>
      </Menu>

  

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExportOptions;
