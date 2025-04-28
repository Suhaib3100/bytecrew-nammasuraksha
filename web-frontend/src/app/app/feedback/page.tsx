"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, ThumbsUp, Star } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send the feedback data to your backend
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setRating(null);
      // Reset form fields
      const form = e.target as HTMLFormElement;
      form.reset();
    }, 3000);
  };

  return (
    <div className="container mx-auto py-6 space-y-8 px-5">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground">
          Help us improve our platform by sharing your thoughts and suggestions.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Feedback</TabsTrigger>
          <TabsTrigger value="feature">Feature Request</TabsTrigger>
          <TabsTrigger value="bug">Report a Bug</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Feedback</CardTitle>
              <CardDescription>
                Share your overall experience with our platform.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {submitted ? (
                  <Alert className="bg-green-50 border-green-200">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <AlertTitle>Thank you for your feedback!</AlertTitle>
                    <AlertDescription>
                      We appreciate your input and will use it to improve our
                      platform.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>How would you rate your overall experience?</Label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map(value => (
                          <button
                            key={value}
                            type="button"
                            className={`p-1 rounded-full transition-colors ${
                              rating && rating >= value
                                ? "text-yellow-500"
                                : "text-gray-300 hover:text-yellow-500"
                            }`}
                            onClick={() => setRating(value)}
                          >
                            <Star className="h-8 w-8 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Your email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feedback">Your Feedback</Label>
                      <Textarea
                        id="feedback"
                        placeholder="Tell us what you like or what we could improve..."
                        className="min-h-[120px]"
                        required
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="pt-5">
                {!submitted && (
                  <Button type="submit">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="feature" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Request</CardTitle>
              <CardDescription>
                Suggest new features or improvements to existing ones.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {submitted ? (
                  <Alert className="bg-green-50 border-green-200">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <AlertTitle>Thank you for your feature request!</AlertTitle>
                    <AlertDescription>
                      We'll review your suggestion and consider it for future
                      updates.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="feature-title">Feature Title</Label>
                      <Input
                        id="feature-title"
                        placeholder="Brief title for your feature request"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feature-description">
                        Feature Description
                      </Label>
                      <Textarea
                        id="feature-description"
                        placeholder="Describe the feature you'd like to see and how it would benefit you..."
                        className="min-h-[120px]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <RadioGroup defaultValue="medium">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="priority-low" />
                          <Label htmlFor="priority-low">Low</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="priority-medium" />
                          <Label htmlFor="priority-medium">Medium</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="priority-high" />
                          <Label htmlFor="priority-high">High</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feature-email">Email (optional)</Label>
                      <Input
                        id="feature-email"
                        type="email"
                        placeholder="Your email for follow-up"
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="pt-5">
                {!submitted && (
                  <Button type="submit">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Request
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="bug" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Report a Bug</CardTitle>
              <CardDescription>
                Help us identify and fix issues by reporting bugs you encounter.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {submitted ? (
                  <Alert className="bg-green-50 border-green-200">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <AlertTitle>Thank you for reporting this issue!</AlertTitle>
                    <AlertDescription>
                      Our team will investigate and work on a fix as soon as
                      possible.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="bug-title">Bug Title</Label>
                      <Input
                        id="bug-title"
                        placeholder="Brief description of the issue"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bug-description">Bug Description</Label>
                      <Textarea
                        id="bug-description"
                        placeholder="Please describe what happened, what you expected to happen, and steps to reproduce the issue..."
                        className="min-h-[120px]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <RadioGroup defaultValue="medium">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="severity-low" />
                          <Label htmlFor="severity-low">
                            Low - Minor issue, doesn't affect functionality
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="severity-medium" />
                          <Label htmlFor="severity-medium">
                            Medium - Affects functionality but has workarounds
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="severity-high" />
                          <Label htmlFor="severity-high">
                            High - Critical issue, prevents normal usage
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="browser">
                        Browser/Device Information
                      </Label>
                      <Input
                        id="browser"
                        placeholder="e.g., Chrome 98 on Windows 10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bug-email">Email (optional)</Label>
                      <Input
                        id="bug-email"
                        type="email"
                        placeholder="Your email for follow-up"
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="pt-5">
                {!submitted && (
                  <Button type="submit">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Report
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
