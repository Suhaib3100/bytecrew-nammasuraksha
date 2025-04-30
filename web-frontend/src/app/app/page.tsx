"use client";

import * as React from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Brain, MessageSquare, Shield, TrendingUp } from "lucide-react";
import { ScamDetectionChart } from "@/components/scam-detection-chart";
import { RecentScams } from "@/components/recent-scams";
import { ScamTypeDistribution } from "@/components/scam-type-distribution";

export default function Page() {
  return (
    <>
      <div className="space-y-6">
        {/* Quick Stats Cards */}
        <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scams Detected</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10,482</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detection Accuracy</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.7%</div>
              <p className="text-xs text-muted-foreground">+2.4% improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Currently monitoring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Reports</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,203</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="detection-overview" className="px-4 lg:px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detection-overview">Detection Overview</TabsTrigger>
            <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="detection-overview" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Raksha Hub Trends</CardTitle>
                  <CardDescription>
                    Monthly detection rates across different scam types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScamDetectionChart />
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Detections</CardTitle>
                    <CardDescription>Latest scam attempts detected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentScams />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Scam Type Distribution</CardTitle>
                    <CardDescription>Breakdown by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScamTypeDistribution />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Advanced Analysis Tools</h2>
                <p className="text-muted-foreground">
                  Dive deep into scam patterns and behaviors
                </p>
              </div>
              <Button asChild>
                <Link href="/app/analyze" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Open Message Analyzer
                </Link>
              </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Threat Intelligence</CardTitle>
                  <CardDescription>Active scam campaigns and patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Coming Soon
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Scam origin and target locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Coming Soon
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}