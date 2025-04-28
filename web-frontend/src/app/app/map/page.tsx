"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScamLocation, ScamType } from "@/types/scam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MapFormData, HandleChange, HandleSubmit, HandleSelectChange } from "./types";

export default function ScamMap() {
  const [scamLocations, setScamLocations] = useState<ScamLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [formData, setFormData] = useState<MapFormData>({
    type: "" as ScamType,
    description: "",
    evidence: "",
    reporterEmail: "",
  });

  useEffect(() => {
    fetchScamLocations();
  }, []);

  const fetchScamLocations = async () => {
    try {
      const response = await fetch("/api/scams");
      const data = await response.json();
      setScamLocations(data);
    } catch (error) {
      console.error("Failed to fetch scam locations:", error);
      toast.error("Failed to load scam locations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit: HandleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/scams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          location: [3.1390, 101.6869], // Default to KL for now
        }),
      });

      if (!response.ok) throw new Error("Failed to submit report");

      toast.success("Scam report submitted successfully");
      setShowReportForm(false);
      setFormData({
        type: "" as ScamType,
        description: "",
        evidence: "",
        reporterEmail: "",
      });
      fetchScamLocations();
    } catch (error) {
      console.error("Failed to submit report:", error);
      toast.error("Failed to submit scam report");
    }
  };

  const handleInputChange: HandleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange: HandleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, type: value as ScamType }));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Scam Map</h1>
        <p className="text-muted-foreground">
          View reported scam locations and hotspots
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <MapContainer
                center={[3.1390, 101.6869]}
                zoom={5}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {scamLocations.map((location) => (
                  <Marker key={location.id} position={location.location}>
                    <Popup>
                      <div>
                        <h3 className="font-bold">{location.type}</h3>
                        <p>{location.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Reports: {location.reports}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scam Statistics</CardTitle>
              <CardDescription>Recent scam reports by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scamLocations.map((location) => (
                  <div key={location.id} className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{location.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {location.reports} reports
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report a Scam</CardTitle>
              <CardDescription>Help others by reporting scam locations</CardDescription>
            </CardHeader>
            <CardContent>
              {!showReportForm ? (
                <Button
                  className="w-full"
                  onClick={() => setShowReportForm(true)}
                >
                  Report a Scam
                </Button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Scam Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select scam type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Investment Scam">Investment Scam</SelectItem>
                        <SelectItem value="Job Scam">Job Scam</SelectItem>
                        <SelectItem value="Tech Support Scam">Tech Support Scam</SelectItem>
                        <SelectItem value="Phishing Scam">Phishing Scam</SelectItem>
                        <SelectItem value="Lottery Scam">Lottery Scam</SelectItem>
                        <SelectItem value="Romance Scam">Romance Scam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the scam..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evidence">Evidence (Optional)</Label>
                    <Input
                      id="evidence"
                      value={formData.evidence}
                      onChange={handleInputChange}
                      placeholder="Link to evidence..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reporterEmail">Your Email (Optional)</Label>
                    <Input
                      id="reporterEmail"
                      type="email"
                      value={formData.reporterEmail}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Submit Report
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowReportForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 