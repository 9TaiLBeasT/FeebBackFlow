"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  scale?: number;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  status: string;
}

export default function SurveyPage() {
  const params = useParams();
  const surveyId = params.id as string;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [respondentEmail, setRespondentEmail] = useState("");

  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  const fetchSurvey = async () => {
    try {
      if (!surveyId) {
        console.error("No survey ID provided");
        return;
      }

      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", surveyId)
        .single();

      if (error) {
        console.error("Error fetching survey:", error);
        return;
      }

      if (!data) {
        console.error("Survey not found or not active");
        return;
      }

      // Validate survey data
      if (
        !data.questions ||
        !Array.isArray(data.questions) ||
        data.questions.length === 0
      ) {
        console.error("Survey has no questions or is improperly configured");
        return;
      }

      // Validate each question has required properties
      const validQuestions = data.questions.filter(
        (q: any) => q && typeof q === "object" && q.id && q.type && q.title,
      );

      if (validQuestions.length === 0) {
        console.error("Survey has no valid questions");
        return;
      }

      // Ensure all questions have required property with proper null safety
      const questionsWithDefaults = validQuestions.map((q: any) => ({
        id: q?.id || `q_${Math.random().toString(36).substr(2, 9)}`,
        type: q?.type || "open-ended",
        title: q?.title || "Untitled Question",
        required: Boolean(q?.required),
        description: q?.description || "",
        options: Array.isArray(q?.options) ? q.options : [],
        scale: typeof q?.scale === "number" ? q.scale : 5,
      }));

      setSurvey({
        ...data,
        questions: questionsWithDefaults,
      });
    } catch (error) {
      console.error("Error fetching survey:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (survey?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!survey) return;

    setSubmitting(true);
    try {
      // Calculate completion rate
      const answeredQuestions = Object.keys(responses).length;
      const completionRate = survey.questions?.length
        ? (answeredQuestions / survey.questions.length) * 100
        : 0;

      // Simple sentiment analysis (mock implementation)
      const sentimentScore = Math.random() * 5; // In real app, use actual sentiment analysis

      const { error } = await supabase.from("survey_responses").insert({
        survey_id: surveyId,
        respondent_email: respondentEmail || null,
        responses: responses,
        sentiment_score: sentimentScore,
        completion_rate: completionRate,
        submitted_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting response:", error);
      alert("Failed to submit response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const currentResponse = responses[question.id];

    switch (question.type) {
      case "multiple-choice":
        return (
          <RadioGroup
            value={currentResponse || ""}
            onValueChange={(value) => handleResponseChange(question.id, value)}
            className="space-y-3"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label
                  htmlFor={`${question.id}-${index}`}
                  className="text-white"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "likert":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Strongly Disagree</span>
              <span className="text-sm text-slate-400">Strongly Agree</span>
            </div>
            <RadioGroup
              value={currentResponse?.toString() || ""}
              onValueChange={(value) =>
                handleResponseChange(question.id, parseInt(value))
              }
              className="flex justify-between"
            >
              {Array.from({ length: question.scale || 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-2"
                >
                  <RadioGroupItem
                    value={(index + 1).toString()}
                    id={`${question.id}-${index}`}
                  />
                  <Label
                    htmlFor={`${question.id}-${index}`}
                    className="text-sm text-slate-400"
                  >
                    {index + 1}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "open-ended":
        return (
          <Textarea
            value={currentResponse || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Type your response here..."
            className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
          />
        );

      case "yes-no":
        return (
          <RadioGroup
            value={currentResponse || ""}
            onValueChange={(value) => handleResponseChange(question.id, value)}
            className="flex space-x-8"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${question.id}-yes`} />
              <Label htmlFor={`${question.id}-yes`} className="text-white">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${question.id}-no`} />
              <Label htmlFor={`${question.id}-no`} className="text-white">
                No
              </Label>
            </div>
          </RadioGroup>
        );

      case "rating":
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleResponseChange(question.id, star)}
                className={`text-2xl ${
                  currentResponse >= star ? "text-yellow-400" : "text-slate-600"
                } hover:text-yellow-300 transition-colors`}
              >
                ★
              </button>
            ))}
          </div>
        );

      default:
        return <div className="text-slate-400">Unsupported question type</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cyber flex items-center justify-center font-orbitron">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-cyber-blue"></div>
          <div className="text-white text-lg font-orbitron">
            Loading Survey...
          </div>
          <div className="text-slate-400 text-sm">
            Please wait while we prepare your survey
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !survey) {
    return (
      <div className="min-h-screen bg-gradient-cyber flex items-center justify-center font-orbitron">
        <div className="text-center max-w-md mx-4">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Survey Not Found
          </h1>
          <p className="text-slate-400 mb-6">
            The survey you're looking for doesn't exist, is no longer available,
            or may be inactive.
          </p>
          <button
            onClick={() => window.history.back()}
            className="cyber-button text-black px-6 py-2 rounded-lg font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-cyber flex items-center justify-center font-orbitron">
        <Card className="cyber-card max-w-md w-full mx-4 animate-scale-in">
          <CardContent className="p-8 text-center">
            <div className="text-cyber-green text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-white mb-4">Thank You!</h1>
            <p className="text-slate-400 mb-6">
              Your response has been submitted successfully. We appreciate your
              feedback!
            </p>
            <Button
              onClick={() => window.close()}
              className="cyber-button text-black font-semibold"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = survey?.questions?.[currentQuestionIndex];
  const progress = survey?.questions?.length
    ? ((currentQuestionIndex + 1) / survey.questions.length) * 100
    : 0;
  const isLastQuestion = survey?.questions
    ? currentQuestionIndex === survey.questions.length - 1
    : false;
  const canProceed = currentQuestion
    ? !currentQuestion?.required ||
      (responses[currentQuestion.id] !== undefined &&
        responses[currentQuestion.id] !== null &&
        responses[currentQuestion.id] !== "")
    : false;

  return (
    <div className="min-h-screen bg-gradient-cyber py-8 font-orbitron">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2 text-enhanced">
            {survey?.title || "Survey"}
          </h1>
          <p className="text-slate-400">{survey?.description || ""}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>
              Question {currentQuestionIndex + 1} of{" "}
              {survey?.questions?.length || 0}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <Card className="cyber-card mb-8 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                {currentQuestion?.title || "Question"}
                {currentQuestion?.required && (
                  <span className="text-red-400 ml-1">*</span>
                )}
              </CardTitle>
              {currentQuestion?.description && (
                <p className="text-slate-400">{currentQuestion.description}</p>
              )}
            </CardHeader>
            <CardContent>{renderQuestion(currentQuestion)}</CardContent>
          </Card>
        )}

        {/* Email Input (on last question) */}
        {isLastQuestion && (
          <Card
            className="cyber-card mb-8 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Contact Information (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="email"
                placeholder="Your email address"
                value={respondentEmail}
                onChange={(e) => setRespondentEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed || submitting}
              className="cyber-button text-black font-semibold"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Submitting..." : "Submit Survey"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-cyber-blue hover:bg-cyber-blue/80 text-black font-semibold"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
