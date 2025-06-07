"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from "lucide-react";

interface AnalyticsSummaryProps {
  totalResponses?: number;
  averageSentiment?: number;
  completionRate?: number;
  responseTrend?: { date: string; count: number }[];
  sentimentDistribution?: { label: string; value: number; color: string }[];
}

const AnalyticsSummary = ({
  totalResponses = 0,
  averageSentiment = 0,
  completionRate = 0,
  responseTrend = [],
  sentimentDistribution = [],
}: AnalyticsSummaryProps) => {
  // Default data when no real data is available
  const defaultResponseTrend = [
    { date: "Mon", count: 0 },
    { date: "Tue", count: 0 },
    { date: "Wed", count: 0 },
    { date: "Thu", count: 0 },
    { date: "Fri", count: 0 },
    { date: "Sat", count: 0 },
    { date: "Sun", count: 0 },
  ];

  const defaultSentimentDistribution = [
    { label: "Very Positive", value: 0, color: "#39FF14" },
    { label: "Positive", value: 0, color: "#1E90FF" },
    { label: "Neutral", value: 0, color: "#2F4F4F" },
    { label: "Negative", value: 0, color: "#FF6347" },
    { label: "Very Negative", value: 0, color: "#DC143C" },
  ];

  const displayResponseTrend =
    responseTrend.length > 0 ? responseTrend : defaultResponseTrend;
  const displaySentimentDistribution =
    sentimentDistribution.length > 0
      ? sentimentDistribution
      : defaultSentimentDistribution;
  return (
    <div className="w-full bg-gradient-cyber text-[#E0E0E0] p-6 rounded-xl font-orbitron">
      <h2 className="text-2xl font-bold mb-6 text-cyber-blue text-enhanced">
        Analytics Summary
      </h2>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="cyber-card animate-slide-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-cyber-blue flex items-center">
              <BarChart className="h-4 w-4 mr-2" />
              Total Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {totalResponses.toLocaleString()}
            </div>
            <p className="text-xs text-[#A0A0A0] mt-1">
              {totalResponses > 0 ? "Responses collected" : "No responses yet"}
            </p>
          </CardContent>
        </Card>

        <Card
          className="cyber-card animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-cyber-purple flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Average Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {averageSentiment} <span className="text-sm">/ 5</span>
            </div>
            <p className="text-xs text-[#A0A0A0] mt-1">
              {averageSentiment > 0
                ? "Average feedback score"
                : "No sentiment data"}
            </p>
          </CardContent>
        </Card>

        <Card
          className="cyber-card animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-cyber-green flex items-center">
              <LineChart className="h-4 w-4 mr-2" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {completionRate}%
            </div>
            <p className="text-xs text-[#A0A0A0] mt-1">
              {completionRate > 0
                ? "Survey completion rate"
                : "No completion data"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Trend Chart */}
        <Card
          className="cyber-card animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <CardHeader>
            <CardTitle className="text-cyber-blue">Response Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end justify-between space-x-2">
              {displayResponseTrend.map((day, index) => {
                const maxCount = Math.max(
                  ...displayResponseTrend.map((d) => d.count),
                  1,
                );
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="bg-cyber-blue w-10 rounded-t-sm min-h-[2px]"
                      style={{
                        height: `${Math.max((day.count / maxCount) * 150, 2)}px`,
                      }}
                    ></div>
                    <span className="text-xs mt-2">{day.date}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Distribution Chart */}
        <Card
          className="cyber-card animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <CardHeader>
            <CardTitle className="text-cyber-purple">
              Sentiment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              {displaySentimentDistribution.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-32 text-sm">{item.label}</div>
                  <div className="flex-1 h-4 bg-[#2A2A2A] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                      }}
                    ></div>
                  </div>
                  <div className="w-10 text-right text-sm ml-2">
                    {item.value}%
                  </div>
                </div>
              ))}
              {totalResponses === 0 && (
                <div className="text-center py-4 text-slate-400">
                  No sentiment data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSummary;
