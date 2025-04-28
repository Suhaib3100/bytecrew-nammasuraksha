'use client';

import { useEffect, useState } from 'react';
import { getAnalysisHistory, AnalysisResponse } from '@/services/api';
import { AnalysisCard } from '@/components/AnalysisCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisResponse['analysis'][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await getAnalysisHistory();
        if ('error' in result) {
          setError(result.error);
        } else {
          setAnalyses(result.map(r => r.analysis));
        }
      } catch (err) {
        setError('Failed to fetch analysis history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : analyses.length === 0 ? (
            <p className="text-center text-gray-500">No analyses found</p>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis, index) => (
                <AnalysisCard key={index} analysis={analysis} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 