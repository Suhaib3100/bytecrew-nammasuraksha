"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for demonstration
const mockReports = [
  {
    id: 1,
    message: "Your account has been compromised. Click here to secure it...",
    category: "Phishing",
    location: "Singapore",
    date: "2024-04-26 14:30",
  },
  {
    id: 2,
    message: "You've won a prize! Claim your reward now...",
    category: "Prize Scam",
    location: "Malaysia",
    date: "2024-04-26 12:15",
  },
  {
    id: 3,
    message: "Your parcel is waiting. Pay the delivery fee...",
    category: "Parcel Scam",
    location: "Indonesia",
    date: "2024-04-26 10:45",
  },
];

export default function ReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Community Reports</h1>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Recent Scam Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Message</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date/Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="max-w-[300px] truncate">
                        {report.message}
                      </TableCell>
                      <TableCell>{report.category}</TableCell>
                      <TableCell>{report.location}</TableCell>
                      <TableCell>{report.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Scam Distribution Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
                {/* TODO: Implement Leaflet.js map with heatmap overlay */}
                <p className="text-gray-500">Heatmap visualization coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 