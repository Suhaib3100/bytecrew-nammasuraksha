import { NextResponse } from "next/server";
import { ScamLocation, ScamReport } from "@/types/scam";

// In a real app, this would be a database
let scamLocations: ScamLocation[] = [
  {
    id: "1",
    location: [1.3521, 103.8198],
    type: "Investment Scam",
    description: "Multiple reports of cryptocurrency investment scams",
    reports: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    location: [3.1390, 101.6869],
    type: "Job Scam",
    description: "Fake job offers targeting young professionals",
    reports: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    location: [13.7563, 100.5018],
    type: "Tech Support Scam",
    description: "Tech support scams targeting elderly",
    reports: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(scamLocations);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newReport: ScamReport = {
      id: Math.random().toString(36).substr(2, 9),
      ...body,
      createdAt: new Date().toISOString(),
    };

    // Find existing location or create new one
    const existingLocation = scamLocations.find(
      (loc) =>
        loc.location[0] === newReport.location[0] &&
        loc.location[1] === newReport.location[1] &&
        loc.type === newReport.type
    );

    if (existingLocation) {
      existingLocation.reports += 1;
      existingLocation.updatedAt = new Date().toISOString();
    } else {
      const newLocation: ScamLocation = {
        id: Math.random().toString(36).substr(2, 9),
        location: newReport.location,
        type: newReport.type,
        description: newReport.description,
        reports: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      scamLocations.push(newLocation);
    }

    return NextResponse.json({ success: true, report: newReport });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process report" },
      { status: 500 }
    );
  }
} 