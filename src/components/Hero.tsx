"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  MessageSquare,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

interface HeroProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

export default function Hero({ onSignUp, onSignIn }: HeroProps) {
  const features = [
    {
      icon: <MessageSquare className="h-8 w-8 text-[#1E90FF]" />,
      title: "Survey Builder",
      description:
        "Drag-and-drop interface with customizable templates and various question types",
    },
    {
      icon: <Globe className="h-8 w-8 text-[#1E90FF]" />,
      title: "Multi-Channel Distribution",
      description:
        "Send surveys via email, SMS, shareable links, QR codes, and in-app widgets",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-[#1E90FF]" />,
      title: "Real-time Analytics",
      description:
        "Response tracking with sentiment analysis, keyword tagging, and custom reports",
    },
    {
      icon: <Zap className="h-8 w-8 text-[#1E90FF]" />,
      title: "Smart Integrations",
      description:
        "Connect with popular CRMs, project management tools, and communication platforms",
    },
  ];

  const benefits = [
    "Professional dark mode UI with modern SaaS design",
    "Real-time response tracking and analytics",
    "Sentiment analysis and keyword tagging",
    "Multi-channel survey distribution",
    "Customizable templates and question types",
    "Enterprise-grade security and compliance",
  ];

  const showDemoModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    modal.style.opacity = "0";
    modal.innerHTML = `
      <div class="bg-slate-900 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-white">FeedbackPro Demo</h2>
          <button class="text-slate-400 hover:text-white text-2xl" onclick="this.closest('.fixed').style.opacity='0'; setTimeout(() => this.closest('.fixed').remove(), 200)">&times;</button>
        </div>
        <div class="space-y-6">
          <div class="bg-slate-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4">🎯 Survey Creation Process</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div class="bg-slate-700 p-4 rounded">
                <div class="text-[#1E90FF] font-semibold mb-2">1. Choose Template</div>
                <div class="text-slate-300">Select from pre-built templates or start from scratch</div>
              </div>
              <div class="bg-slate-700 p-4 rounded">
                <div class="text-[#1E90FF] font-semibold mb-2">2. Build Questions</div>
                <div class="text-slate-300">Drag & drop question types: Multiple choice, Likert scale, Open-ended</div>
              </div>
              <div class="bg-slate-700 p-4 rounded">
                <div class="text-[#1E90FF] font-semibold mb-2">3. Distribute</div>
                <div class="text-slate-300">Share via email, SMS, QR codes, or embed widgets</div>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4">📊 Real-time Analytics</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div class="text-slate-300 mb-3">Response Rate Tracking</div>
                <div class="bg-slate-700 h-4 rounded-full overflow-hidden">
                  <div class="bg-[#1E90FF] h-full w-3/4 rounded-full"></div>
                </div>
                <div class="text-sm text-slate-400 mt-1">75% completion rate</div>
              </div>
              <div>
                <div class="text-slate-300 mb-3">Sentiment Analysis</div>
                <div class="flex space-x-2">
                  <div class="bg-[#39FF14] h-8 w-8 rounded flex items-center justify-center text-black font-bold">😊</div>
                  <div class="bg-[#1E90FF] h-8 w-6 rounded"></div>
                  <div class="bg-slate-600 h-8 w-4 rounded"></div>
                  <div class="bg-orange-500 h-8 w-3 rounded"></div>
                  <div class="bg-red-500 h-8 w-2 rounded"></div>
                </div>
                <div class="text-sm text-slate-400 mt-1">Mostly positive feedback</div>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4">🔗 Integration Capabilities</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div class="bg-slate-700 p-3 rounded">
                <div class="text-2xl mb-2">📧</div>
                <div class="text-sm text-slate-300">Email Campaigns</div>
              </div>
              <div class="bg-slate-700 p-3 rounded">
                <div class="text-2xl mb-2">💬</div>
                <div class="text-sm text-slate-300">Slack/Teams</div>
              </div>
              <div class="bg-slate-700 p-3 rounded">
                <div class="text-2xl mb-2">🔄</div>
                <div class="text-sm text-slate-300">CRM Systems</div>
              </div>
              <div class="bg-slate-700 p-3 rounded">
                <div class="text-2xl mb-2">📱</div>
                <div class="text-sm text-slate-300">Mobile Apps</div>
              </div>
            </div>
          </div>
          
          <div class="bg-gradient-to-r from-[#1E90FF] to-[#39FF14] rounded-lg p-6 text-center">
            <h3 class="text-xl font-bold text-black mb-2">Ready to Get Started?</h3>
            <p class="text-black mb-4">Join thousands of businesses collecting valuable feedback</p>
            <button 
              class="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              onclick="this.closest('.fixed').style.opacity='0'; setTimeout(() => { this.closest('.fixed').remove(); document.querySelector('[data-signup-btn]').click(); }, 200);"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Smooth fade in
    requestAnimationFrame(() => {
      modal.style.transition = "opacity 0.2s ease-out";
      modal.style.opacity = "1";
    });

    // Close on backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.opacity = "0";
        setTimeout(() => modal.remove(), 200);
      }
    });

    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        modal.style.opacity = "0";
        setTimeout(() => modal.remove(), 200);
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  };

  const showContactModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    modal.style.opacity = "0";
    modal.innerHTML = `
      <div class="bg-slate-900 rounded-lg p-8 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-white">Contact Sales</h2>
          <button class="text-slate-400 hover:text-white text-2xl" onclick="this.closest('.fixed').style.opacity='0'; setTimeout(() => this.closest('.fixed').remove(), 200)">&times;</button>
        </div>
        <div class="space-y-4">
          <div class="text-slate-300 text-center">
            <div class="text-4xl mb-4">📞</div>
            <p class="mb-4">Ready to transform your feedback collection?</p>
            <div class="space-y-2 text-sm">
              <div>📧 sales@feedbackpro.com</div>
              <div>📱 +1 (555) 123-4567</div>
              <div>💬 Live chat available 24/7</div>
            </div>
          </div>
          <div class="bg-slate-800 p-4 rounded-lg">
            <h3 class="font-semibold text-white mb-2">Enterprise Features:</h3>
            <ul class="text-sm text-slate-300 space-y-1">
              <li>• Unlimited surveys & responses</li>
              <li>• Advanced analytics & reporting</li>
              <li>• Custom branding & white-label</li>
              <li>• Priority support & training</li>
              <li>• API access & integrations</li>
            </ul>
          </div>
          <button 
            class="w-full bg-[#1E90FF] hover:bg-[#1E90FF]/80 text-white py-2 rounded-lg font-semibold transition-colors"
            onclick="this.closest('.fixed').style.opacity='0'; setTimeout(() => { this.closest('.fixed').remove(); document.querySelector('[data-signup-btn]').click(); }, 200);"
          >
            Start Free Trial Instead
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Smooth fade in
    requestAnimationFrame(() => {
      modal.style.transition = "opacity 0.2s ease-out";
      modal.style.opacity = "1";
    });

    // Close on backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.opacity = "0";
        setTimeout(() => modal.remove(), 200);
      }
    });

    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        modal.style.opacity = "0";
        setTimeout(() => modal.remove(), 200);
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  };

  return (
    <div className="min-h-screen bg-gradient-cyber text-[#E0E0E0] font-orbitron">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-cyber-blue"></div>
            <h1 className="text-xl font-bold text-cyber-blue text-enhanced">
              FeedbackPro
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onSignIn}
              className="text-slate-400 hover:text-cyber-blue transition-colors"
            >
              Sign In
            </Button>
            <Button
              onClick={onSignUp}
              className="cyber-button text-black font-semibold"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in text-enhanced">
            Collect Client Feedback
            <span className="text-cyber-blue"> Like a Pro</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            A professional feedback collection platform that allows businesses
            to create, distribute, and analyze client surveys with real-time
            analytics and actionable insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={onSignUp}
              className="cyber-button text-black px-8 py-3 text-lg font-semibold"
              data-signup-btn
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 px-8 py-3 text-lg transition-all duration-200"
              onClick={showDemoModal}
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-enhanced">
            Everything You Need to Collect Feedback
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Powerful tools designed to help you understand your clients better
            and make data-driven decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="cyber-card animate-slide-up hover:border-cyber-blue transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-white text-xl">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-slate-900/50 backdrop-blur-sm py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-enhanced">
                Why Choose FeedbackPro?
              </h2>
              <p className="text-xl text-slate-400 mb-8">
                Join thousands of businesses who trust FeedbackPro to collect,
                analyze, and act on customer feedback.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-[#39FF14] flex-shrink-0" />
                    <span className="text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card
                className="cyber-card animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-cyber-blue mb-2">
                    10K+
                  </div>
                  <div className="text-slate-400">Surveys Created</div>
                </CardContent>
              </Card>
              <Card
                className="cyber-card animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-cyber-green mb-2">
                    500K+
                  </div>
                  <div className="text-slate-400">Responses Collected</div>
                </CardContent>
              </Card>
              <Card
                className="cyber-card animate-slide-up"
                style={{ animationDelay: "0.3s" }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-cyber-blue mb-2">
                    99.9%
                  </div>
                  <div className="text-slate-400">Uptime</div>
                </CardContent>
              </Card>
              <Card
                className="cyber-card animate-slide-up"
                style={{ animationDelay: "0.4s" }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-cyber-green mb-2">
                    24/7
                  </div>
                  <div className="text-slate-400">Support</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-enhanced">
            Ready to Transform Your Feedback Collection?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Start collecting valuable insights from your clients today. No
            credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={onSignUp}
              className="cyber-button text-black px-8 py-3 text-lg font-semibold"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 px-8 py-3 text-lg"
              onClick={showContactModal}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-6 w-6 rounded bg-[#1E90FF]"></div>
              <span className="text-white font-semibold">FeedbackPro</span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2024 FeedbackPro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
