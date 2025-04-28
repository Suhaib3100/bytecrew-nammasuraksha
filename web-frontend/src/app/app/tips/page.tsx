"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Mail, MessageSquare, Globe, Share2, Shield, Lock, Phone, CreditCard, AlertTriangle, FileText, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const tips = [
  {
    title: "Hover Before You Click",
    icon: Globe,
    category: "Web",
    points: [
      "Always hover over links to see the actual URL before clicking",
      "Look for HTTPS and padlock icon in the address bar",
      "Be wary of shortened URLs or misspelled domain names"
    ]
  },
  {
    title: "Email Sender Verification",
    icon: Mail,
    category: "Email",
    points: [
      "Check the sender's email address carefully",
      "Look for spelling mistakes in the domain name",
      "Verify unexpected attachments before downloading"
    ]
  },
  {
    title: "SMS Scam Detection",
    icon: MessageSquare,
    category: "SMS",
    points: [
      "Never click links in unsolicited text messages",
      "Be suspicious of urgent requests for personal information",
      "Verify the sender's number through official channels"
    ]
  },
  {
    title: "Social Media Vigilance",
    icon: Share2,
    category: "Social",
    points: [
      "Be cautious of friend requests from unknown people",
      "Verify the authenticity of giveaways and contests",
      "Don't share personal information in public posts"
    ]
  },
  {
    title: "Two-Factor Authentication",
    icon: Shield,
    category: "Web",
    points: [
      "Enable 2FA on all important accounts",
      "Use authenticator apps instead of SMS when possible",
      "Keep backup codes in a secure place"
    ]
  },
  {
    title: "Password Security",
    icon: Lock,
    category: "Web",
    points: [
      "Use unique passwords for each account",
      "Consider using a password manager",
      "Change passwords immediately if a service is breached"
    ]
  },
  {
    title: "Phone Call Verification",
    icon: Phone,
    category: "Phone",
    points: [
      "Never share personal information over unsolicited calls",
      "Verify caller identity through official channels",
      "Be wary of urgent requests for payment or information"
    ]
  },
  {
    title: "Payment Safety",
    icon: CreditCard,
    category: "Web",
    points: [
      "Use credit cards for online purchases when possible",
      "Check for secure payment gateways",
      "Never share card details over email or phone"
    ]
  },
  {
    title: "Emergency Scam Alerts",
    icon: AlertTriangle,
    category: "All",
    points: [
      "Be extra cautious during natural disasters or crises",
      "Verify charity organizations before donating",
      "Report suspicious activities to authorities"
    ]
  },
  {
    title: "Document Verification",
    icon: FileText,
    category: "Email",
    points: [
      "Verify the authenticity of official-looking documents",
      "Check for watermarks and official seals",
      "Contact the organization directly to verify requests"
    ]
  },
  {
    title: "Social Engineering Defense",
    icon: AlertCircle,
    category: "All",
    points: [
      "Be skeptical of urgent or emotional appeals",
      "Verify requests from authority figures",
      "Don't let pressure tactics rush your decisions"
    ]
  },
  {
    title: "Regular Security Checkups",
    icon: HelpCircle,
    category: "All",
    points: [
      "Regularly review account security settings",
      "Check for unusual account activity",
      "Update security questions and recovery options"
    ]
  }
];

export default function TipsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Scam Awareness Tips</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tips.map((tip, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <tip.icon className="h-5 w-5" />
                <CardTitle>{tip.title}</CardTitle>
              </div>
              <div className="text-sm text-muted-foreground">
                Category: {tip.category}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {tip.points.map((point, pointIndex) => (
                  <li key={pointIndex}>{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Bonus Resources</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="resources">
            <AccordionTrigger>External Guides and Resources</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://www.consumer.ftc.gov/articles/how-recognize-and-avoid-phishing-scams" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    FTC Guide to Phishing Scams
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.cyber.gov.au/acsc/view-all-content/advice-and-guidance" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Australian Cyber Security Centre Advice
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.ncsc.gov.uk/guidance/phishing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    UK National Cyber Security Centre Phishing Guidance
                  </a>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq">
            <AccordionTrigger>What to do if I've been scammed?</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Immediately contact your bank or financial institution</li>
                <li>Change all passwords for affected accounts</li>
                <li>Report the incident to local authorities</li>
                <li>Contact relevant government agencies (e.g., FTC, Cyber Crime Cell)</li>
                <li>Monitor your accounts for suspicious activity</li>
                <li>Consider freezing your credit if sensitive information was compromised</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
} 