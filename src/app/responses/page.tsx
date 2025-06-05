"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  MessageSquare,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface SurveyResponse {
  id: string;
  survey_id: string;
  respondent_email: string;
  respondent_name: string;
  responses: any;
  sentiment_score: number;
  completion_rate: number;
  submitted_at: string;
  survey_title: string;
}

interface Survey {
  id: string;
  title: string;
}

export default function ResponsesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState<string>("all");
  const [selectedResponse, setSelectedResponse] =
    useState<SurveyResponse | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyParam = searchParams.get("survey");

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
      await fetchResponses(user.id);
      setLoading(false);
    };

    getUser();
  }, [router]);

  useEffect(() => {
    if (surveyParam) {
      setSelectedSurvey(surveyParam);
    }
  }, [surveyParam]);

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

  const fetchResponses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(
          `
          *,
          surveys!inner(title, user_id)
        `,
        )
        .eq("surveys.user_id", userId)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      const formattedResponses =
        data?.map((response) => ({
          ...response,
          survey_title: response.surveys.title,
        })) || [];

      setResponses(formattedResponses);
    } catch (error) {
      console.error("Error fetching responses:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const exportResponses = async () => {
    const filteredResponses = getFilteredResponses();
    const csvContent = generateCSV(filteredResponses);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `survey-responses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (responses: SurveyResponse[]) => {
    if (responses.length === 0) return "";

    const headers = [
      "Survey",
      "Respondent Email",
      "Respondent Name",
      "Sentiment Score",
      "Completion Rate",
      "Submitted At",
      "Responses",
    ];

    const rows = responses.map((response) => [
      response.survey_title,
      response.respondent_email || "",
      response.respondent_name || "",
      response.sentiment_score || "",
      response.completion_rate || "",
      new Date(response.submitted_at).toLocaleString(),
      JSON.stringify(response.responses),
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const getFilteredResponses = () => {
    return responses.filter((response) => {
      const matchesSearch =
        response.respondent_email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        response.respondent_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        response.survey_title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSurvey =
        selectedSurvey === "all" || response.survey_id === selectedSurvey;
      return matchesSearch && matchesSurvey;
    });
  };

  const getSentimentColor = (score: number) => {
    if (score >= 4) return "text-green-400";
    if (score >= 3) return "text-lime-400";
    if (score >= 2) return "text-amber-400";
    if (score >= 1) return "text-orange-400";
    return "text-red-400";
  };

  const getSentimentIcon = (score: number) => {
    if (score >= 3) return <TrendingUp className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-cyber items-center justify-center font-orbitron">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-cyber-blue"></div>
          <div className="text-white text-lg font-orbitron">
            Loading Responses...
          </div>
        </div>
      </div>
    );
  }

  const filteredResponses = getFilteredResponses();

  return (
    <div className="flex h-screen bg-gradient-cyber text-[#E0E0E0] font-orbitron">
      <DashboardSidebar user={user} onSignOut={handleSignOut} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-cyber-blue text-enhanced">
              Responses
            </h1>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
              {filteredResponses.length} responses
            </Badge>
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
          {/* Filters and Search */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search responses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
                <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Filter by survey" />
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
            </div>
            <Button
              onClick={exportResponses}
              className="cyber-button text-black font-semibold"
              disabled={filteredResponses.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Responses List */}
          {filteredResponses.length > 0 ? (
            <div className="space-y-4">
              {filteredResponses.map((response) => (
                <Card
                  key={response.id}
                  className="cyber-card hover:border-cyber-blue transition-all duration-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-1">
                          {response.survey_title}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {response.respondent_name ||
                              response.respondent_email ||
                              "Anonymous"}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(
                              response.submitted_at,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {response.sentiment_score && (
                          <div
                            className={`flex items-center space-x-1 ${getSentimentColor(response.sentiment_score)}`}
                          >
                            {getSentimentIcon(response.sentiment_score)}
                            <span className="text-sm font-medium">
                              {response.sentiment_score.toFixed(1)}
                            </span>
                          </div>
                        )}
                        <Badge
                          variant="secondary"
                          className="bg-slate-700 text-slate-300"
                        >
                          {response.completion_rate}% complete
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Response Preview */}
                      <div className="bg-slate-900 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-white flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Response Summary
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedResponse(response)}
                            className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                        <div className="text-sm text-slate-400">
                          {Object.keys(response.responses || {}).length}{" "}
                          questions answered
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-white mb-2">
                {searchTerm || selectedSurvey !== "all"
                  ? "No responses found"
                  : "No responses yet"}
              </h3>
              <p className="text-slate-400">
                {searchTerm || selectedSurvey !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Responses will appear here once people start submitting your surveys"}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Response Details</h3>
              <Button
                variant="ghost"
                onClick={() => setSelectedResponse(null)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-1">
                  Survey
                </h4>
                <p className="text-white">{selectedResponse.survey_title}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-1">
                  Respondent
                </h4>
                <p className="text-white">
                  {selectedResponse.respondent_name ||
                    selectedResponse.respondent_email ||
                    "Anonymous"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-1">
                  Submitted
                </h4>
                <p className="text-white">
                  {new Date(selectedResponse.submitted_at).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">
                  Responses
                </h4>
                <div className="bg-slate-900 rounded-lg p-4">
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                    {JSON.stringify(selectedResponse.responses, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
