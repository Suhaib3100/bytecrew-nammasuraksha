"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Shield, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PhishingDetectionPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    isPhishing: boolean;
    confidence: number;
    details: string[];
  } | null>(null);

  const analyzeUrl = async () => {
    if (!url) return;
    
    setIsLoading(true);
    try {
      // Simulate API call - Replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response - Replace with actual API response
      setResult({
        isPhishing: Math.random() > 0.5,
        confidence: Math.floor(Math.random() * 100),
        details: [
          "Domain age: 2 years",
          "SSL certificate: Valid",
          "Suspicious keywords detected",
          "Known phishing patterns matched"
        ]
      });
    } catch (error) {
      console.error("Error analyzing URL:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              AI Phishing Link Detection
            </CardTitle>
            <CardDescription>
              Enter a URL to analyze it for potential phishing attempts using our AI-powered detection system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter URL to analyze"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={analyzeUrl} disabled={isLoading || !url}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </div>

              {result && (
                <Alert variant={result.isPhishing ? "destructive" : "default"}>
                  {result.isPhishing ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {result.isPhishing ? "Potential Phishing Detected" : "URL Appears Safe"}
                  </AlertTitle>
                  <AlertDescription>
                    <div className="mt-2">
                      <p>Confidence: {result.confidence}%</p>
                      <ul className="list-disc pl-5 mt-2">
                        {result.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Tabs defaultValue="how-it-works">
            <TabsList>
              <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="limitations">Limitations</TabsTrigger>
            </TabsList>
            <TabsContent value="how-it-works" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    <li>• Analyzes URL structure and patterns</li>
                    <li>• Checks against known phishing databases</li>
                    <li>• Evaluates domain reputation and age</li>
                    <li>• Detects suspicious keywords and patterns</li>
                    <li>• Uses machine learning to identify new threats</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="features" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    <li>• Real-time analysis</li>
                    <li>• Detailed threat assessment</li>
                    <li>• Confidence scoring</li>
                    <li>• Historical data tracking</li>
                    <li>• Regular database updates</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="limitations" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    <li>• May not detect very new phishing sites</li>
                    <li>• Limited to publicly accessible URLs</li>
                    <li>• Cannot analyze content behind login walls</li>
                    <li>• Results should be used as guidance only</li>
                    <li>• Always exercise caution with unknown links</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 