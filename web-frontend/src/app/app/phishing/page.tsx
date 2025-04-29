"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Shield, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Globe, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { analyzeUrl, type UrlInfo } from "@/services/urlService";
import { traceUrl, type TraceResult } from "@/services/traceService";

function getAuthResultColor(result: string): string {
  switch (result) {
    case 'pass':
      return 'text-green-600';
    case 'fail':
      return 'text-red-600';
    case 'neutral':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
}

function getReputationColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export default function PhishingDetectionPage() {
  const [url, setUrl] = useState("");
  const [emailHeaders, setEmailHeaders] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [urlInfo, setUrlInfo] = useState<UrlInfo | null>(null);
  const [traceInfo, setTraceInfo] = useState<TraceResult | null>(null);
  const [result, setResult] = useState<{
    isPhishing: boolean;
    confidence: number;
    threatLevel?: string;
    details: string[];
  } | null>(null);

  const analyzeUrlForPhishing = async (targetUrl: string) => {
    try {
      const response = await fetch('/api/phishing/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze URL');
      }

      return {
        isPhishing: data.isPhishing,
        confidence: Math.round(data.confidence * 100),
        threatLevel: data.details.safeBrowsing.threatLevel,
        details: [
          `Threat Level: ${data.details.safeBrowsing.threatLevel}`,
          ...(data.details.safeBrowsing.threats.length > 0 
            ? [`Detected threats: ${data.details.safeBrowsing.threats.join(', ')}`] 
            : ['No threats detected by Google Safe Browsing']),
          ...(data.details.safeBrowsing.threatTypes.length > 0 
            ? [`Threat types: ${data.details.safeBrowsing.threatTypes.join(', ')}`] 
            : []),
          ...Object.entries(data.details.indicators || {})
            .filter(([_, value]) => value === true)
            .map(([key]) => `Suspicious indicator: ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`),
          ...(data.details.phishingCheck?.sources || []).map((source: string) => `Listed in database: ${source}`),
          data.details.domainInfo ? `Domain age: ${data.details.domainInfo.age}` : null,
          data.details.domainInfo?.ssl ? 'SSL certificate: Valid' : 'SSL certificate: Invalid/Missing',
          ...(data.recommendations || [])
        ].filter(Boolean)
      };
    } catch (error) {
      console.error("Error analyzing URL:", error);
      return {
        isPhishing: false,
        confidence: 0,
        threatLevel: 'error',
        details: [
          'Error analyzing URL.',
          error instanceof Error ? error.message : 'Please try again later.',
          'If the problem persists, the service might be temporarily unavailable.'
        ]
      };
    }
  };

  const handleAnalyze = async () => {
    if (!url) return;
    
    setIsLoading(true);
    setResult(null);
    setUrlInfo(null);
    setTraceInfo(null);
    
    try {
      // Run all analyses in parallel
      const [info, trace, analysisResult] = await Promise.all([
        analyzeUrl(url),
        traceUrl(url, emailHeaders),
        analyzeUrlForPhishing(url)
      ]);

      setUrlInfo(info);
      setTraceInfo(trace);
      setResult(analysisResult);
    } catch (error) {
      console.error("Error in analysis:", error);
      setResult({
        isPhishing: false,
        confidence: 0,
        threatLevel: 'error',
        details: [
          'Error analyzing URL.',
          error instanceof Error ? error.message : 'Please try again later.'
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertVariant = () => {
    if (!result) return "default";
    if (result.threatLevel === 'error') return "destructive";
    if (result.isPhishing) return "destructive";
    return "default";
  };

  const getAlertIcon = () => {
    if (!result) return null;
    if (result.threatLevel === 'error') return <XCircle className="h-4 w-4" />;
    if (result.isPhishing) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  const getAlertTitle = () => {
    if (!result) return "";
    if (result.threatLevel === 'error') return "Error";
    if (result.isPhishing) return "Potential Phishing Detected";
    return "URL Appears Safe";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              AI Phishing Link Detection
            </CardTitle>
            <CardDescription>
              Enter a URL and optional email headers to analyze for potential phishing attempts and trace its origin.
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
                <Button onClick={handleAnalyze} disabled={isLoading || !url}>
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

              <Textarea
                placeholder="Optional: Paste email headers here for additional analysis"
                value={emailHeaders}
                onChange={(e) => setEmailHeaders(e.target.value)}
                className="min-h-[100px]"
              />

              {traceInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Mail className="h-5 w-5" />
                      Origin Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Redirect Chain */}
                      <div>
                        <h3 className="font-semibold mb-2">URL Redirect Chain:</h3>
                        <div className="space-y-2">
                          {traceInfo.redirectChain.map((hop, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-sm">{hop.url}</span>
                              {hop.statusCode && (
                                <span className="text-xs text-gray-500">
                                  (Status: {hop.statusCode})
                                </span>
                              )}
                              {index < traceInfo.redirectChain.length - 1 && (
                                <ArrowRight className="h-4 w-4" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Final Destination */}
                      <div>
                        <h3 className="font-semibold mb-2">Final Destination:</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">URL</p>
                            <p className="text-sm text-gray-600">{traceInfo.finalDestination.url}</p>
                          </div>
                          {traceInfo.finalDestination.ip && (
                            <div>
                              <p className="text-sm font-medium">IP Address</p>
                              <p className="text-sm text-gray-600">{traceInfo.finalDestination.ip}</p>
                            </div>
                          )}
                          {traceInfo.finalDestination.sslInfo && (
                            <div>
                              <p className="text-sm font-medium">SSL Certificate</p>
                              <p className="text-sm text-gray-600">
                                {traceInfo.finalDestination.sslInfo.valid ? 'Valid' : 'Invalid'}
                                {traceInfo.finalDestination.sslInfo.issuer && 
                                  ` (Issued by: ${traceInfo.finalDestination.sslInfo.issuer})`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Email Analysis */}
                      {traceInfo.emailInfo && (
                        <div>
                          <h3 className="font-semibold mb-2">Email Analysis:</h3>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium">Sender Domain</p>
                              <p className="text-sm text-gray-600">{traceInfo.emailInfo.senderDomain}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Authentication Results</p>
                              <div className="grid grid-cols-3 gap-2">
                                {traceInfo.emailInfo.headers.authResults?.spf && (
                                  <div className="text-sm">
                                    SPF: <span className={`font-medium ${getAuthResultColor(traceInfo.emailInfo.headers.authResults.spf.result)}`}>
                                      {traceInfo.emailInfo.headers.authResults.spf.result}
                                    </span>
                                  </div>
                                )}
                                {traceInfo.emailInfo.headers.authResults?.dkim && (
                                  <div className="text-sm">
                                    DKIM: <span className={`font-medium ${getAuthResultColor(traceInfo.emailInfo.headers.authResults.dkim.result)}`}>
                                      {traceInfo.emailInfo.headers.authResults.dkim.result}
                                    </span>
                                  </div>
                                )}
                                {traceInfo.emailInfo.headers.authResults?.dmarc && (
                                  <div className="text-sm">
                                    DMARC: <span className={`font-medium ${getAuthResultColor(traceInfo.emailInfo.headers.authResults.dmarc.result)}`}>
                                      {traceInfo.emailInfo.headers.authResults.dmarc.result}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {traceInfo.emailInfo.domainReputation && (
                              <div>
                                <p className="text-sm font-medium">Domain Reputation</p>
                                <div className="space-y-1">
                                  <p className="text-sm">
                                    Score: <span className={getReputationColor(traceInfo.emailInfo.domainReputation.score)}>
                                      {traceInfo.emailInfo.domainReputation.score}/100
                                    </span>
                                  </p>
                                  {traceInfo.emailInfo.domainReputation.blacklisted && (
                                    <p className="text-sm text-red-600">
                                      ⚠️ Domain is blacklisted
                                      {traceInfo.emailInfo.domainReputation.blacklistSources && 
                                        ` (${traceInfo.emailInfo.domainReputation.blacklistSources.join(', ')})`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Hosting Information */}
                      {traceInfo.hostingInfo && (
                        <div>
                          <h3 className="font-semibold mb-2">Hosting Information:</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {traceInfo.hostingInfo.provider && (
                              <div>
                                <p className="text-sm font-medium">Provider</p>
                                <p className="text-sm text-gray-600">{traceInfo.hostingInfo.provider}</p>
                              </div>
                            )}
                            {traceInfo.hostingInfo.location && (
                              <div>
                                <p className="text-sm font-medium">Location</p>
                                <p className="text-sm text-gray-600">
                                  {[
                                    traceInfo.hostingInfo.location.city,
                                    traceInfo.hostingInfo.location.country
                                  ].filter(Boolean).join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {urlInfo?.domainInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Globe className="h-5 w-5" />
                      Domain Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {urlInfo.domainInfo.organization && (
                        <div>
                          <p className="font-semibold">Organization</p>
                          <p className="text-sm text-gray-600">{urlInfo.domainInfo.organization}</p>
                        </div>
                      )}
                      {urlInfo.domainInfo.registrar && (
                        <div>
                          <p className="font-semibold">Registrar</p>
                          <p className="text-sm text-gray-600">{urlInfo.domainInfo.registrar}</p>
                        </div>
                      )}
                      {urlInfo.domainInfo.creationDate && (
                        <div>
                          <p className="font-semibold">Created</p>
                          <p className="text-sm text-gray-600">{formatDate(urlInfo.domainInfo.creationDate)}</p>
                        </div>
                      )}
                      {urlInfo.domainInfo.lastUpdated && (
                        <div>
                          <p className="font-semibold">Last Updated</p>
                          <p className="text-sm text-gray-600">{formatDate(urlInfo.domainInfo.lastUpdated)}</p>
                        </div>
                      )}
                      {urlInfo.domainInfo.expiryDate && (
                        <div>
                          <p className="font-semibold">Expires</p>
                          <p className="text-sm text-gray-600">{formatDate(urlInfo.domainInfo.expiryDate)}</p>
                        </div>
                      )}
                      {urlInfo.domainInfo.country && (
                        <div>
                          <p className="font-semibold">Country</p>
                          <p className="text-sm text-gray-600">{urlInfo.domainInfo.country}</p>
                        </div>
                      )}
                    </div>
                    {urlInfo.domainInfo.nameservers && urlInfo.domainInfo.nameservers.length > 0 && (
                      <div className="mt-4">
                        <p className="font-semibold">Nameservers</p>
                        <ul className="list-disc pl-5 mt-1">
                          {urlInfo.domainInfo.nameservers.map((ns, index) => (
                            <li key={index} className="text-sm text-gray-600">{ns}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {urlInfo?.isShortened && (
                <Alert>
                  <AlertTitle>Shortened URL Detected</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2">
                      <p>This URL was shortened using {urlInfo.shortenerService}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm">Original: {urlInfo.originalUrl}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="text-sm">Final: {urlInfo.finalUrl}</span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {result && (
                <Alert variant={getAlertVariant()}>
                  {getAlertIcon()}
                  <AlertTitle>{getAlertTitle()}</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2">
                      {result.threatLevel !== 'error' && (
                        <p>Confidence: {result.confidence}%</p>
                      )}
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