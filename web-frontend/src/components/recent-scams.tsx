"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const recentScams = [
  {
    id: 1,
    type: "Phishing",
    message: "Suspicious login attempt from unknown location",
    time: "2 minutes ago",
    status: "Detected",
    confidence: 98,
  },
  {
    id: 2,
    type: "Lottery",
    message: "You've won $1,000,000 in lottery!",
    time: "15 minutes ago",
    status: "Blocked",
    confidence: 99,
  },
  {
    id: 3,
    type: "Investment",
    message: "Guaranteed 500% returns in crypto investment",
    time: "1 hour ago",
    status: "Detected",
    confidence: 95,
  },
  {
    id: 4,
    type: "Phishing",
    message: "Your account has been compromised",
    time: "2 hours ago",
    status: "Blocked",
    confidence: 97,
  },
  {
    id: 5,
    type: "Other",
    message: "Urgent: Your package delivery status",
    time: "3 hours ago",
    status: "Detected",
    confidence: 92,
  },
];

export function RecentScams() {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {recentScams.map((scam) => (
          <div
            key={scam.id}
            className="flex items-center justify-between space-x-4 rounded-lg border p-4"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    scam.type === "Phishing"
                      ? "destructive"
                      : scam.type === "Lottery"
                      ? "warning"
                      : scam.type === "Investment"
                      ? "secondary"
                      : "default"
                  }
                >
                  {scam.type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {scam.time}
                </span>
              </div>
              <p className="text-sm">{scam.message}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={scam.status === "Blocked" ? "outline" : "secondary"}>
                {scam.status}
              </Badge>
              <span className="text-sm font-medium">{scam.confidence}%</span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 