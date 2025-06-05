"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PlusCircle,
  Edit,
  BarChart,
  Share2,
  MoreHorizontal,
  FileText,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";

interface SurveyProps {
  id: string;
  title: string;
  description: string;
  status: "active" | "draft" | "completed";
  responseRate: number;
  sentimentScore: number;
  lastUpdated: string;
}

interface SurveyListProps {
  userId?: string;
  onCreateSurvey?: () => void;
}

const SurveyList = ({ userId, onCreateSurvey }: SurveyListProps) => {
  const [surveys, setSurveys] = useState<SurveyProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchSurveys();
    }
  }, [userId]);

  const fetchSurveys = async () => {
    try {
      const { data: surveysData, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      if (surveysData) {
        // Batch fetch all responses for better performance
        const surveyIds = surveysData.map((s) => s.id);
        const { data: allResponses } = await supabase
          .from("survey_responses")
          .select("survey_id, sentiment_score")
          .in("survey_id", surveyIds);

        const surveysWithStats = surveysData.map((survey) => {
          const surveyResponses =
            allResponses?.filter((r) => r.survey_id === survey.id) || [];
          const responseCount = surveyResponses.length;
          const avgSentiment =
            responseCount > 0
              ? surveyResponses.reduce(
                  (sum, r) => sum + (r.sentiment_score || 0),
                  0,
                ) / responseCount
              : 0;

          return {
            id: survey.id,
            title: survey.title,
            description: survey.description || "No description",
            status: survey.status as "active" | "draft" | "completed",
            responseRate: Math.min(responseCount * 10, 100), // Mock calculation
            sentimentScore: Math.round(avgSentiment * 10), // Convert to 0-100 scale
            lastUpdated: new Date(survey.updated_at).toLocaleDateString(),
          };
        });

        setSurveys(surveysWithStats);
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-background p-6 rounded-lg">
        <div className="text-center py-8 text-muted-foreground">
          Loading surveys...
        </div>
      </div>
    );
  }
  return (
    <div className="w-full bg-gradient-cyber p-6 rounded-lg font-orbitron">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-cyber-blue animate-glow-pulse">
            Your Surveys
          </h2>
          <p className="text-muted-foreground">
            Manage and track your feedback collection
          </p>
        </div>
        <Button
          className="cyber-button text-black font-semibold"
          onClick={onCreateSurvey}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Survey
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.length > 0 ? (
          surveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-slate-400 mb-4">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No surveys yet</p>
              <p className="text-sm">Create your first survey to get started</p>
            </div>
            <Button
              className="cyber-button text-black font-semibold"
              onClick={onCreateSurvey}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Survey
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const SurveyCard = ({ survey }: { survey: SurveyProps }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600";
      case "draft":
        return "bg-amber-500 hover:bg-amber-600";
      case "completed":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-lime-400";
    if (score >= 40) return "text-amber-400";
    if (score >= 20) return "text-orange-400";
    return "text-red-400";
  };

  const handleShare = async () => {
    const surveyUrl = `${window.location.origin}/survey/${survey.id}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(surveyUrl);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = surveyUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      // Show success notification
      const notification = document.createElement("div");
      notification.className =
        "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slideIn";
      notification.textContent = "✅ Survey link copied to clipboard!";
      document.body.appendChild(notification);

      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.style.opacity = "0";
          setTimeout(() => notification.remove(), 200);
        }
      }, 3000);
    } catch (err) {
      console.error("Failed to copy: ", err);

      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = surveyUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        const notification = document.createElement("div");
        notification.className =
          "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slideIn";
        notification.textContent = "✅ Survey link copied to clipboard!";
        document.body.appendChild(notification);

        setTimeout(() => {
          if (document.body.contains(notification)) {
            notification.style.opacity = "0";
            setTimeout(() => notification.remove(), 200);
          }
        }, 3000);
      } catch (copyErr) {
        const notification = document.createElement("div");
        notification.className =
          "fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slideIn";
        notification.textContent = "❌ Failed to copy link. Please try again.";
        document.body.appendChild(notification);

        setTimeout(() => {
          if (document.body.contains(notification)) {
            notification.style.opacity = "0";
            setTimeout(() => notification.remove(), 200);
          }
        }, 3000);
      }

      document.body.removeChild(textArea);
    }
  };

  const handleEdit = () => {
    window.location.href = `/surveys?edit=${survey.id}`;
  };

  const handleViewResults = () => {
    window.location.href = `/responses?survey=${survey.id}`;
  };

  return (
    <Card className="cyber-card overflow-hidden animate-slide-up hover:border-cyber-blue transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white text-xl">{survey.title}</CardTitle>
            <CardDescription className="mt-1 text-gray-400">
              {survey.description}
            </CardDescription>
          </div>
          <Badge
            className={`${getStatusColor(survey.status)} text-white capitalize`}
          >
            {survey.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Response Rate</span>
              <span className="text-white">{survey.responseRate}%</span>
            </div>
            <Progress value={survey.responseRate} className="h-2" />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-400 text-sm">Sentiment Score</span>
              <div
                className={`text-lg font-bold ${getSentimentColor(survey.sentimentScore)}`}
              >
                {survey.sentimentScore}/100
              </div>
            </div>
            <div className="text-right">
              <span className="text-gray-400 text-sm">Last Updated</span>
              <div className="text-white text-sm">{survey.lastUpdated}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-[#2F2F2F] pt-4 flex justify-between">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#3A3A3A] bg-[#242424] hover:bg-[#2A2A2A] text-white"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#3A3A3A] bg-[#242424] hover:bg-[#2A2A2A] text-white"
            onClick={handleViewResults}
          >
            <BarChart className="h-4 w-4 mr-1" /> Results
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#3A3A3A] bg-[#242424] hover:bg-[#2A2A2A] text-white"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-[#3A3A3A] bg-[#242424] hover:bg-[#2A2A2A] text-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#1A1A1A] border-[#2F2F2F] text-white"
            >
              <DropdownMenuItem
                className="hover:bg-[#2A2A2A] cursor-pointer"
                onClick={handleShare}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-[#2A2A2A] cursor-pointer"
                onClick={() => window.open(`/survey/${survey.id}`, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview Survey
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#2A2A2A] cursor-pointer">
                Archive (Coming Soon)
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500 hover:bg-[#2A2A2A] hover:text-red-500 cursor-pointer">
                Delete (Coming Soon)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SurveyList;
