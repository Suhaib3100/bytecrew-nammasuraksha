import React, { useState } from 'react';
import { analyzeMessage, MessageAnalysis } from '@/services/api';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';

interface MessageAnalyzerProps {
  onAnalysisComplete?: (analysis: MessageAnalysis) => void;
}

const MessageAnalyzer: React.FC<MessageAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!message.trim()) {
      setError('Please enter a message to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await analyzeMessage(message);
      if (response.success && response.analysis.message) {
        onAnalysisComplete?.(response.analysis.message);
      } else {
        setError(response.error || 'Failed to analyze message');
      }
    } catch (err) {
      setError('An error occurred while analyzing the message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h5" gutterBottom>
        Message Analysis
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Enter a message to analyze it for potential scams or suspicious content.
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          label="Message to Analyze"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleAnalyze}
          disabled={loading || !message.trim()}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Analyze'}
        </Button>
      </Box>
    </Paper>
  );
};

export default MessageAnalyzer; 