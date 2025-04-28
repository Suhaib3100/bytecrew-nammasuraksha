import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import { MessageAnalysis } from '@/services/api';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

interface MessageAnalysisResultsProps {
  analysis: MessageAnalysis;
}

const MessageAnalysisResults: React.FC<MessageAnalysisResultsProps> = ({
  analysis,
}) => {
  const getThreatLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getThreatLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return <ErrorIcon color="error" />;
      case 'medium':
        return <WarningIcon color="warning" />;
      case 'low':
        return <InfoIcon color="success" />;
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h5" gutterBottom>
        Analysis Results
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Threat Level
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getThreatLevelIcon(analysis.threatLevel)}
          <Chip
            label={analysis.threatLevel.toUpperCase()}
            color={getThreatLevelColor(analysis.threatLevel) as any}
          />
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Scam Type
        </Typography>
        <Chip label={analysis.scamType} variant="outlined" />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Indicators
        </Typography>
        <List>
          {analysis.indicators.map((indicator, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={indicator.description}
                secondary={`Severity: ${indicator.severity}`}
              />
              <Chip
                size="small"
                label={indicator.severity.toUpperCase()}
                color={getThreatLevelColor(indicator.severity) as any}
                sx={{ ml: 1 }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Suspicious Patterns
        </Typography>
        <List>
          {analysis.suspiciousPatterns.map((pattern, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={pattern.description}
                secondary={`Severity: ${pattern.severity}`}
              />
              <Chip
                size="small"
                label={pattern.severity.toUpperCase()}
                color={getThreatLevelColor(pattern.severity) as any}
                sx={{ ml: 1 }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default MessageAnalysisResults; 