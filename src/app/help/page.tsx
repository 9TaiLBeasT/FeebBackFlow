"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import {
  HelpCircle,
  Search,
  MessageCircle,
  Book,
  Video,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  ExternalLink,
  FileText,
  Zap,
  Users,
  BarChart,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  subject: string;
  message: string;
  priority: "low" | "medium" | "high";
  category: string;
}

export default function HelpPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [supportTicket, setSupportTicket] = useState<SupportTicket>({
    subject: "",
    message: "",
    priority: "medium",
    category: "general",
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const router = useRouter();

  const faqs: FAQItem[] = [
    {
      id: "1",
      question: "How do I create my first survey?",
      answer:
        "To create your first survey, navigate to the Surveys page and click the 'Create Survey' button. You can choose from pre-built templates or start from scratch. Use our drag-and-drop builder to add questions, customize the design, and set up distribution options.",
      category: "getting-started",
    },
    {
      id: "2",
      question: "What question types are available?",
      answer:
        "FeedbackPro supports multiple question types including: Multiple Choice, Likert Scale (1-5 or 1-10), Open-ended text, Yes/No questions, Rating scales, and Matrix questions. Each type can be customized with descriptions, required fields, and conditional logic.",
      category: "surveys",
    },
    {
      id: "3",
      question: "How can I share my surveys?",
      answer:
        "You can distribute surveys through multiple channels: Email campaigns, SMS messaging, Shareable links, QR codes, Embedded widgets on your website, and Social media. Each method provides detailed tracking and analytics.",
      category: "distribution",
    },
    {
      id: "4",
      question: "How do I view survey responses?",
      answer:
        "Go to the Responses page to view all survey responses. You can filter by survey, date range, or completion status. Individual responses can be viewed in detail, and you can export data in CSV or PDF format.",
      category: "responses",
    },
    {
      id: "5",
      question: "What analytics are available?",
      answer:
        "Our Analytics dashboard provides: Response rates and completion statistics, Sentiment analysis of text responses, Keyword tagging and trends, Custom reports and visualizations, Real-time response tracking, and Comparative analysis across surveys.",
      category: "analytics",
    },
    {
      id: "6",
      question: "Can I integrate with other tools?",
      answer:
        "Yes! FeedbackPro integrates with popular tools including: CRM systems (Salesforce, HubSpot), Project management (Asana, Trello), Communication platforms (Slack, Teams), Email marketing (Mailchimp, Constant Contact), and Zapier for custom workflows.",
      category: "integrations",
    },
    {
      id: "7",
      question: "Is my data secure?",
      answer:
        "Absolutely. We use enterprise-grade security including: SSL encryption for all data transmission, SOC 2 Type II compliance, GDPR and CCPA compliance, Regular security audits, and Data backup and recovery systems. Your data is stored securely and never shared without permission.",
      category: "security",
    },
    {
      id: "8",
      question: "What are the pricing plans?",
      answer:
        "We offer flexible pricing: Free plan (up to 3 surveys, 100 responses/month), Professional ($29/month - unlimited surveys and responses), Enterprise (custom pricing with advanced features). All plans include core features with varying limits and premium capabilities.",
      category: "billing",
    },
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      description: "Complete walkthrough for new users",
      icon: Book,
      link: "#",
      type: "guide",
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video instructions",
      icon: Video,
      link: "#",
      type: "video",
    },
    {
      title: "API Documentation",
      description: "Technical documentation for developers",
      icon: FileText,
      link: "#",
      type: "docs",
    },
    {
      title: "Best Practices",
      description: "Tips for creating effective surveys",
      icon: Zap,
      link: "#",
      type: "guide",
    },
    {
      title: "Community Forum",
      description: "Connect with other users",
      icon: Users,
      link: "#",
      type: "community",
    },
    {
      title: "Analytics Guide",
      description: "Understanding your survey data",
      icon: BarChart,
      link: "#",
      type: "guide",
    },
  ];

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const submitSupportTicket = async () => {
    setSubmittingTicket(true);
    try {
      // In a real app, this would submit to your support system
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(
        "Support ticket submitted successfully! We'll get back to you within 24 hours.",
      );
      setSupportTicket({
        subject: "",
        message: "",
        priority: "medium",
        category: "general",
      });
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert("Failed to submit ticket. Please try again.");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-cyber items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-cyber-blue"></div>
          <div className="text-white text-lg font-orbitron">
            Loading Help Center...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-cyber text-white font-orbitron">
      <DashboardSidebar user={user} onSignOut={handleSignOut} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-cyber-blue animate-glow-pulse">
              Help & Support
            </h1>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
              24/7 Support Available
            </Badge>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center py-8 animate-fade-in">
              <HelpCircle className="h-16 w-16 mx-auto mb-4 text-cyber-blue animate-glow-pulse" />
              <h2 className="text-3xl font-bold text-white mb-4">
                How can we help you?
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Find answers to common questions, browse our documentation, or
                contact our support team.
              </p>
            </div>

            {/* Search */}
            <Card className="cyber-card animate-slide-up">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Search for help articles, FAQs, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white focus:border-cyber-blue text-lg py-3"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <Card className="cyber-card hover:border-cyber-blue cursor-pointer transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-cyber-blue" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Live Chat
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Get instant help from our support team
                  </p>
                  <Badge className="bg-cyber-green text-black">
                    <Clock className="h-3 w-3 mr-1" />
                    Online Now
                  </Badge>
                </CardContent>
              </Card>

              <Card className="cyber-card hover:border-cyber-purple cursor-pointer transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-cyber-purple" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Email Support
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Send us a detailed message
                  </p>
                  <Badge className="bg-cyber-purple text-white">
                    Response in 2-4 hours
                  </Badge>
                </CardContent>
              </Card>

              <Card className="cyber-card hover:border-cyber-orange cursor-pointer transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Phone className="h-12 w-12 mx-auto mb-4 text-cyber-orange" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Phone Support
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Call us for urgent issues
                  </p>
                  <Badge className="bg-cyber-orange text-black">
                    +1 (555) 123-4567
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Resources */}
            <Card
              className="cyber-card animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <CardHeader>
                <CardTitle className="text-cyber-blue">
                  Popular Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((resource, index) => {
                    const IconComponent = resource.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-4 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors group"
                      >
                        <IconComponent className="h-8 w-8 text-cyber-blue group-hover:text-cyber-purple transition-colors" />
                        <div className="flex-1">
                          <h4 className="font-medium text-white group-hover:text-cyber-blue transition-colors">
                            {resource.title}
                          </h4>
                          <p className="text-sm text-slate-400">
                            {resource.description}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card
              className="cyber-card animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <CardHeader>
                <CardTitle className="text-cyber-green">
                  Frequently Asked Questions
                </CardTitle>
                <p className="text-slate-400">
                  {filteredFAQs.length}{" "}
                  {filteredFAQs.length === 1 ? "question" : "questions"} found
                </p>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="border border-slate-700 rounded-lg px-4 hover:border-cyber-blue transition-colors"
                    >
                      <AccordionTrigger className="text-white hover:text-cyber-blue transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card
              className="cyber-card animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <CardHeader>
                <CardTitle className="text-cyber-pink">
                  Submit a Support Ticket
                </CardTitle>
                <p className="text-slate-400">
                  Can't find what you're looking for? Send us a message and
                  we'll help you out.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-white font-medium">Subject</label>
                    <Input
                      value={supportTicket.subject}
                      onChange={(e) =>
                        setSupportTicket({
                          ...supportTicket,
                          subject: e.target.value,
                        })
                      }
                      placeholder="Brief description of your issue"
                      className="bg-slate-800 border-slate-700 text-white focus:border-cyber-pink"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white font-medium">Priority</label>
                    <select
                      value={supportTicket.priority}
                      onChange={(e) =>
                        setSupportTicket({
                          ...supportTicket,
                          priority: e.target.value as any,
                        })
                      }
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:border-cyber-pink"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white font-medium">Message</label>
                  <Textarea
                    value={supportTicket.message}
                    onChange={(e) =>
                      setSupportTicket({
                        ...supportTicket,
                        message: e.target.value,
                      })
                    }
                    placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you expected to happen."
                    className="bg-slate-800 border-slate-700 text-white focus:border-cyber-pink min-h-[120px]"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    onClick={submitSupportTicket}
                    disabled={
                      !supportTicket.subject ||
                      !supportTicket.message ||
                      submittingTicket
                    }
                    className="cyber-button text-black font-semibold"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submittingTicket ? "Submitting..." : "Submit Ticket"}
                  </Button>
                  <div className="flex items-center text-sm text-slate-400">
                    <CheckCircle className="h-4 w-4 mr-1 text-cyber-green" />
                    We typically respond within 2-4 hours
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status & Updates */}
            <Card
              className="cyber-card animate-slide-up"
              style={{ animationDelay: "0.5s" }}
            >
              <CardHeader>
                <CardTitle className="text-white">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-cyber-green" />
                      <span className="text-white">
                        All Systems Operational
                      </span>
                    </div>
                    <Badge className="bg-cyber-green text-black">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-cyber-green" />
                      <span className="text-white">API Response Time</span>
                    </div>
                    <Badge className="bg-cyber-green text-black">
                      125ms avg
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-cyber-orange" />
                      <span className="text-white">Scheduled Maintenance</span>
                    </div>
                    <Badge className="bg-cyber-orange text-black">
                      Jan 15, 2:00 AM UTC
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
