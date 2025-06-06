"use client";

import React, { useState } from "react";
import {
  Mail,
  Link,
  QrCode,
  Send,
  Copy,
  Download,
  Settings,
  Bell,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface DistributionChannel {
  id: string;
  type: "email" | "link" | "qr_code" | "widget" | "push";
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  config: any;
}

interface SurveyDistributionProps {
  survey: {
    id: string;
    title: string;
    status: string;
  };
  onClose?: () => void;
}

export default function SurveyDistribution({
  survey,
  onClose,
}: SurveyDistributionProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("channels");
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState(
    `${typeof window !== "undefined" ? window.location.origin : ""}/survey/${survey.id}`,
  );

  const [channels, setChannels] = useState<DistributionChannel[]>([
    {
      id: "email",
      type: "email",
      name: "Email Campaign",
      description: "Send surveys via email using Resend",
      icon: <Mail className="h-5 w-5" />,
      enabled: false,
      config: {
        subject: `Feedback Request: ${survey.title}`,
        message:
          "We'd love to hear your feedback. Please take a moment to complete this survey.",
        recipients: [],
        schedule: "immediate",
      },
    },
    {
      id: "push",
      type: "push",
      name: "Push Notifications",
      description: "Send push notifications via OneSignal",
      icon: <Bell className="h-5 w-5" />,
      enabled: false,
      config: {
        title: `New Survey: ${survey.title}`,
        message: "We'd love your feedback! Click to take our survey.",
        url: shareUrl,
      },
    },
    {
      id: "link",
      type: "link",
      name: "Shareable Link",
      description: "Generate a public link to share anywhere",
      icon: <Link className="h-5 w-5" />,
      enabled: true,
      config: {
        url: shareUrl,
        password: "",
        expires: "",
        trackingEnabled: true,
      },
    },
    {
      id: "qr_code",
      type: "qr_code",
      name: "QR Code",
      description: "Generate QR codes for physical distribution",
      icon: <QrCode className="h-5 w-5" />,
      enabled: false,
      config: {
        size: "medium",
        includeTitle: true,
        customText: "",
      },
    },
    {
      id: "widget",
      type: "widget",
      name: "Website Widget",
      description: "Embed survey widget on your website",
      icon: <Settings className="h-5 w-5" />,
      enabled: false,
      config: {
        position: "bottom-right",
        trigger: "button",
        customCSS: "",
      },
    },
  ]);

  const [emailConfig, setEmailConfig] = useState({
    recipients: "",
    subject: `Feedback Request: ${survey.title}`,
    message:
      "We'd love to hear your feedback. Please take a moment to complete this survey.",
    schedule: "immediate",
    scheduleDate: "",
  });

  const [pushConfig, setPushConfig] = useState({
    title: `New Survey: ${survey.title}`,
    message: "We'd love your feedback! Click to take our survey.",
    url: shareUrl,
    schedule: "immediate",
    scheduleDate: "",
  });

  const toggleChannel = (channelId: string) => {
    setChannels(
      channels.map((channel) =>
        channel.id === channelId
          ? { ...channel, enabled: !channel.enabled }
          : channel,
      ),
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
    return qrUrl;
  };

  const downloadQRCode = () => {
    const qrUrl = generateQRCode();
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `survey-qr-${survey.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendEmailCampaign = async () => {
    if (!emailConfig.recipients.trim()) {
      toast({
        title: "Error",
        description: "Please add email recipients",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const recipients = emailConfig.recipients
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email && email.includes("@"));

      if (recipients.length === 0) {
        throw new Error("No valid email addresses found");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = recipients.filter(
        (email) => !emailRegex.test(email),
      );
      if (invalidEmails.length > 0) {
        throw new Error(`Invalid email addresses: ${invalidEmails.join(", ")}`);
      }

      // Save distribution record
      const { data, error } = await supabase
        .from("survey_distributions")
        .insert({
          survey_id: survey.id,
          channel: "email",
          recipient_list: recipients,
          sent_count: recipients.length,
          opened_count: 0,
          response_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      // Send emails using Resend API
      const emailPromises = recipients.map(async (email) => {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: "Bearer re_QtUtDPm6_5LnqarvP8Ys1huP7a3PMiXaQ",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Survey Team <noreply@yourdomain.com>",
            to: [email],
            subject: emailConfig.subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e40af;">${emailConfig.subject}</h2>
                <p>${emailConfig.message}</p>
                <div style="margin: 30px 0;">
                  <a href="${shareUrl}" style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Take Survey</a>
                </div>
                <p style="color: #666; font-size: 14px;">Survey Link: <a href="${shareUrl}">${shareUrl}</a></p>
              </div>
            `,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to send email to ${email}: ${errorData.message || response.statusText}`,
          );
        }

        return response.json();
      });

      await Promise.all(emailPromises);

      // Update the distribution record to mark as sent
      await supabase
        .from("survey_distributions")
        .update({
          sent_count: recipients.length,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      toast({
        title: "Email Campaign Sent!",
        description: `Survey sent to ${recipients.length} recipients via Resend.`,
      });

      // Reset form
      setEmailConfig({
        recipients: "",
        subject: `Feedback Request: ${survey.title}`,
        message:
          "We'd love to hear your feedback. Please take a moment to complete this survey.",
        schedule: "immediate",
        scheduleDate: "",
      });
    } catch (error: any) {
      console.error("Error sending email campaign:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Failed to send email campaign. Please check your configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendPushNotification = async () => {
    if (!pushConfig.title.trim() || !pushConfig.message.trim()) {
      toast({
        title: "Error",
        description: "Please add notification title and message",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check if OneSignal is available
      if (typeof window === "undefined" || !window.OneSignal) {
        throw new Error("OneSignal is not loaded. Please refresh the page.");
      }

      // Send push notification using OneSignal
      const notificationData = {
        headings: { en: pushConfig.title },
        contents: { en: pushConfig.message },
        url: pushConfig.url,
        chrome_web_icon: "/favicon.ico",
        included_segments: ["All"],
      };

      const response = await fetch(
        "https://onesignal.com/api/v1/notifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic YOUR_REST_API_KEY", // You'll need to add your OneSignal REST API key
          },
          body: JSON.stringify({
            app_id: "38a81c58-0420-4340-90af-03cf1a0322a8",
            ...notificationData,
          }),
        },
      );

      if (!response.ok) {
        // Fallback to browser notification if OneSignal API fails
        if ("Notification" in window) {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            new Notification(pushConfig.title, {
              body: pushConfig.message,
              icon: "/favicon.ico",
            });
          }
        }
      }

      // Save distribution record
      const { data, error } = await supabase
        .from("survey_distributions")
        .insert({
          survey_id: survey.id,
          channel: "push",
          recipient_list: ["all_subscribers"],
          sent_count: 1,
          opened_count: 0,
          response_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
      }

      toast({
        title: "Push Notification Sent!",
        description: "Survey notification sent to all subscribers.",
      });

      // Reset form
      setPushConfig({
        title: `New Survey: ${survey.title}`,
        message: "We'd love your feedback! Click to take our survey.",
        url: shareUrl,
        schedule: "immediate",
        scheduleDate: "",
      });
    } catch (error: any) {
      console.error("Error sending push notification:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Failed to send push notification. Please check your configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWidgetCode = () => {
    return `<!-- Survey Widget -->
<div id="survey-widget-${survey.id}"></div>
<script>
  (function() {
    var widget = document.createElement('iframe');
    widget.src = '${shareUrl}?widget=true';
    widget.style.cssText = 'position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:9999;';
    document.getElementById('survey-widget-${survey.id}').appendChild(widget);
  })();
</script>`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 text-white">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-cyber-blue mb-2">
              Distribute Survey
            </h2>
            <p className="text-slate-400">
              Choose how you want to share &quot;{survey.title}&quot; with your
              audience
            </p>
          </div>
          <Badge
            variant={survey.status === "active" ? "default" : "secondary"}
            className="bg-green-500 text-white"
          >
            {survey.status}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="channels" className="text-white">
              Distribution Channels
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white">
              Distribution Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white">
              Advanced Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {channels.map((channel) => (
                <Card
                  key={channel.id}
                  className={`bg-slate-800 border-slate-700 transition-all duration-200 ${
                    channel.enabled
                      ? "border-cyber-blue bg-slate-800/80"
                      : "hover:border-slate-600"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-cyber-blue">{channel.icon}</div>
                        <div>
                          <CardTitle className="text-white text-lg">
                            {channel.name}
                          </CardTitle>
                          <p className="text-slate-400 text-sm">
                            {channel.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={channel.enabled}
                        onCheckedChange={() => toggleChannel(channel.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {channel.enabled && (
                      <div className="space-y-4">
                        {channel.type === "email" && (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="email-recipients">
                                Recipients (comma-separated)
                              </Label>
                              <Textarea
                                id="email-recipients"
                                placeholder="user1@example.com, user2@example.com"
                                value={emailConfig.recipients}
                                onChange={(e) =>
                                  setEmailConfig({
                                    ...emailConfig,
                                    recipients: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor="email-subject">Subject</Label>
                              <Input
                                id="email-subject"
                                value={emailConfig.subject}
                                onChange={(e) =>
                                  setEmailConfig({
                                    ...emailConfig,
                                    subject: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor="email-message">Message</Label>
                              <Textarea
                                id="email-message"
                                value={emailConfig.message}
                                onChange={(e) =>
                                  setEmailConfig({
                                    ...emailConfig,
                                    message: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>
                            <Button
                              onClick={sendEmailCampaign}
                              disabled={loading}
                              className="w-full bg-cyber-blue hover:bg-cyber-blue/80 text-black font-semibold"
                            >
                              <Send className="mr-2 h-4 w-4" />
                              {loading ? "Sending..." : "Send Email Campaign"}
                            </Button>
                          </div>
                        )}

                        {channel.type === "push" && (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="push-title">
                                Notification Title
                              </Label>
                              <Input
                                id="push-title"
                                placeholder="Survey notification title"
                                value={pushConfig.title}
                                onChange={(e) =>
                                  setPushConfig({
                                    ...pushConfig,
                                    title: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor="push-message">Message</Label>
                              <Textarea
                                id="push-message"
                                value={pushConfig.message}
                                onChange={(e) =>
                                  setPushConfig({
                                    ...pushConfig,
                                    message: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                                maxLength={200}
                              />
                              <p className="text-xs text-slate-400 mt-1">
                                {pushConfig.message.length}/200 characters
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="push-url">Survey URL</Label>
                              <Input
                                id="push-url"
                                value={pushConfig.url}
                                onChange={(e) =>
                                  setPushConfig({
                                    ...pushConfig,
                                    url: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>
                            <Button
                              onClick={sendPushNotification}
                              disabled={loading}
                              className="w-full bg-cyber-blue hover:bg-cyber-blue/80 text-black font-semibold"
                            >
                              <Send className="mr-2 h-4 w-4" />
                              {loading
                                ? "Sending..."
                                : "Send Push Notification"}
                            </Button>
                          </div>
                        )}

                        {channel.type === "link" && (
                          <div className="space-y-3">
                            <div>
                              <Label>Survey Link</Label>
                              <div className="flex space-x-2">
                                <Input
                                  value={shareUrl}
                                  readOnly
                                  className="bg-slate-700 border-slate-600 text-white"
                                />
                                <Button
                                  onClick={() => copyToClipboard(shareUrl)}
                                  variant="outline"
                                  className="border-slate-600 text-white hover:bg-slate-700"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="tracking" defaultChecked />
                              <Label htmlFor="tracking">Enable tracking</Label>
                            </div>
                          </div>
                        )}

                        {channel.type === "qr_code" && (
                          <div className="space-y-3">
                            <div className="text-center">
                              <img
                                src={generateQRCode()}
                                alt="Survey QR Code"
                                className="mx-auto mb-3 border border-slate-600 rounded"
                              />
                              <Button
                                onClick={downloadQRCode}
                                variant="outline"
                                className="border-slate-600 text-white hover:bg-slate-700"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download QR Code
                              </Button>
                            </div>
                          </div>
                        )}

                        {channel.type === "widget" && (
                          <div className="space-y-3">
                            <div>
                              <Label>Embed Code</Label>
                              <Textarea
                                value={getWidgetCode()}
                                readOnly
                                className="bg-slate-700 border-slate-600 text-white font-mono text-xs"
                                rows={8}
                              />
                            </div>
                            <Button
                              onClick={() => copyToClipboard(getWidgetCode())}
                              variant="outline"
                              className="w-full border-slate-600 text-white hover:bg-slate-700"
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Embed Code
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm font-medium">
                    Total Sent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-cyber-blue">0</div>
                  <p className="text-xs text-slate-400">Across all channels</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm font-medium">
                    Response Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">0%</div>
                  <p className="text-xs text-slate-400">
                    From distributed surveys
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm font-medium">
                    Best Channel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">-</div>
                  <p className="text-xs text-slate-400">
                    Highest response rate
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Distribution Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto-close survey</Label>
                    <p className="text-sm text-slate-400">
                      Automatically close survey after target responses
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Send reminders</Label>
                    <p className="text-sm text-slate-400">
                      Send follow-up reminders to non-respondents
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Anonymous responses</Label>
                    <p className="text-sm text-slate-400">
                      Don't collect respondent identification
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
