import { AnalysisResponse } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalysisCardProps {
  analysis: AnalysisResponse['analysis'];
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{analysis.url}</CardTitle>
          <Badge className={getThreatLevelColor(analysis.security.threatLevel)}>
            {analysis.security.threatLevel.toUpperCase()}
          </Badge>
        </div>
        <CardDescription>
          Analyzed on {new Date(analysis.timestamp).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Security Status</h3>
            <div className="flex gap-2">
              <Badge variant={analysis.security.isSecure ? 'default' : 'destructive'}>
                {analysis.security.isSecure ? 'Secure' : 'Insecure'}
              </Badge>
            </div>
          </div>

          {analysis.security.threats.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Threats Found</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.security.threats.map((threat, index) => (
                  <li key={index} className="text-sm">
                    <Badge variant="destructive" className="mr-2">
                      {threat.severity}
                    </Badge>
                    {threat.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.recommendations.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Recommendations</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm">{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Summary</h3>
            <p className="text-sm">{analysis.summary}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 