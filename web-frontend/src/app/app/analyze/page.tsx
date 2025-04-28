"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyzePage() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{
    isScam: boolean;
    category: string;
    confidence: number;
  } | null>(null);

  const handleSubmit = async () => {
    // TODO: Implement API call to backend
    setResult({
      isScam: true,
      category: "Phishing",
      confidence: 95,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Analyze Message</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Paste suspicious message</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste the suspicious message here..."
              className="min-h-[200px] mb-4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={handleSubmit} className="w-full">
              Analyze Message
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="font-semibold mr-2">Scam Status:</span>
                  {result.isScam ? (
                    <span className="text-red-500">❌ Likely Scam</span>
                  ) : (
                    <span className="text-green-500">✅ Safe</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold mr-2">Category:</span>
                  <span>{result.category}</span>
                </div>
                <div>
                  <span className="font-semibold mr-2">Confidence:</span>
                  <span>{result.confidence}%</span>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Report to Community Database
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 