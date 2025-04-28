"use client";

import * as React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", phishing: 65, lottery: 28, investment: 45, other: 15 },
  { month: "Feb", phishing: 59, lottery: 32, investment: 49, other: 18 },
  { month: "Mar", phishing: 80, lottery: 41, investment: 52, other: 21 },
  { month: "Apr", phishing: 81, lottery: 37, investment: 62, other: 25 },
  { month: "May", phishing: 56, lottery: 45, investment: 55, other: 19 },
  { month: "Jun", phishing: 55, lottery: 35, investment: 58, other: 22 },
  { month: "Jul", phishing: 40, lottery: 39, investment: 65, other: 28 },
];

export function ScamDetectionChart() {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="phishing"
            stackId="1"
            stroke="#8884d8"
            fill="#8884d8"
          />
          <Area
            type="monotone"
            dataKey="lottery"
            stackId="1"
            stroke="#82ca9d"
            fill="#82ca9d"
          />
          <Area
            type="monotone"
            dataKey="investment"
            stackId="1"
            stroke="#ffc658"
            fill="#ffc658"
          />
          <Area
            type="monotone"
            dataKey="other"
            stackId="1"
            stroke="#ff7300"
            fill="#ff7300"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 