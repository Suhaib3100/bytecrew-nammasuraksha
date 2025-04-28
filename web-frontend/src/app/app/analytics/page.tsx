"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for demonstration
const scamCategories = [
  { name: "Phishing", count: 45 },
  { name: "Parcel Scam", count: 30 },
  { name: "Prize Scam", count: 25 },
  { name: "OTP Fraud", count: 20 },
  { name: "Investment Scam", count: 15 },
];

const regions = [
  { name: "Singapore", count: 35 },
  { name: "Malaysia", count: 28 },
  { name: "Indonesia", count: 22 },
  { name: "Thailand", count: 18 },
  { name: "Vietnam", count: 12 },
];

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Analytics & Trends</h1>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Scam Categories</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Top Scam Categories This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scamCategories.map((category) => (
                  <div key={category.name} className="flex items-center">
                    <div className="w-32">{category.name}</div>
                    <div className="flex-1">
                      <div
                        className="h-4 bg-blue-500 rounded"
                        style={{ width: `${(category.count / 45) * 100}%` }}
                      />
                    </div>
                    <div className="w-12 text-right">{category.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <CardTitle>Top Regions Affected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regions.map((region) => (
                  <div key={region.name} className="flex items-center">
                    <div className="w-32">{region.name}</div>
                    <div className="flex-1">
                      <div
                        className="h-4 bg-green-500 rounded"
                        style={{ width: `${(region.count / 35) * 100}%` }}
                      />
                    </div>
                    <div className="w-12 text-right">{region.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 