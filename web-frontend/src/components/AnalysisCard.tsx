import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AnalysisResponse } from '@/services/api';

interface AnalysisCardProps {
  analysis: AnalysisResponse['analysis'];
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderSecurityAnalysis = () => {
    if (!analysis.security) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Security Analysis</h3>
          <Badge className={getThreatLevelColor(analysis.security.threatLevel)}>
            {analysis.security.threatLevel.toUpperCase()}
          </Badge>
        </div>

        {analysis.security.threats.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Threats Detected</h4>
            <ul className="space-y-2">
              {analysis.security.threats.map((threat, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Badge className={getThreatLevelColor(threat.severity)}>
                    {threat.severity.toUpperCase()}
                  </Badge>
                  <span>{threat.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.security.suspiciousPatterns.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Suspicious Patterns</h4>
            <ul className="space-y-2">
              {analysis.security.suspiciousPatterns.map((pattern, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Badge className={getThreatLevelColor(pattern.severity)}>
                    {pattern.severity.toUpperCase()}
                  </Badge>
                  <span>{pattern.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderMessageAnalysis = () => {
    if (!analysis.message) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Message Analysis</h3>
          <Badge className={getThreatLevelColor(analysis.message.threatLevel)}>
            {analysis.message.threatLevel.toUpperCase()}
          </Badge>
          <Badge variant="outline">{analysis.message.scamType}</Badge>
        </div>

        {analysis.message.indicators.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Scam Indicators</h4>
            <ul className="space-y-2">
              {analysis.message.indicators.map((indicator, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Badge className={getThreatLevelColor(indicator.severity)}>
                    {indicator.severity.toUpperCase()}
                  </Badge>
                  <span>{indicator.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.message.suspiciousPatterns.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Suspicious Patterns</h4>
            <ul className="space-y-2">
              {analysis.message.suspiciousPatterns.map((pattern, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Badge className={getThreatLevelColor(pattern.severity)}>
                    {pattern.severity.toUpperCase()}
                  </Badge>
                  <span>{pattern.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {analysis.url && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">URL</h3>
            <p className="text-sm text-muted-foreground break-all">{analysis.url}</p>
          </div>
        )}

        {analysis.content && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Content</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis.content}</p>
          </div>
        )}

        {renderSecurityAnalysis()}
        {renderMessageAnalysis()}

        {analysis.recommendations.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Recommendations</h3>
            <ul className="list-disc list-inside space-y-1">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm">{recommendation}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.summary && (
          <Alert>
            <AlertTitle>Summary</AlertTitle>
            <AlertDescription className="mt-2">
              {analysis.summary}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          Analyzed on {new Date(analysis.timestamp).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
} 