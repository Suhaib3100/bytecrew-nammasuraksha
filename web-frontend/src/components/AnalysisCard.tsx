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

  const renderMessageAnalysis = () => {
    if (!analysis.aiAnalysis) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Message Analysis</h3>
          <Badge className={getThreatLevelColor(analysis.aiAnalysis.threatLevel)}>
            {analysis.aiAnalysis.threatLevel.toUpperCase()}
          </Badge>
          {analysis.aiAnalysis.scamType && (
            <Badge variant="outline">{analysis.aiAnalysis.scamType}</Badge>
          )}
        </div>

        {analysis.basicAnalysis && (
          <div className="space-y-2">
            <h4 className="font-medium">Basic Analysis</h4>
            <ul className="space-y-2">
              {analysis.basicAnalysis.hasLinks && (
                <li className="flex items-start gap-2">
                  <Badge className="bg-yellow-500">WARNING</Badge>
                  <span>Contains links</span>
                </li>
              )}
              {analysis.basicAnalysis.hasPhoneNumbers && (
                <li className="flex items-start gap-2">
                  <Badge className="bg-yellow-500">WARNING</Badge>
                  <span>Contains phone numbers</span>
                </li>
              )}
              {analysis.basicAnalysis.hasEmails && (
                <li className="flex items-start gap-2">
                  <Badge className="bg-yellow-500">WARNING</Badge>
                  <span>Contains email addresses</span>
                </li>
              )}
              {analysis.basicAnalysis.hasUrgencyWords && (
                <li className="flex items-start gap-2">
                  <Badge className="bg-red-500">HIGH</Badge>
                  <span>Contains urgency-inducing words</span>
                </li>
              )}
              {analysis.basicAnalysis.hasThreateningWords && (
                <li className="flex items-start gap-2">
                  <Badge className="bg-red-500">HIGH</Badge>
                  <span>Contains threatening language</span>
                </li>
              )}
              {analysis.basicAnalysis.hasSuspiciousKeywords && (
                <li className="flex items-start gap-2">
                  <Badge className="bg-yellow-500">WARNING</Badge>
                  <span>Contains suspicious keywords</span>
                </li>
              )}
            </ul>
          </div>
        )}

        {analysis.aiAnalysis.indicators && analysis.aiAnalysis.indicators.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Scam Indicators</h4>
            <ul className="space-y-2">
              {analysis.aiAnalysis.indicators.map((indicator, index) => (
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

        {analysis.aiAnalysis.suspiciousPatterns && analysis.aiAnalysis.suspiciousPatterns.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Suspicious Patterns</h4>
            <ul className="space-y-2">
              {analysis.aiAnalysis.suspiciousPatterns.map((pattern, index) => (
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
        {analysis.content && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Content</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis.content}</p>
          </div>
        )}

        {renderMessageAnalysis()}

        {analysis.recommendations && analysis.recommendations.length > 0 && (
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