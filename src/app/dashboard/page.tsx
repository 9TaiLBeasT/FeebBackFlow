"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import SurveyList from "@/components/dashboard/SurveyList";
import AnalyticsSummary from "@/components/dashboard/AnalyticsSummary";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    avgSentiment: 0,
  });
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
      await fetchStats(user.id);
      setLoading(false);
    };

    getUser();
  }, [router]);

  const fetchStats = async (userId: string) => {
    try {
      // Fetch surveys count
      const { count: surveysCount } = await supabase
        .from("surveys")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Fetch total responses
      const { data: surveys } = await supabase
        .from("surveys")
        .select("id")
        .eq("user_id", userId);

      let totalResponses = 0;
      let totalSentiment = 0;
      let sentimentCount = 0;

      if (surveys && surveys.length > 0) {
        const surveyIds = surveys.map((s) => s.id);
        const { data: responses } = await supabase
          .from("survey_responses")
          .select("sentiment_score")
          .in("survey_id", surveyIds);

        if (responses) {
          totalResponses = responses.length;
          responses.forEach((r) => {
            if (r.sentiment_score) {
              totalSentiment += r.sentiment_score;
              sentimentCount++;
            }
          });
        }
      }

      setStats({
        totalSurveys: surveysCount || 0,
        totalResponses,
        avgSentiment: sentimentCount > 0 ? totalSentiment / sentimentCount : 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#121212] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-[#1E90FF]"></div>
          <div className="text-white text-lg">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#121212] text-[#E0E0E0]">
      {/* Sidebar */}
      <DashboardSidebar user={user} onSignOut={handleSignOut} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-9 bg-slate-800 rounded-md pl-8 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#1E90FF]"
            />
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-slate-800 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                // Create notification modal
                const modal = document.createElement("div");
                modal.className =
                  "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
                modal.innerHTML = `
                  <div class="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700">
                    <div class="flex justify-between items-center mb-4">
                      <h3 class="text-lg font-semibold text-white flex items-center">
                        <span class="text-2xl mr-2">🔔</span>
                        Notifications
                      </h3>
                      <button class="text-slate-400 hover:text-white text-xl" onclick="this.closest('.fixed').remove()">&times;</button>
                    </div>
                    <div class="space-y-3">
                      <div class="bg-slate-700 p-3 rounded-lg">
                        <div class="flex items-start space-x-3">
                          <div class="text-green-400 text-lg">✅</div>
                          <div>
                            <p class="text-white font-medium">New Survey Response</p>
                            <p class="text-slate-300 text-sm">Customer Satisfaction Survey received a positive response</p>
                            <p class="text-slate-400 text-xs mt-1">2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div class="bg-slate-700 p-3 rounded-lg">
                        <div class="flex items-start space-x-3">
                          <div class="text-blue-400 text-lg">📊</div>
                          <div>
                            <p class="text-white font-medium">Analytics Update</p>
                            <p class="text-slate-300 text-sm">Weekly analytics report is ready</p>
                            <p class="text-slate-400 text-xs mt-1">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                      <div class="bg-slate-700 p-3 rounded-lg">
                        <div class="flex items-start space-x-3">
                          <div class="text-yellow-400 text-lg">⚡</div>
                          <div>
                            <p class="text-white font-medium">Integration Alert</p>
                            <p class="text-slate-300 text-sm">Slack integration successfully connected</p>
                            <p class="text-slate-400 text-xs mt-1">3 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="mt-4 text-center">
                      <button 
                        class="text-[#1E90FF] hover:text-[#1E90FF]/80 text-sm font-medium"
                        onclick="this.closest('.fixed').remove()"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                `;
                document.body.appendChild(modal);

                // Close on backdrop click
                modal.addEventListener("click", (e) => {
                  if (e.target === modal) modal.remove();
                });

                // Auto-remove after 10 seconds
                setTimeout(() => {
                  if (document.body.contains(modal)) {
                    modal.remove();
                  }
                }, 10000);
              }}
            >
              <Bell className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#39FF14] animate-pulse"></span>
            </Button>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-slate-400">Premium Plan</p>
              </div>
              <Avatar>
                <AvatarImage
                  src={
                    user?.user_metadata?.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                  }
                  alt="User"
                />
                <AvatarFallback>
                  {user?.user_metadata?.full_name?.[0] ||
                    user?.email?.[0] ||
                    "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">
              Welcome back! Here's an overview of your feedback collection.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Total Surveys
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.totalSurveys}
                </div>
                <p className="text-xs text-[#39FF14] mt-1">
                  {stats.totalSurveys > 0 ? "Active" : "Get started"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Total Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.totalResponses.toLocaleString()}
                </div>
                <p className="text-xs text-[#39FF14] mt-1">
                  {stats.totalResponses > 0
                    ? "Collecting data"
                    : "No responses yet"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Avg. Sentiment Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.avgSentiment.toFixed(1)}/5
                </div>
                <p className="text-xs text-[#39FF14] mt-1">
                  {stats.avgSentiment > 0 ? "Good feedback" : "No data yet"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Summary */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Analytics Overview
              </h2>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
                onClick={() => router.push("/analytics")}
              >
                View Full Analytics
              </Button>
            </div>
            <AnalyticsSummary
              totalResponses={stats.totalResponses}
              averageSentiment={stats.avgSentiment}
              completionRate={
                stats.totalResponses > 0
                  ? Math.round(
                      (stats.totalResponses / (stats.totalSurveys * 10)) * 100,
                    )
                  : 0
              }
            />
          </div>

          {/* Survey List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recent Surveys</h2>
              <Button
                className="bg-[#1E90FF] hover:bg-[#1E90FF]/80 text-white"
                onClick={() => router.push("/surveys")}
              >
                Create New Survey
              </Button>
            </div>
            <SurveyList
              userId={user?.id}
              onCreateSurvey={() => router.push("/surveys")}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
