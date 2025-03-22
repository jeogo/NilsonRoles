import { useState } from 'react';
import { Paper, Typography, Box, TextField, Button, LinearProgress, Fade, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';

interface AnalysisFormProps {
  onAnalyze: (url: string) => Promise<void>;
  loading: boolean;
  error: string;
  progress: number;
}

export default function AnalysisForm({ onAnalyze, loading, error, progress }: AnalysisFormProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(url);
  };

  const exampleSites = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Twitter', url: 'https://www.twitter.com' },
    { name: 'GitHub', url: 'https://www.github.com' },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 4,
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0,0,0,0.1)'
      }}
      id="analyze"
    >
      <Typography variant="h6" gutterBottom>
        ابدأ التحليل
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="رابط الموقع"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
          error={!!error}
          helperText={error}
          disabled={loading}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, justifyContent: 'center' }}>
          {exampleSites.map((site) => (
            <Button
              key={site.name}
              size="small"
              variant="outlined"
              onClick={() => setUrl(site.url)}
              disabled={loading}
            >
              {site.name}
            </Button>
          ))}
        </Box>
        
        {loading && (
          <Fade in={loading}>
            <Box sx={{ width: '100%', mb: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {`جاري التحليل... ${progress}%`}
              </Typography>
            </Box>
          </Fade>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                minWidth: '200px',
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #2c6faa, #3c8dda)',
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
      </Box>
    </Paper>
  );
}
