"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  Zap,
  Mail,
  MessageSquare,
  Bell,
  Webhook,
  Play,
  Pause,
  Edit,
  Trash2,
  Activity,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type TriggerType =
  | "response_received"
  | "survey_completed"
  | "sentiment_threshold"
  | "time_based";

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger_type: TriggerType;
  trigger_conditions: any;
  actions: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AutomationLog {
  id: string;
  automation_id: string;
  status: "success" | "failed" | "pending";
  error_message: string;
  executed_at: string;
}

export default function AutomationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(
    null,
  );
  const [newAutomation, setNewAutomation] = useState<{
    name: string;
    description: string;
    trigger_type: TriggerType;
    trigger_conditions: any;
    actions: any[];
  }>({
    name: "",
    description: "",
    trigger_type: "response_received",
    trigger_conditions: {},
    actions: [],
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
      await fetchAutomations(user.id);
      await fetchLogs();
      setLoading(false);
    };

    getUser();
  }, [router]);

  const fetchAutomations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("automations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAutomations(data || []);
    } catch (error) {
      console.error("Error fetching automations:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("automation_logs")
        .select("*")
        .order("executed_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const createAutomation = async () => {
    if (!user || !newAutomation.name.trim()) {
      alert("Please enter a name for the automation");
      return;
    }

    try {
      // Validate trigger type
      const validTriggerTypes: TriggerType[] = [
        "response_received",
        "survey_completed",
        "sentiment_threshold",
        "time_based",
      ];
      if (!validTriggerTypes.includes(newAutomation.trigger_type)) {
        throw new Error(`Invalid trigger type: ${newAutomation.trigger_type}`);
      }

      // Set default actions based on trigger type
      const defaultActions = [
        {
          type: "email",
          config: {
            to: user.email || "admin@example.com",
            subject: `Automation: ${newAutomation.name}`,
            body: "Automation triggered successfully",
          },
        },
      ];

      // Set default trigger conditions based on trigger type
      let defaultConditions: any = {};
      switch (newAutomation.trigger_type) {
        case "sentiment_threshold":
          defaultConditions = { threshold: 3.0, operator: "less_than" };
          break;
        case "response_received":
          defaultConditions = { survey_id: "any" };
          break;
        case "survey_completed":
          defaultConditions = { completion_rate: 100 };
          break;
        case "time_based":
          defaultConditions = { schedule: "daily", time: "09:00" };
          break;
        default:
          defaultConditions = {};
      }

      const { data, error } = await supabase
        .from("automations")
        .insert({
          user_id: user.id,
          name: newAutomation.name.trim(),
          description: newAutomation.description.trim() || null,
          trigger_type: newAutomation.trigger_type,
          trigger_conditions: defaultConditions,
          actions: defaultActions,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw new Error(`Failed to create automation: ${error.message}`);
      }

      if (!data) {
        throw new Error("Failed to create automation - no data returned");
      }

      // Log the automation creation
      try {
        await supabase.from("automation_logs").insert({
          automation_id: data.id,
          status: "success",
          error_message: null,
          executed_at: new Date().toISOString(),
        });
      } catch (logError) {
        console.warn("Failed to log automation creation:", logError);
      }

      setShowCreateDialog(false);
      setNewAutomation({
        name: "",
        description: "",
        trigger_type: "response_received",
        trigger_conditions: {},
        actions: [],
      });

      await fetchAutomations(user.id);
      await fetchLogs();

      alert("Automation created successfully!");
    } catch (error: any) {
      console.error("Error creating automation:", error);

      // Log the error
      try {
        await supabase.from("automation_logs").insert({
          automation_id: "00000000-0000-0000-0000-000000000000", // Use a placeholder UUID for system logs
          status: "failed",
          error_message: error.message || "Unknown error occurred",
          executed_at: new Date().toISOString(),
        });
      } catch (logError) {
        console.warn("Failed to log error:", logError);
      }

      alert(error.message || "Failed to create automation. Please try again.");
    }
  };

  const toggleAutomation = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("automations")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      // Log the toggle action
      await supabase.from("automation_logs").insert({
        automation_id: id,
        status: "success",
        executed_at: new Date().toISOString(),
      });

      if (user) {
        await fetchAutomations(user.id);
        await fetchLogs();
      }
    } catch (error) {
      console.error("Error toggling automation:", error);
      // Log the error
      await supabase.from("automation_logs").insert({
        automation_id: id,
        status: "failed",
        error_message: error instanceof Error ? error.message : String(error),
        executed_at: new Date().toISOString(),
      });
    }
  };

  const deleteAutomation = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this automation? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("automations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Log the deletion
      await supabase.from("automation_logs").insert({
        automation_id: "system",
        status: "success",
        executed_at: new Date().toISOString(),
      });

      if (user) {
        await fetchAutomations(user.id);
        await fetchLogs();
      }
    } catch (error) {
      console.error("Error deleting automation:", error);
      // Log the error
      await supabase.from("automation_logs").insert({
        automation_id: "system",
        status: "failed",
        error_message: error instanceof Error ? error.message : String(error),
        executed_at: new Date().toISOString(),
      });
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case "response_received":
        return <MessageSquare className="h-4 w-4" />;
      case "survey_completed":
        return <Activity className="h-4 w-4" />;
      case "sentiment_threshold":
        return <Bell className="h-4 w-4" />;
      case "time_based":
        return <Zap className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (triggerType: string) => {
    switch (triggerType) {
      case "response_received":
        return "Response Received";
      case "survey_completed":
        return "Survey Completed";
      case "sentiment_threshold":
        return "Sentiment Threshold";
      case "time_based":
        return "Time Based";
      default:
        return triggerType;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "pending":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-cyber items-center justify-center font-orbitron">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-cyber-blue"></div>
          <div className="text-white text-lg font-orbitron">
            Loading Automations...
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
              Automations
            </h1>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
              {automations.length} automations
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Automations List */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Your Automations
                </h2>
                <Dialog
                  open={showCreateDialog}
                  onOpenChange={setShowCreateDialog}
                >
                  <DialogTrigger asChild>
                    <Button className="cyber-button text-black font-semibold">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Automation
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                      <DialogTitle>Create New Automation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newAutomation.name}
                          onChange={(e) =>
                            setNewAutomation({
                              ...newAutomation,
                              name: e.target.value,
                            })
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Enter automation name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newAutomation.description}
                          onChange={(e) =>
                            setNewAutomation({
                              ...newAutomation,
                              description: e.target.value,
                            })
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Describe what this automation does"
                        />
                      </div>
                      <div>
                        <Label htmlFor="trigger">Trigger</Label>
                        <Select
                          value={newAutomation.trigger_type}
                          onValueChange={(value: TriggerType) =>
                            setNewAutomation({
                              ...newAutomation,
                              trigger_type: value,
                            })
                          }
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem
                              value="response_received"
                              className="text-white"
                            >
                              Response Received
                            </SelectItem>
                            <SelectItem
                              value="survey_completed"
                              className="text-white"
                            >
                              Survey Completed
                            </SelectItem>
                            <SelectItem
                              value="sentiment_threshold"
                              className="text-white"
                            >
                              Sentiment Threshold
                            </SelectItem>
                            <SelectItem
                              value="time_based"
                              className="text-white"
                            >
                              Time Based
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateDialog(false)}
                          className="border-slate-600 text-slate-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={createAutomation}
                          className="cyber-button text-black font-semibold"
                        >
                          Create
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {automations.length > 0 ? (
                <div className="space-y-4">
                  {automations.map((automation, index) => (
                    <Card
                      key={automation.id}
                      className="cyber-card hover:border-cyber-blue transition-all duration-300 animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg mb-1 flex items-center">
                              {getTriggerIcon(automation.trigger_type)}
                              <span className="ml-2">{automation.name}</span>
                            </CardTitle>
                            <p className="text-slate-400 text-sm">
                              {automation.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge
                                variant="secondary"
                                className="bg-slate-700 text-slate-300"
                              >
                                {getTriggerLabel(automation.trigger_type)}
                              </Badge>
                              <Badge
                                className={`${automation.is_active ? "bg-green-500" : "bg-gray-500"} text-white`}
                              >
                                {automation.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={automation.is_active}
                              onCheckedChange={(checked) =>
                                toggleAutomation(automation.id, checked)
                              }
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingAutomation(automation)}
                              className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteAutomation(automation.id)}
                              className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-slate-400">
                          Created:{" "}
                          {new Date(automation.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    No automations yet
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Create your first automation to streamline your workflow
                  </p>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="cyber-button text-black font-semibold"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Automation
                  </Button>
                </div>
              )}
            </div>

            {/* Activity Log */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                Recent Activity
              </h2>
              <Card
                className="cyber-card animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <CardHeader>
                  <CardTitle className="text-cyber-purple text-lg">
                    Execution Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {logs.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3 bg-slate-900 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Badge
                              className={`${getStatusColor(log.status)} text-white`}
                            >
                              {log.status}
                            </Badge>
                            <div>
                              <p className="text-sm text-white">
                                Automation executed
                              </p>
                              <p className="text-xs text-slate-400">
                                {new Date(log.executed_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-4">
                      No activity logs yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card
                className="cyber-card mt-6 animate-slide-up"
                style={{ animationDelay: "0.3s" }}
              >
                <CardHeader>
                  <CardTitle className="text-cyber-green text-lg">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                      onClick={() => {
                        setNewAutomation({
                          name: "Email Notification",
                          description:
                            "Send email when survey response is received",
                          trigger_type: "response_received" as TriggerType,
                          trigger_conditions: {},
                          actions: [],
                        });
                        setShowCreateDialog(true);
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email Notification
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                      onClick={() => {
                        setNewAutomation({
                          name: "Webhook Trigger",
                          description: "Send webhook when survey is completed",
                          trigger_type: "survey_completed" as TriggerType,
                          trigger_conditions: {},
                          actions: [],
                        });
                        setShowCreateDialog(true);
                      }}
                    >
                      <Webhook className="mr-2 h-4 w-4" />
                      Webhook Trigger
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                      onClick={() => {
                        setNewAutomation({
                          name: "Slack Message",
                          description:
                            "Send Slack message for low sentiment responses",
                          trigger_type: "sentiment_threshold" as TriggerType,
                          trigger_conditions: {},
                          actions: [],
                        });
                        setShowCreateDialog(true);
                      }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Slack Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
