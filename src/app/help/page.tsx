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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success notification
      const notification = document.createElement("div");
      notification.className =
        "fixed top-4 right-4 bg-cyber-green text-black px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn font-orbitron font-semibold";
      notification.textContent =
        "✅ Support ticket submitted successfully! We'll get back to you within 24 hours.";
      document.body.appendChild(notification);

      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.style.opacity = "0";
          setTimeout(() => notification.remove(), 200);
        }
      }, 5000);

      setSupportTicket({
        subject: "",
        message: "",
        priority: "medium",
        category: "general",
      });
    } catch (error) {
      console.error("Error submitting ticket:", error);

      // Show error notification
      const notification = document.createElement("div");
      notification.className =
        "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn font-orbitron font-semibold";
      notification.textContent =
        "❌ Failed to submit ticket. Please try again.";
      document.body.appendChild(notification);

      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.style.opacity = "0";
          setTimeout(() => notification.remove(), 200);
        }
      }, 5000);
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
            <h1 className="text-2xl font-bold text-cyber-blue text-enhanced">
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
              <HelpCircle className="h-16 w-16 mx-auto mb-4 text-cyber-blue" />
              <h2 className="text-3xl font-bold text-white mb-4 text-enhanced">
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
              <Card
                className="cyber-card hover:border-cyber-blue cursor-pointer transition-all duration-300"
                onClick={() => {
                  // Live Chat Implementation
                  const modal = document.createElement("div");
                  modal.className =
                    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
                  modal.innerHTML = `
                    <div class="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-cyber-blue">
                      <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-cyber-blue flex items-center font-orbitron">
                          <span class="text-2xl mr-2">💬</span>
                          Live Chat Support
                        </h3>
                        <button class="text-slate-400 hover:text-white text-xl" onclick="this.closest('.fixed').remove()">&times;</button>
                      </div>
                      <div class="space-y-4">
                        <div class="bg-slate-700 p-3 rounded-lg">
                          <div class="flex items-start space-x-3">
                            <div class="text-cyber-blue text-lg">🤖</div>
                            <div>
                              <p class="text-white font-medium">AI Assistant</p>
                              <p class="text-slate-300 text-sm">Hello! I'm here to help you with any questions about FeedbackPro. How can I assist you today?</p>
                              <p class="text-slate-400 text-xs mt-1">Just now</p>
                            </div>
                          </div>
                        </div>
                        <div class="flex space-x-2">
                          <input type="text" placeholder="Type your message..." class="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
                          <button class="bg-cyber-blue text-black px-4 py-2 rounded font-semibold hover:bg-cyber-blue/80 transition-colors">Send</button>
                        </div>
                        <div class="text-center text-xs text-slate-400">
                          💡 Try asking: "How do I create a survey?" or "How to view responses?"
                        </div>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(modal);

                  // Close on backdrop click
                  modal.addEventListener("click", (e) => {
                    if (e.target === modal) modal.remove();
                  });
                }}
              >
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

              <Card
                className="cyber-card hover:border-cyber-purple cursor-pointer transition-all duration-300"
                onClick={() => {
                  // Email Support Implementation
                  const modal = document.createElement("div");
                  modal.className =
                    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
                  modal.innerHTML = `
                    <div class="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-cyber-purple">
                      <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-cyber-purple flex items-center font-orbitron">
                          <span class="text-2xl mr-2">📧</span>
                          Email Support
                        </h3>
                        <button class="text-slate-400 hover:text-white text-xl" onclick="this.closest('.fixed').remove()">&times;</button>
                      </div>
                      <div class="space-y-4">
                        <div class="text-center">
                          <p class="text-white mb-4">Send us a detailed message and we'll get back to you within 2-4 hours.</p>
                          <div class="space-y-2 text-sm">
                            <div class="flex items-center justify-center space-x-2">
                              <span class="text-cyber-purple">📧</span>
                              <span class="text-white">support@feedbackpro.com</span>
                            </div>
                            <div class="flex items-center justify-center space-x-2">
                              <span class="text-cyber-purple">⏱️</span>
                              <span class="text-slate-300">Average response: 2-4 hours</span>
                            </div>
                            <div class="flex items-center justify-center space-x-2">
                              <span class="text-cyber-purple">🌍</span>
                              <span class="text-slate-300">Available 24/7</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          class="w-full bg-cyber-purple text-white py-2 rounded-lg font-semibold hover:bg-cyber-purple/80 transition-colors"
                          onclick="window.open('mailto:support@feedbackpro.com?subject=FeedbackPro Support Request', '_blank'); this.closest('.fixed').remove();"
                        >
                          Open Email Client
                        </button>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(modal);

                  // Close on backdrop click
                  modal.addEventListener("click", (e) => {
                    if (e.target === modal) modal.remove();
                  });
                }}
              >
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

              <Card
                className="cyber-card hover:border-cyber-orange cursor-pointer transition-all duration-300"
                onClick={() => {
                  // Phone Support Implementation
                  const modal = document.createElement("div");
                  modal.className =
                    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
                  modal.innerHTML = `
                    <div class="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-cyber-orange">
                      <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-cyber-orange flex items-center font-orbitron">
                          <span class="text-2xl mr-2">📞</span>
                          Phone Support
                        </h3>
                        <button class="text-slate-400 hover:text-white text-xl" onclick="this.closest('.fixed').remove()">&times;</button>
                      </div>
                      <div class="space-y-4">
                        <div class="text-center">
                          <p class="text-white mb-4">Call us directly for urgent issues and immediate assistance.</p>
                          <div class="space-y-3 text-sm">
                            <div class="bg-slate-700 p-3 rounded-lg">
                              <div class="flex items-center justify-center space-x-2 mb-2">
                                <span class="text-cyber-orange text-lg">📞</span>
                                <span class="text-white font-semibold text-lg">+1 (555) 123-4567</span>
                              </div>
                              <p class="text-slate-300 text-xs">Main Support Line</p>
                            </div>
                            <div class="flex items-center justify-center space-x-2">
                              <span class="text-cyber-orange">🕒</span>
                              <span class="text-slate-300">Mon-Fri: 9AM-6PM EST</span>
                            </div>
                            <div class="flex items-center justify-center space-x-2">
                              <span class="text-cyber-orange">🚨</span>
                              <span class="text-slate-300">24/7 Emergency Line: +1 (555) 911-HELP</span>
                            </div>
                            <div class="flex items-center justify-center space-x-2">
                              <span class="text-cyber-orange">⚡</span>
                              <span class="text-slate-300">Average wait time: < 2 minutes</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          class="w-full bg-cyber-orange text-black py-2 rounded-lg font-semibold hover:bg-cyber-orange/80 transition-colors"
                          onclick="window.open('tel:+15551234567', '_self'); this.closest('.fixed').remove();"
                        >
                          Call Now
                        </button>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(modal);

                  // Close on backdrop click
                  modal.addEventListener("click", (e) => {
                    if (e.target === modal) modal.remove();
                  });
                }}
              >
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
                        onClick={() => {
                          // Resource click handler
                          const modal = document.createElement("div");
                          modal.className =
                            "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

                          let modalContent = "";

                          if (resource.title === "Getting Started Guide") {
                            modalContent = `
                              <div class="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-cyber-blue max-h-[80vh] overflow-y-auto">
                                <div class="flex justify-between items-center mb-4">
                                  <h3 class="text-xl font-semibold text-cyber-blue flex items-center font-orbitron">
                                    <span class="text-2xl mr-2">📚</span>
                                    Getting Started Guide
                                  </h3>
                                  <button class="text-slate-400 hover:text-white text-xl" onclick="this.closest('.fixed').remove()">&times;</button>
                                </div>
                                <div class="space-y-4 text-white">
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-blue font-semibold mb-2">Step 1: Create Your Account</h4>
                                    <p class="text-sm text-slate-300">Sign up for FeedbackPro and verify your email address to get started.</p>
                                  </div>
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-blue font-semibold mb-2">Step 2: Create Your First Survey</h4>
                                    <p class="text-sm text-slate-300">Use our drag-and-drop builder to create questions and customize your survey design.</p>
                                  </div>
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-blue font-semibold mb-2">Step 3: Distribute Your Survey</h4>
                                    <p class="text-sm text-slate-300">Share via email, SMS, links, QR codes, or embed on your website.</p>
                                  </div>
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-blue font-semibold mb-2">Step 4: Analyze Results</h4>
                                    <p class="text-sm text-slate-300">View real-time analytics, sentiment analysis, and generate reports.</p>
                                  </div>
                                </div>
                              </div>
                            `;
                          } else if (resource.title === "Video Tutorials") {
                            modalContent = `
                              <div class="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-cyber-purple max-h-[80vh] overflow-y-auto">
                                <div class="flex justify-between items-center mb-4">
                                  <h3 class="text-xl font-semibold text-cyber-purple flex items-center font-orbitron">
                                    <span class="text-2xl mr-2">🎥</span>
                                    Video Tutorials
                                  </h3>
                                  <button class="text-slate-400 hover:text-white text-xl" onclick="this.closest('.fixed').remove()">&times;</button>
                                </div>
                                <div class="space-y-4">
                                  <div class="bg-slate-700 p-4 rounded-lg hover:bg-slate-600 cursor-pointer transition-colors">
                                    <div class="flex items-center space-x-3">
                                      <div class="text-cyber-purple text-2xl">▶️</div>
                                      <div>
                                        <h4 class="text-white font-semibold">Survey Builder Walkthrough</h4>
                                        <p class="text-slate-300 text-sm">Learn how to create your first survey • 5:30</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="bg-slate-700 p-4 rounded-lg hover:bg-slate-600 cursor-pointer transition-colors">
                                    <div class="flex items-center space-x-3">
                                      <div class="text-cyber-purple text-2xl">▶️</div>
                                      <div>
                                        <h4 class="text-white font-semibold">Distribution Methods</h4>
                                        <p class="text-slate-300 text-sm">All the ways to share your surveys • 3:45</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="bg-slate-700 p-4 rounded-lg hover:bg-slate-600 cursor-pointer transition-colors">
                                    <div class="flex items-center space-x-3">
                                      <div class="text-cyber-purple text-2xl">▶️</div>
                                      <div>
                                        <h4 class="text-white font-semibold">Analytics Dashboard Tour</h4>
                                        <p class="text-slate-300 text-sm">Understanding your survey data • 7:20</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="bg-slate-700 p-4 rounded-lg hover:bg-slate-600 cursor-pointer transition-colors">
                                    <div class="flex items-center space-x-3">
                                      <div class="text-cyber-purple text-2xl">▶️</div>
                                      <div>
                                        <h4 class="text-white font-semibold">Advanced Features</h4>
                                        <p class="text-slate-300 text-sm">Automations, integrations & more • 12:15</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            `;
                          } else if (resource.title === "API Documentation") {
                            modalContent = `
                              <div class="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-cyber-green max-h-[80vh] overflow-y-auto">
                                <div class="flex justify-between items-center mb-4">
                                  <h3 class="text-xl font-semibold text-cyber-green flex items-center font-orbitron">
                                    <span class="text-2xl mr-2">📄</span>
                                    API Documentation
                                  </h3>
                                  <button class="text-slate-400 hover:text-white text-xl" onclick="this.closest('.fixed').remove()">&times;</button>
                                </div>
                                <div class="space-y-4">
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-green font-semibold mb-2">REST API Endpoints</h4>
                                    <div class="space-y-2 text-sm">
                                      <div class="flex items-center space-x-2">
                                        <span class="bg-green-600 text-white px-2 py-1 rounded text-xs">GET</span>
                                        <code class="text-slate-300">/api/surveys</code>
                                      </div>
                                      <div class="flex items-center space-x-2">
                                        <span class="bg-blue-600 text-white px-2 py-1 rounded text-xs">POST</span>
                                        <code class="text-slate-300">/api/surveys</code>
                                      </div>
                                      <div class="flex items-center space-x-2">
                                        <span class="bg-green-600 text-white px-2 py-1 rounded text-xs">GET</span>
                                        <code class="text-slate-300">/api/responses</code>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-green font-semibold mb-2">Authentication</h4>
                                    <p class="text-slate-300 text-sm">Use Bearer tokens for API authentication</p>
                                    <code class="block bg-slate-900 p-2 rounded mt-2 text-xs text-slate-300">Authorization: Bearer YOUR_API_KEY</code>
                                  </div>
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-green font-semibold mb-2">Rate Limits</h4>
                                    <p class="text-slate-300 text-sm">1000 requests per hour for standard plans</p>
                                  </div>
                                </div>
                              </div>
                            `;
                          } else if (resource.title === "Best Practices") {
                            modalContent = `
                              <div class="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-cyber-orange max-h-[80vh] overflow-y-auto">
                                <div class="flex justify-between items-center mb-4">
                                  <h3 class="text-xl font-semibold text-cyber-orange flex items-center font-orbitron">
                                    <span class="text-2xl mr-2">⚡</span>
                                    Best Practices
                                  </h3>
                                  <button class="text-slate-400 hover:text-white text-xl" onclick="this.closest('.fixed').remove()">&times;</button>
                                </div>
                                <div class="space-y-4">
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-orange font-semibold mb-2">📝 Survey Design</h4>
                                    <ul class="text-slate-300 text-sm space-y-1">
                                      <li>• Keep surveys short (5-10 questions max)</li>
                                      <li>• Use clear, unbiased language</li>
                                      <li>• Mix question types for engagement</li>
                                      <li>• Test before distributing</li>
                                    </ul>
                                  </div>
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-orange font-semibold mb-2">📊 Distribution Tips</h4>
                                    <ul class="text-slate-300 text-sm space-y-1">
                                      <li>• Send at optimal times (Tue-Thu, 10AM-2PM)</li>
                                      <li>• Personalize invitation messages</li>
                                      <li>• Follow up with non-responders</li>
                                      <li>• Use multiple channels for better reach</li>
                                    </ul>
                                  </div>
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-orange font-semibold mb-2">📈 Response Optimization</h4>
                                    <ul class="text-slate-300 text-sm space-y-1">
                                      <li>• Offer incentives for completion</li>
                                      <li>• Show progress indicators</li>
                                      <li>• Make surveys mobile-friendly</li>
                                      <li>• Explain how data will be used</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            `;
                          } else if (resource.title === "Community Forum") {
                            modalContent = `
                              <div class="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-cyber-pink max-h-[80vh] overflow-y-auto">
                                <div class="flex justify-between items-center mb-4">
                                  <h3 class="text-xl font-semibold text-cyber-pink flex items-center font-orbitron">
                                    <span class="text-2xl mr-2">👥</span>
                                    Community Forum
                                  </h3>
                                  <button class="text-slate-400 hover:text-white text-xl" onclick="this.closest('.fixed').remove()">&times;</button>
                                </div>
                                <div class="space-y-4">
                                  <div class="text-center mb-4">
                                    <p class="text-white mb-4">Connect with other FeedbackPro users, share tips, and get help from the community.</p>
                                  </div>
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-pink font-semibold mb-2">🔥 Popular Topics</h4>
                                    <div class="space-y-2 text-sm">
                                      <div class="flex justify-between items-center">
                                        <span class="text-white">Survey Design Tips & Tricks</span>
                                        <span class="text-slate-400">234 posts</span>
                                      </div>
                                      <div class="flex justify-between items-center">
                                        <span class="text-white">Integration Help & Support</span>
                                        <span class="text-slate-400">156 posts</span>
                                      </div>
                                      <div class="flex justify-between items-center">
                                        <span class="text-white">Feature Requests</span>
                                        <span class="text-slate-400">89 posts</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-pink font-semibold mb-2">📊 Community Stats</h4>
                                    <div class="grid grid-cols-2 gap-4 text-sm">
                                      <div class="text-center">
                                        <div class="text-white font-semibold">2,847</div>
                                        <div class="text-slate-400">Active Members</div>
                                      </div>
                                      <div class="text-center">
                                        <div class="text-white font-semibold">1,234</div>
                                        <div class="text-slate-400">Discussions</div>
                                      </div>
                                    </div>
                                  </div>
                                  <button 
                                    class="w-full bg-cyber-pink text-white py-2 rounded-lg font-semibold hover:bg-cyber-pink/80 transition-colors"
                                    onclick="window.open('https://community.feedbackpro.com', '_blank'); this.closest('.fixed').remove();"
                                  >
                                    Join Community Forum
                                  </button>
                                </div>
                              </div>
                            `;
                          } else {
                            modalContent = `
                              <div class="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-cyber-blue max-h-[80vh] overflow-y-auto">
                                <div class="flex justify-between items-center mb-4">
                                  <h3 class="text-xl font-semibold text-cyber-blue flex items-center font-orbitron">
                                    <span class="text-2xl mr-2">📊</span>
                                    Analytics Guide
                                  </h3>
                                  <button class="text-slate-400 hover:text-white text-xl" onclick="this.closest('.fixed').remove()">&times;</button>
                                </div>
                                <div class="space-y-4">
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-blue font-semibold mb-2">📈 Understanding Metrics</h4>
                                    <ul class="text-slate-300 text-sm space-y-1">
                                      <li>• Response Rate: % of people who completed your survey</li>
                                      <li>• Completion Rate: % who finished after starting</li>
                                      <li>• Sentiment Score: Overall emotional tone (1-5 scale)</li>
                                      <li>• Drop-off Points: Where people stop responding</li>
                                    </ul>
                                  </div>
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-blue font-semibold mb-2">🎯 Key Performance Indicators</h4>
                                    <ul class="text-slate-300 text-sm space-y-1">
                                      <li>• Good response rate: 20-30%</li>
                                      <li>• Excellent completion rate: 85%+</li>
                                      <li>• Positive sentiment: 3.5+ average</li>
                                      <li>• Low drop-off: <10% per question</li>
                                    </ul>
                                  </div>
                                  <div class="bg-slate-700 p-4 rounded-lg">
                                    <h4 class="text-cyber-blue font-semibold mb-2">📊 Advanced Analytics</h4>
                                    <ul class="text-slate-300 text-sm space-y-1">
                                      <li>• Keyword tagging for open responses</li>
                                      <li>• Demographic breakdowns</li>
                                      <li>• Time-based trend analysis</li>
                                      <li>• Cross-survey comparisons</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            `;
                          }

                          modal.innerHTML = modalContent;
                          document.body.appendChild(modal);

                          // Close on backdrop click
                          modal.addEventListener("click", (e) => {
                            if (e.target === modal) modal.remove();
                          });
                        }}
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
