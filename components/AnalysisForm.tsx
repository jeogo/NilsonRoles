import { Paper, TextField, Box, LinearProgress, Typography, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';

interface AnalysisFormProps {
  url: string;
  error?: string;
  loading: boolean;
  progress: number;
  onUrlChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
}

export const AnalysisForm = ({ 
  url, 
  error, 
  loading, 
  progress, 
  onUrlChange, 
  onAnalyze 
}: AnalysisFormProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 4,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.03)'
      }}
    >
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="رابط الموقع"
          placeholder="https://example.com"
          value={url}
          onChange={onUrlChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            sx: { 
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: '60px'
            }
          }}
          error={!!error}
          helperText={error}
          disabled={loading}
        />
      </Box>

      {loading && (
        <Box sx={{ width: '100%', mb: 4 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(0,0,0,0.05)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #2c6faa, #3c8dda)',
                borderRadius: 3
              }
            }}
          />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center"
            sx={{ mt: 2 }}
          >
            {`جاري التحليل... ${progress}%`}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={onAnalyze}
            disabled={loading}
            sx={{
              minWidth: '200px',
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #2c6faa, #3c8dda)',
              boxShadow: '0 4px 15px rgba(44, 111, 170, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #245a8c, #3178b9)',
                boxShadow: '0 8px 25px rgba(44, 111, 170, 0.4)',
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                جاري التحليل...
              </>
            ) : 'تحليل الموقع'}
          </Button>
        </motion.div>
      </Box>
    </Paper>
  </motion.div>
);
