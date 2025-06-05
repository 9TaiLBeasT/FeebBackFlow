"use client";

import React, { useState } from "react";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import {
  Plus,
  Settings,
  Eye,
  Save,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface QuestionType {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  scale?: number;
}

interface SurveyBuilderProps {
  survey?: any;
  onSave?: () => void;
}

export default function SurveyBuilder({
  survey,
  onSave,
}: SurveyBuilderProps = {}) {
  const [surveyTitle, setSurveyTitle] = useState(survey?.title || "New Survey");
  const [surveyDescription, setSurveyDescription] = useState(
    survey?.description || "Please provide your feedback",
  );
  const [questions, setQuestions] = useState<QuestionType[]>(() => {
    if (
      survey?.questions &&
      Array.isArray(survey.questions) &&
      survey.questions.length > 0
    ) {
      return survey.questions.map((q) => ({
        id: q?.id || `q_${Math.random().toString(36).substr(2, 9)}`,
        type: q?.type || "multiple-choice",
        title: q?.title || "New Question",
        description: q?.description || "",
        required: Boolean(q?.required),
        options: Array.isArray(q?.options) ? q.options : [],
        scale: typeof q?.scale === "number" ? q.scale : 5,
      }));
    }
    return [
      {
        id: "q1",
        type: "multiple-choice",
        title: "How satisfied are you with our service?",
        description: "Please select one option",
        required: true,
        options: [
          "Very satisfied",
          "Satisfied",
          "Neutral",
          "Dissatisfied",
          "Very dissatisfied",
        ],
      },
    ];
  });
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(
    questions.length > 0 ? questions[0].id : null,
  );
  const [activeTab, setActiveTab] = useState("questions");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const addQuestion = (type: string) => {
    const newQuestion: QuestionType = {
      id: `q${questions.length + 1}`,
      type,
      title: `New ${type} question`,
      required: false,
    };

    if (type === "multiple-choice") {
      newQuestion.options = ["Option 1", "Option 2", "Option 3"];
    } else if (type === "likert") {
      newQuestion.scale = 5;
    }

    setQuestions([...questions, newQuestion]);
    setSelectedQuestion(newQuestion.id);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    if (selectedQuestion === id) {
      setSelectedQuestion(questions.length > 1 ? questions[0].id : null);
    }
  };

  const updateQuestion = (id: string, updates: Partial<QuestionType>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    );
  };

  const moveQuestion = (id: string, direction: "up" | "down") => {
    const index = questions.findIndex((q) => q.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[newIndex]] = [
      newQuestions[newIndex],
      newQuestions[index],
    ];
    setQuestions(newQuestions);
  };

  const selectedQuestionData = selectedQuestion
    ? questions.find((q) => q.id === selectedQuestion)
    : null;

  const handleSaveSurvey = async () => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Please log in to save surveys");
        return;
      }

      const surveyData = {
        title: surveyTitle,
        description: surveyDescription,
        questions: questions,
        status: "draft",
        updated_at: new Date().toISOString(),
      };

      if (survey?.id) {
        // Update existing survey
        const { error } = await supabase
          .from("surveys")
          .update(surveyData)
          .eq("id", survey.id);

        if (error) throw error;
      } else {
        // Create new survey
        const { error } = await supabase.from("surveys").insert({
          ...surveyData,
          user_id: user.id,
        });

        if (error) throw error;
      }

      alert("Survey saved successfully!");
      if (onSave) onSave();
    } catch (error) {
      console.error("Error saving survey:", error);
      alert("Failed to save survey. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (survey?.id) {
      window.open(`/survey/${survey.id}`, "_blank");
    } else {
      alert("Please save the survey first to preview it.");
    }
  };

  return (
    <div className="flex h-full w-full bg-gradient-cyber font-orbitron">
      {/* Left Sidebar - Question Types */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm p-4 flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-cyber-blue">
          Question Types
        </h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addQuestion("multiple-choice")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Multiple Choice
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addQuestion("likert")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Likert Scale
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addQuestion("open-ended")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Open Ended
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addQuestion("yes-no")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Yes/No
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addQuestion("rating")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Rating
          </Button>
        </div>

        <Separator className="my-6" />

        <div className="mt-auto space-y-2">
          <Button
            className="w-full cyber-button text-black font-semibold"
            onClick={handleSaveSurvey}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Survey"}
          </Button>
          <Button variant="outline" className="w-full" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      {/* Main Content - Survey Preview */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Input
              value={surveyTitle}
              onChange={(e) => setSurveyTitle(e.target.value)}
              className="text-2xl font-bold border-none bg-transparent px-0 text-foreground focus-visible:ring-0 h-auto text-3xl mb-2"
              placeholder="Survey Title"
            />
            <Textarea
              value={surveyDescription}
              onChange={(e) => setSurveyDescription(e.target.value)}
              className="border-none bg-transparent resize-none px-0 focus-visible:ring-0"
              placeholder="Survey Description"
            />
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card
                key={question.id}
                className={`cyber-card ${selectedQuestion === question.id ? "border-cyber-blue" : "border-slate-700"} hover:border-cyber-blue transition-all duration-200`}
                onClick={() => setSelectedQuestion(question.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="cursor-move">
                      <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">
                          Q{index + 1}.
                        </span>
                        <span className="font-medium">
                          {question?.title || "Question"}
                        </span>
                        {question?.required && (
                          <span className="text-destructive text-sm">*</span>
                        )}
                      </div>
                      {question?.description && (
                        <p className="text-sm text-muted-foreground">
                          {question.description}
                        </p>
                      )}

                      <div className="mt-3">
                        {question?.type === "multiple-choice" &&
                          question?.options && (
                            <div className="space-y-1">
                              {question.options.map((option, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2"
                                >
                                  <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                                  <span className="text-sm">{option}</span>
                                </div>
                              ))}
                            </div>
                          )}

                        {question?.type === "likert" && (
                          <div className="flex justify-between mt-2">
                            {Array.from({ length: question?.scale || 5 }).map(
                              (_, i) => (
                                <div
                                  key={i}
                                  className="flex flex-col items-center"
                                >
                                  <div className="h-6 w-6 rounded-full border border-muted-foreground flex items-center justify-center">
                                    {i + 1}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}

                        {question?.type === "open-ended" && (
                          <div className="mt-2 border border-dashed border-border rounded-md p-3 bg-muted/20">
                            <p className="text-sm text-muted-foreground italic">
                              Text response area
                            </p>
                          </div>
                        )}

                        {question?.type === "yes-no" && (
                          <div className="flex gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                              <span className="text-sm">Yes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                              <span className="text-sm">No</span>
                            </div>
                          </div>
                        )}

                        {question?.type === "rating" && (
                          <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div
                                key={star}
                                className="text-xl text-muted-foreground"
                              >
                                ★
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuestion(question.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div className="w-80 border-l border-slate-800 bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="questions">Question</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="mt-4 space-y-4">
            {selectedQuestionData ? (
              <>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="question-title">Question Title</Label>
                    <Input
                      id="question-title"
                      value={selectedQuestionData.title}
                      onChange={(e) =>
                        updateQuestion(selectedQuestionData.id, {
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="question-description">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="question-description"
                      value={selectedQuestionData.description || ""}
                      onChange={(e) =>
                        updateQuestion(selectedQuestionData.id, {
                          description: e.target.value,
                        })
                      }
                      placeholder="Add a description..."
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="required-switch">Required</Label>
                    <Switch
                      id="required-switch"
                      checked={selectedQuestionData.required}
                      onCheckedChange={(checked) =>
                        updateQuestion(selectedQuestionData.id, {
                          required: checked,
                        })
                      }
                    />
                  </div>

                  {selectedQuestionData.type === "multiple-choice" &&
                    selectedQuestionData.options && (
                      <div>
                        <Label>Options</Label>
                        <div className="space-y-2 mt-2">
                          {selectedQuestionData.options.map((option, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [
                                    ...selectedQuestionData.options!,
                                  ];
                                  newOptions[index] = e.target.value;
                                  updateQuestion(selectedQuestionData.id, {
                                    options: newOptions,
                                  });
                                }}
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newOptions =
                                    selectedQuestionData.options!.filter(
                                      (_, i) => i !== index,
                                    );
                                  updateQuestion(selectedQuestionData.id, {
                                    options: newOptions,
                                  });
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              const newOptions = [
                                ...selectedQuestionData.options!,
                                `Option ${selectedQuestionData.options!.length + 1}`,
                              ];
                              updateQuestion(selectedQuestionData.id, {
                                options: newOptions,
                              });
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}

                  {selectedQuestionData.type === "likert" && (
                    <div>
                      <Label htmlFor="scale-select">Scale Points</Label>
                      <Select
                        value={selectedQuestionData.scale?.toString() || "5"}
                        onValueChange={(value) =>
                          updateQuestion(selectedQuestionData.id, {
                            scale: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger id="scale-select">
                          <SelectValue placeholder="Select scale" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3-point scale</SelectItem>
                          <SelectItem value="5">5-point scale</SelectItem>
                          <SelectItem value="7">7-point scale</SelectItem>
                          <SelectItem value="10">10-point scale</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveQuestion(selectedQuestionData.id, "up")}
                    disabled={
                      questions.findIndex(
                        (q) => q.id === selectedQuestionData.id,
                      ) === 0
                    }
                  >
                    <ChevronUp className="h-4 w-4 mr-1" /> Move Up
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      moveQuestion(selectedQuestionData.id, "down")
                    }
                    disabled={
                      questions.findIndex(
                        (q) => q.id === selectedQuestionData.id,
                      ) ===
                      questions.length - 1
                    }
                  >
                    <ChevronDown className="h-4 w-4 mr-1" /> Move Down
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a question to edit its properties
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-4">
            <div>
              <Label htmlFor="survey-title">Survey Title</Label>
              <Input
                id="survey-title"
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="survey-description">Survey Description</Label>
              <Textarea
                id="survey-description"
                value={surveyDescription}
                onChange={(e) => setSurveyDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="theme-select">Survey Theme</Label>
              <Select defaultValue="default">
                <SelectTrigger id="theme-select">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="progress-bar-switch">Show Progress Bar</Label>
              <Switch id="progress-bar-switch" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="required-fields-switch">
                Mark Required Fields
              </Label>
              <Switch id="required-fields-switch" defaultChecked />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Missing ChevronUp component, adding it here
function ChevronUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  );
}
