"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function SampleLinksPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Extension Testing Links
            </CardTitle>
            <CardDescription>
              Test the NammaSuraksha Security Extension with these sample safe and dangerous links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Extension Check</AlertTitle>
              <AlertDescription>
                If the extension is working correctly, you should see warning icons (⚠️) next to the dangerous links below.
              </AlertDescription>
            </Alert>

            {/* Safe Links Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Safe Links
                </h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <a
                        href="https://www.google.com"
                        className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">🔍</Badge>
                          <span className="text-blue-600">Google Search Engine</span>
                        </div>
                      </a>
                      <Separator />
                      <a
                        href="https://www.wikipedia.org"
                        className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">📚</Badge>
                          <span className="text-blue-600">Wikipedia - Free Encyclopedia</span>
                        </div>
                      </a>
                      <Separator />
                      <a
                        href="https://www.github.com"
                        className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">💻</Badge>
                          <span className="text-blue-600">GitHub - Development Platform</span>
                        </div>
                      </a>
                      <Separator />
                      <a
                        href="https://www.microsoft.com"
                        className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">🪟</Badge>
                          <span className="text-blue-600">Microsoft Official Website</span>
                        </div>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dangerous Links Section */}
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Test Dangerous Links
                </h2>
                <Card>
                  <CardContent className="pt-6">
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        The following links are for testing purposes only. They are known malicious test URLs.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Phishing Test URLs:</h3>
                        <div className="grid gap-4">
                          <a
                            href="http://malware.testing.google.test/testing/malware/"
                            className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="destructive">🔒</Badge>
                              <span className="text-blue-600">Google Malware Test Page</span>
                            </div>
                          </a>
                          <Separator />
                          <a
                            href="http://testsafebrowsing.appspot.com/s/phishing.html"
                            className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="destructive">🎣</Badge>
                              <span className="text-blue-600">Safe Browsing Phishing Test</span>
                            </div>
                          </a>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Suspicious Domain Tests:</h3>
                        <div className="grid gap-4">
                          <a
                            href="http://paypal.secure-login.tk"
                            className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="destructive">💳</Badge>
                              <span className="text-blue-600">Suspicious PayPal Login</span>
                            </div>
                          </a>
                          <Separator />
                          <a
                            href="http://bank-secure-login.cf"
                            className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="destructive">🏦</Badge>
                              <span className="text-blue-600">Suspicious Bank Portal</span>
                            </div>
                          </a>
                          <Separator />
                          <a
                            href="http://login.banking-secure.gq"
                            className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="destructive">🔑</Badge>
                              <span className="text-blue-600">Fake Banking Login</span>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Instructions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    How to Test the Extension
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal ml-5 space-y-2 text-gray-600">
                    <li>Make sure the NammaSuraksha Security Extension is installed and enabled</li>
                    <li>Observe that safe links appear normal without any warnings</li>
                    <li>Notice the warning icons (⚠️) that should appear next to dangerous links</li>
                    <li>Try clicking a dangerous link to see the warning page</li>
                    <li>Test the "Report False Positive" feature if a safe link is flagged</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 