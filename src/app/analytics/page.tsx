"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AnalyticsSummary from "@/components/dashboard/AnalyticsSummary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  Target,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AnalyticsData {
  totalSurveys: number;
  totalResponses: number;
  averageSentiment: number;
  completionRate: number;
  responseTrend: { date: string; count: number }[];
  sentimentDistribution: { label: string; value: number; color: string }[];
  topPerformingSurveys: {
    title: string;
    responses: number;
    sentiment: number;
  }[];
  responsesByChannel: { channel: string; count: number }[];
}

interface Survey {
  id: string;
  title: string;
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalSurveys: 0,
    totalResponses: 0,
    averageSentiment: 0,
    completionRate: 0,
    responseTrend: [],
    sentimentDistribution: [],
    topPerformingSurveys: [],
    responsesByChannel: [],
  });
  const [loading, setLoading] = useState(true);
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
      await fetchSurveys(user.id);
      await fetchAnalytics(user.id);
      setLoading(false);
    };

    getUser();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchAnalytics(user.id);
    }
  }, [selectedSurvey, timeRange, user]);

  const fetchSurveys = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("id, title")
        .eq("user_id", userId)
        .order("title");

      if (error) throw error;
      setSurveys(data || []);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    }
  };

  const fetchAnalytics = async (userId: string) => {
    try {
      // Get date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch surveys
      let surveysQuery = supabase
        .from("surveys")
        .select("*")
        .eq("user_id", userId);

      if (selectedSurvey !== "all") {
        surveysQuery = surveysQuery.eq("id", selectedSurvey);
      }

      const { data: surveysData } = await surveysQuery;
      const surveyIds = surveysData?.map((s) => s.id) || [];

      if (surveyIds.length === 0) {
        setAnalyticsData({
          totalSurveys: 0,
          totalResponses: 0,
          averageSentiment: 0,
          completionRate: 0,
          responseTrend: [],
          sentimentDistribution: [],
          topPerformingSurveys: [],
          responsesByChannel: [],
        });
        return;
      }

      // Fetch responses
      const { data: responsesData } = await supabase
        .from("survey_responses")
        .select("*")
        .in("survey_id", surveyIds)
        .gte("submitted_at", startDate.toISOString())
        .lte("submitted_at", endDate.toISOString());

      // Calculate analytics
      const totalResponses = responsesData?.length || 0;
      const totalSurveys = surveysData?.length || 0;

      // Average sentiment
      const sentimentScores =
        responsesData?.filter((r) => r.sentiment_score) || [];
      const averageSentiment =
        sentimentScores.length > 0
          ? sentimentScores.reduce((sum, r) => sum + r.sentiment_score, 0) /
            sentimentScores.length
          : 0;

      // Completion rate
      const completionRates =
        responsesData?.filter((r) => r.completion_rate) || [];
      const completionRate =
        completionRates.length > 0
          ? completionRates.reduce((sum, r) => sum + r.completion_rate, 0) /
            completionRates.length
          : 0;

      // Response trend (last 7 days)
      const responseTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayResponses =
          responsesData?.filter(
            (r) =>
              new Date(r.submitted_at) >= dayStart &&
              new Date(r.submitted_at) <= dayEnd,
          ) || [];

        responseTrend.push({
          date: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
          count: dayResponses.length,
        });
      }

      // Sentiment distribution
      const sentimentDistribution = [
        { label: "Very Positive", value: 0, color: "#39FF14" },
        { label: "Positive", value: 0, color: "#1E90FF" },
        { label: "Neutral", value: 0, color: "#2F4F4F" },
        { label: "Negative", value: 0, color: "#FF6347" },
        { label: "Very Negative", value: 0, color: "#DC143C" },
      ];

      sentimentScores.forEach((response) => {
        const score = response.sentiment_score;
        if (score >= 4.5) sentimentDistribution[0].value++;
        else if (score >= 3.5) sentimentDistribution[1].value++;
        else if (score >= 2.5) sentimentDistribution[2].value++;
        else if (score >= 1.5) sentimentDistribution[3].value++;
        else sentimentDistribution[4].value++;
      });

      // Convert to percentages
      const totalSentimentResponses = sentimentScores.length;
      if (totalSentimentResponses > 0) {
        sentimentDistribution.forEach((item) => {
          item.value = Math.round((item.value / totalSentimentResponses) * 100);
        });
      }

      // Top performing surveys
      const surveyStats =
        surveysData?.map((survey) => {
          const surveyResponses =
            responsesData?.filter((r) => r.survey_id === survey.id) || [];
          const surveySentiment = surveyResponses.filter(
            (r) => r.sentiment_score,
          );
          const avgSentiment =
            surveySentiment.length > 0
              ? surveySentiment.reduce((sum, r) => sum + r.sentiment_score, 0) /
                surveySentiment.length
              : 0;

          return {
            title: survey.title,
            responses: surveyResponses.length,
            sentiment: avgSentiment,
          };
        }) || [];

      const topPerformingSurveys = surveyStats
        .sort((a, b) => b.responses - a.responses)
        .slice(0, 5);

      // Mock response by channel data (would need to be tracked in real implementation)
      const responsesByChannel = [
        { channel: "Email", count: Math.floor(totalResponses * 0.4) },
        { channel: "Direct Link", count: Math.floor(totalResponses * 0.3) },
        { channel: "Social Media", count: Math.floor(totalResponses * 0.2) },
        { channel: "QR Code", count: Math.floor(totalResponses * 0.1) },
      ];

      setAnalyticsData({
        totalSurveys,
        totalResponses,
        averageSentiment,
        completionRate,
        responseTrend,
        sentimentDistribution,
        topPerformingSurveys,
        responsesByChannel,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-cyber items-center justify-center font-orbitron">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-cyber-blue"></div>
          <div className="text-white text-lg font-orbitron">
            Loading Analytics...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-cyber text-[#E0E0E0] font-orbitron">
      <DashboardSidebar user={user} onSignOut={handleSignOut} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-cyber-blue text-enhanced">
              Analytics
            </h1>
          </div>

          <div className="flex items-center space-x-4">
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

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
                <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select survey" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="all"
                    className="text-white hover:bg-slate-700"
                  >
                    All Surveys
                  </SelectItem>
                  {surveys.map((survey) => (
                    <SelectItem
                      key={survey.id}
                      value={survey.id}
                      className="text-white hover:bg-slate-700"
                    >
                      {survey.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="7d"
                    className="text-white hover:bg-slate-700"
                  >
                    7 days
                  </SelectItem>
                  <SelectItem
                    value="30d"
                    className="text-white hover:bg-slate-700"
                  >
                    30 days
                  </SelectItem>
                  <SelectItem
                    value="90d"
                    className="text-white hover:bg-slate-700"
                  >
                    90 days
                  </SelectItem>
                  <SelectItem
                    value="1y"
                    className="text-white hover:bg-slate-700"
                  >
                    1 year
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="cyber-card animate-slide-up">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-cyber-blue flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Total Surveys
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {analyticsData.totalSurveys}
                </div>
              </CardContent>
            </Card>

            <Card
              className="cyber-card animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-cyber-purple flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Total Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {analyticsData.totalResponses.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card
              className="cyber-card animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-cyber-green flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Avg. Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {analyticsData.averageSentiment.toFixed(1)}
                  <span className="text-sm text-slate-400 ml-1">/ 5</span>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cyber-card animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-cyber-orange flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {Math.round(analyticsData.completionRate)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Summary */}
          <div className="mb-8">
            <AnalyticsSummary
              totalResponses={analyticsData.totalResponses}
              averageSentiment={analyticsData.averageSentiment}
              completionRate={analyticsData.completionRate}
              responseTrend={analyticsData.responseTrend}
              sentimentDistribution={analyticsData.sentimentDistribution}
            />
          </div>

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Surveys */}
            <Card
              className="cyber-card animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <CardHeader>
                <CardTitle className="text-cyber-blue">
                  Top Performing Surveys
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topPerformingSurveys.map((survey, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{survey.title}</p>
                        <p className="text-sm text-slate-400">
                          {survey.responses} responses
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {survey.sentiment.toFixed(1)}
                        </p>
                        <p className="text-xs text-slate-400">sentiment</p>
                      </div>
                    </div>
                  ))}
                  {analyticsData.topPerformingSurveys.length === 0 && (
                    <p className="text-slate-400 text-center py-4">
                      No survey data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Response Channels */}
            <Card
              className="cyber-card animate-slide-up"
              style={{ animationDelay: "0.5s" }}
            >
              <CardHeader>
                <CardTitle className="text-cyber-purple">
                  Response Channels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.responsesByChannel.map((channel, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {channel.channel}
                        </p>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                          <div
                            className="bg-[#1E90FF] h-2 rounded-full"
                            style={{
                              width: `${(channel.count / analyticsData.totalResponses) * 100}%`,
                            }}
                            className="bg-cyber-blue"
                          ></div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-white font-medium">
                          {channel.count}
                        </p>
                        <p className="text-xs text-slate-400">
                          {Math.round(
                            (channel.count / analyticsData.totalResponses) *
                              100,
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  ))}
                  {analyticsData.responsesByChannel.length === 0 && (
                    <p className="text-slate-400 text-center py-4">
                      No channel data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
