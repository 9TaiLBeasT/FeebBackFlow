"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import SurveyBuilder from "@/components/surveys/SurveyBuilder";
import SurveyDistribution from "@/components/surveys/SurveyDistribution";
import {
  PlusCircle,
  Search,
  Filter,
  Edit,
  BarChart,
  Share2,
  MoreHorizontal,
  FileText,
  Play,
  Pause,
  Copy,
  Trash2,
  Send,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface Survey {
  id: string;
  title: string;
  description: string;
  status: "draft" | "active" | "completed" | "paused";
  questions: any[];
  created_at: string;
  updated_at: string;
  response_count: number;
  completion_rate: number;
}

export default function SurveysPage() {
  const [user, setUser] = useState<User | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showBuilder, setShowBuilder] = useState(false);
  const [showDistribution, setShowDistribution] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
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
      setLoading(false);
    };

    getUser();
  }, [router]);

  const fetchSurveys = async (userId: string) => {
    try {
      const { data: surveysData, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      if (surveysData) {
        // Batch fetch all responses at once for better performance
        const surveyIds = surveysData.map((s) => s.id);
        const { data: allResponses } = await supabase
          .from("survey_responses")
          .select("survey_id, completion_rate")
          .in("survey_id", surveyIds);

        const surveysWithStats = surveysData.map((survey) => {
          const surveyResponses =
            allResponses?.filter((r) => r.survey_id === survey.id) || [];
          const responseCount = surveyResponses.length;
          const avgCompletion =
            responseCount > 0
              ? surveyResponses.reduce(
                  (sum, r) => sum + (r.completion_rate || 0),
                  0,
                ) / responseCount
              : 0;

          return {
            ...survey,
            response_count: responseCount,
            completion_rate: Math.round(avgCompletion),
          };
        });

        setSurveys(surveysWithStats);
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const createNewSurvey = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("surveys")
        .insert({
          user_id: user.id,
          title: "New Survey",
          description: "Survey description",
          status: "draft",
          questions: [],
          settings: {},
        })
        .select()
        .single();

      if (error) throw error;

      setSelectedSurvey(data);
      setShowBuilder(true);
      await fetchSurveys(user.id);
    } catch (error) {
      console.error("Error creating survey:", error);
    }
  };

  const updateSurveyStatus = async (surveyId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("surveys")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", surveyId);

      if (error) throw error;

      if (user) {
        await fetchSurveys(user.id);
      }
    } catch (error) {
      console.error("Error updating survey status:", error);
    }
  };

  const duplicateSurvey = async (survey: Survey) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("surveys").insert({
        user_id: user.id,
        title: `${survey.title} (Copy)`,
        description: survey.description,
        status: "draft",
        questions: survey.questions,
        settings: {},
      });

      if (error) throw error;

      await fetchSurveys(user.id);
    } catch (error) {
      console.error("Error duplicating survey:", error);
    }
  };

  const deleteSurvey = async (surveyId: string) => {
    try {
      const { error } = await supabase
        .from("surveys")
        .delete()
        .eq("id", surveyId);

      if (error) throw error;

      if (user) {
        await fetchSurveys(user.id);
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
    }
  };

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch = survey.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || survey.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "draft":
        return "bg-amber-500";
      case "completed":
        return "bg-blue-500";
      case "paused":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#121212] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-[#1E90FF]"></div>
          <div className="text-white text-lg">Loading Surveys...</div>
        </div>
      </div>
    );
  }

  if (showBuilder) {
    return (
      <div className="flex h-screen bg-[#121212]">
        <DashboardSidebar user={user} onSignOut={handleSignOut} />
        <div className="flex-1">
          <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6">
            <h1 className="text-xl font-bold text-white">
              {selectedSurvey ? "Edit Survey" : "Create Survey"}
            </h1>
            <Button
              variant="outline"
              onClick={() => {
                setShowBuilder(false);
                setSelectedSurvey(null);
              }}
              className="border-slate-700 text-slate-400 hover:text-white"
            >
              Back to Surveys
            </Button>
          </div>
          <SurveyBuilder
            survey={selectedSurvey}
            onSave={() => {
              setShowBuilder(false);
              setSelectedSurvey(null);
              if (user) fetchSurveys(user.id);
            }}
          />
        </div>
      </div>
    );
  }

  if (showDistribution && selectedSurvey) {
    return (
      <div className="flex h-screen bg-[#121212]">
        <DashboardSidebar user={user} onSignOut={handleSignOut} />
        <div className="flex-1">
          <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6">
            <h1 className="text-xl font-bold text-white">Distribute Survey</h1>
            <Button
              variant="outline"
              onClick={() => {
                setShowDistribution(false);
                setSelectedSurvey(null);
              }}
              className="border-slate-700 text-slate-400 hover:text-white"
            >
              Back to Surveys
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <SurveyDistribution
              survey={selectedSurvey}
              onClose={() => {
                setShowDistribution(false);
                setSelectedSurvey(null);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#121212] text-[#E0E0E0]">
      <DashboardSidebar user={user} onSignOut={handleSignOut} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white text-enhanced">
              Surveys
            </h1>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
              {surveys.length} total
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
                  placeholder="Search surveys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-slate-700 text-slate-400 hover:text-white"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filter: {filterStatus === "all" ? "All" : filterStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700">
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("all")}
                    className="text-white hover:bg-slate-700"
                  >
                    All Surveys
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("active")}
                    className="text-white hover:bg-slate-700"
                  >
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("draft")}
                    className="text-white hover:bg-slate-700"
                  >
                    Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("completed")}
                    className="text-white hover:bg-slate-700"
                  >
                    Completed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              onClick={createNewSurvey}
              className="bg-[#1E90FF] hover:bg-[#1E90FF]/80 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Survey
            </Button>
          </div>

          {/* Surveys Grid */}
          {filteredSurveys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSurveys.map((survey) => (
                <Card
                  key={survey.id}
                  className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-1">
                          {survey.title}
                        </CardTitle>
                        <p className="text-slate-400 text-sm">
                          {survey.description}
                        </p>
                      </div>
                      <Badge
                        className={`${getStatusColor(survey.status)} text-white capitalize ml-2`}
                      >
                        {survey.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Responses</span>
                          <span className="text-white">
                            {survey.response_count}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">
                            Completion Rate
                          </span>
                          <span className="text-white">
                            {survey.completion_rate}%
                          </span>
                        </div>
                        <Progress
                          value={survey.completion_rate}
                          className="h-2"
                        />
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">
                          Created:{" "}
                          {new Date(survey.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-slate-400">
                          {survey.questions?.length || 0} questions
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSurvey(survey);
                              setShowBuilder(true);
                            }}
                            className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSurvey(survey);
                              setShowDistribution(true);
                            }}
                            className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                          >
                            <Send className="h-4 w-4 mr-1" /> Distribute
                          </Button>
                          {survey.status === "active" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateSurveyStatus(survey.id, "paused")
                              }
                              className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                            >
                              <Pause className="h-4 w-4 mr-1" /> Pause
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateSurveyStatus(survey.id, "active")
                              }
                              className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                            >
                              <Play className="h-4 w-4 mr-1" /> Activate
                            </Button>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem
                              onClick={() => duplicateSurvey(survey)}
                              className="text-white hover:bg-slate-700"
                            >
                              <Copy className="h-4 w-4 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const shareUrl = `${window.location.origin}/survey/${survey.id}`;
                                navigator.clipboard.writeText(shareUrl);
                                alert("Survey link copied to clipboard!");
                              }}
                              className="text-white hover:bg-slate-700"
                            >
                              <Share2 className="h-4 w-4 mr-2" /> Copy Share
                              Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/responses?survey=${survey.id}`)
                              }
                              className="text-white hover:bg-slate-700"
                            >
                              <BarChart className="h-4 w-4 mr-2" /> View
                              Responses
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteSurvey(survey.id)}
                              className="text-red-400 hover:bg-slate-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-white mb-2">
                {searchTerm || filterStatus !== "all"
                  ? "No surveys found"
                  : "No surveys yet"}
              </h3>
              <p className="text-slate-400 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first survey to start collecting feedback"}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Button
                  onClick={createNewSurvey}
                  className="bg-[#1E90FF] hover:bg-[#1E90FF]/80 text-white"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Survey
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
