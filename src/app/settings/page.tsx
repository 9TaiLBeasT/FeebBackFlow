"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  company: string;
  bio: string;
  avatar_url: string;
  timezone: string;
  language: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  survey_responses: boolean;
  weekly_reports: boolean;
  marketing_emails: boolean;
  security_alerts: boolean;
}

interface PrivacySettings {
  profile_visibility: string;
  data_sharing: boolean;
  analytics_tracking: boolean;
}

export default function SettingsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    full_name: "",
    email: "",
    company: "",
    bio: "",
    avatar_url: "",
    timezone: "UTC",
    language: "en",
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    survey_responses: true,
    weekly_reports: false,
    marketing_emails: false,
    security_alerts: true,
  });
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profile_visibility: "private",
    data_sharing: false,
    analytics_tracking: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey] = useState(
    "fp_sk_" + Math.random().toString(36).substring(2, 15),
  );
  const router = useRouter();

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
      setProfile({
        id: user.id,
        full_name: user.user_metadata?.full_name || "",
        email: user.email || "",
        company: user.user_metadata?.company || "",
        bio: user.user_metadata?.bio || "",
        avatar_url: user.user_metadata?.avatar_url || "",
        timezone: user.user_metadata?.timezone || "UTC",
        language: user.user_metadata?.language || "en",
      });
      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          company: profile.company,
          bio: profile.bio,
          timezone: profile.timezone,
          language: profile.language,
        },
      });

      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    alert("API key copied to clipboard!");
  };

  const regenerateApiKey = () => {
    if (
      confirm(
        "Are you sure you want to regenerate your API key? This will invalidate the current key.",
      )
    ) {
      alert("API key regenerated successfully!");
    }
  };

  const exportData = () => {
    const data = {
      profile,
      notifications,
      privacy,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedbackpro-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      if (
        confirm(
          "This will permanently delete all your surveys, responses, and data. Type 'DELETE' to confirm.",
        )
      ) {
        alert(
          "Account deletion initiated. You will receive an email confirmation.",
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-cyber items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-cyber-blue"></div>
          <div className="text-white text-lg font-orbitron">
            Loading Settings...
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
              Settings
            </h1>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
              Account Management
            </Badge>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Settings */}
            <Card className="cyber-card animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyber-blue">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20 border-2 border-cyber-blue">
                    <AvatarImage
                      src={
                        profile.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`
                      }
                      alt={profile.full_name}
                    />
                    <AvatarFallback className="bg-slate-700 text-white text-xl">
                      {profile.full_name?.[0] || profile.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Button
                      variant="outline"
                      className="border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-black"
                    >
                      Change Avatar
                    </Button>
                    <p className="text-sm text-slate-400 mt-2">
                      Upload a new profile picture (max 2MB)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      value={profile.full_name}
                      onChange={(e) =>
                        setProfile({ ...profile, full_name: e.target.value })
                      }
                      className="bg-slate-800 border-slate-700 text-white focus:border-cyber-blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="bg-slate-800 border-slate-700 text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-white">
                      Company
                    </Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) =>
                        setProfile({ ...profile, company: e.target.value })
                      }
                      className="bg-slate-800 border-slate-700 text-white focus:border-cyber-blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-white">
                      Timezone
                    </Label>
                    <Input
                      id="timezone"
                      value={profile.timezone}
                      onChange={(e) =>
                        setProfile({ ...profile, timezone: e.target.value })
                      }
                      className="bg-slate-800 border-slate-700 text-white focus:border-cyber-blue"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself..."
                    className="bg-slate-800 border-slate-700 text-white focus:border-cyber-blue min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="cyber-button text-black font-semibold"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card
              className="cyber-card animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyber-purple">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="text-white capitalize">
                        {key.replace(/_/g, " ")}
                      </Label>
                      <p className="text-sm text-slate-400">
                        {key === "email_notifications" &&
                          "Receive email notifications for important updates"}
                        {key === "survey_responses" &&
                          "Get notified when someone responds to your surveys"}
                        {key === "weekly_reports" &&
                          "Receive weekly analytics reports"}
                        {key === "marketing_emails" &&
                          "Receive product updates and tips"}
                        {key === "security_alerts" &&
                          "Get alerts for security-related activities"}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [key]: checked })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* API Settings */}
            <Card
              className="cyber-card animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyber-green">
                  <Globe className="h-5 w-5" />
                  API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white">API Key</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={
                        showApiKey ? apiKey : "••••••••••••••••••••••••••••••••"
                      }
                      readOnly
                      className="bg-slate-800 border-slate-700 text-white font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="border-slate-700 text-slate-400 hover:text-white"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={copyApiKey}
                      className="border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-black"
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-slate-400">
                    Use this API key to integrate FeedbackPro with your
                    applications
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={regenerateApiKey}
                  className="border-cyber-orange text-cyber-orange hover:bg-cyber-orange hover:text-black"
                >
                  Regenerate API Key
                </Button>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card
              className="cyber-card animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyber-pink">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="text-white capitalize">
                        {key.replace(/_/g, " ")}
                      </Label>
                      <p className="text-sm text-slate-400">
                        {key === "profile_visibility" &&
                          "Control who can see your profile information"}
                        {key === "data_sharing" &&
                          "Allow anonymous data sharing for product improvement"}
                        {key === "analytics_tracking" &&
                          "Enable usage analytics to help improve the platform"}
                      </p>
                    </div>
                    <Switch
                      checked={
                        typeof value === "boolean" ? value : value === "public"
                      }
                      onCheckedChange={(checked) =>
                        setPrivacy({
                          ...privacy,
                          [key]:
                            typeof value === "boolean"
                              ? checked
                              : checked
                                ? "public"
                                : "private",
                        })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Billing */}
            <Card
              className="cyber-card animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyber-orange">
                  <CreditCard className="h-5 w-5" />
                  Billing & Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-cyber-orange/30">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Premium Plan
                    </h3>
                    <p className="text-slate-400">
                      Unlimited surveys and responses
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyber-orange">
                      $29/mo
                    </p>
                    <p className="text-sm text-slate-400">
                      Next billing: Jan 15, 2024
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    className="border-cyber-orange text-cyber-orange hover:bg-cyber-orange hover:text-black"
                  >
                    Manage Subscription
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-700 text-slate-400 hover:text-white"
                  >
                    View Invoices
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card
              className="cyber-card animate-slide-up"
              style={{ animationDelay: "0.5s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Download className="h-5 w-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Export Your Data</h3>
                    <p className="text-sm text-slate-400">
                      Download all your surveys, responses, and account data
                    </p>
                  </div>
                  <Button
                    onClick={exportData}
                    variant="outline"
                    className="border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-black"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <Separator className="bg-slate-700" />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-red-400 font-medium">Delete Account</h3>
                    <p className="text-sm text-slate-400">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button
                    onClick={deleteAccount}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
