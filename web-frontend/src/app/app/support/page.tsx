"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, MessageSquare, Phone } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="container mx-auto py-6 space-y-8 px-5">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground">
          Get help with your account, technical issues, or any other questions.
        </p>
      </div>

      <Tabs defaultValue="contact">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-4 pt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle>Email Support</CardTitle>
                </div>
                <CardDescription>
                  Send us an email and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">admin@bytecrew.site</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <CardTitle>Phone Support</CardTitle>
                </div>
                <CardDescription>
                  Available Monday to Friday, 9am to 5pm EST.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">NA</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle>Live Chat</CardTitle>
                </div>
                <CardDescription>
                  Chat with our support team in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Chat</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contact Form</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as
                possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help you?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Please provide as much detail as possible..."
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Submit</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about our platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    How do I reset my password?
                  </AccordionTrigger>
                  <AccordionContent>
                    To reset your password, click on the "Forgot Password" link
                    on the login page. You'll receive an email with instructions
                    to create a new password.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    What data sources do you use?
                  </AccordionTrigger>
                  <AccordionContent>
                    We use a combination of real-time and delayed market data
                    from various exchanges and financial data providers to
                    ensure accuracy and reliability.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    How often is the data updated?
                  </AccordionTrigger>
                  <AccordionContent>
                    Market data is updated in real-time during market hours.
                    Financial statements and other fundamental data are updated
                    quarterly or as soon as companies release new information.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    Can I export data to Excel?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, most data tables in our platform have an export option
                    that allows you to download the information in CSV or Excel
                    format.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    Is there a mobile app available?
                  </AccordionTrigger>
                  <AccordionContent>
                    We currently offer a responsive web application that works
                    well on mobile devices. A dedicated mobile app is in
                    development and will be released soon.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
