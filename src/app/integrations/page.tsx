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
  Link2,
  Mail,
  MessageSquare,
  Zap,
  BarChart3,
  Webhook,
  Settings,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface Integration {
  id: string;
  name: string;
  type: "webhook" | "email" | "slack" | "zapier" | "crm" | "analytics";
  config: any;
  is_active: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

const integrationTypes = [
  {
    type: "webhook",
    name: "Webhook",
    description: "Send data to external services via HTTP requests",
    icon: Webhook,
    color: "bg-blue-500",
  },
  {
    type: "email",
    name: "Email",
    description: "Send email notifications and reports",
    icon: Mail,
    color: "bg-green-500",
  },
  {
    type: "slack",
    name: "Slack",
    description: "Post messages to Slack channels",
    icon: MessageSquare,
    color: "bg-purple-500",
  },
  {
    type: "zapier",
    name: "Zapier",
    description: "Connect with 5000+ apps via Zapier",
    icon: Zap,
    color: "bg-orange-500",
  },
  {
    type: "crm",
    name: "CRM",
    description: "Sync data with your CRM system",
    icon: Link2,
    color: "bg-indigo-500",
  },
  {
    type: "analytics",
    name: "Analytics",
    description: "Send data to analytics platforms",
    icon: BarChart3,
    color: "bg-pink-500",
  },
];

export default function IntegrationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingIntegration, setEditingIntegration] =
    useState<Integration | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [newIntegration, setNewIntegration] = useState({
    name: "",
    type: "webhook" as const,
    config: {},
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
      await fetchIntegrations(user.id);
      setLoading(false);
    };

    getUser();
  }, [router]);

  const fetchIntegrations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error("Error fetching integrations:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const createIntegration = async () => {
    if (!user || !newIntegration.name || !selectedType) return;

    try {
      const config = getDefaultConfig(selectedType as any);

      const { error } = await supabase.from("integrations").insert({
        user_id: user.id,
        name: newIntegration.name,
        type: selectedType,
        config: config,
        is_active: false,
      });

      if (error) throw error;

      setShowCreateDialog(false);
      setNewIntegration({
        name: "",
        type: "webhook",
        config: {},
      });
      setSelectedType("");
      await fetchIntegrations(user.id);
    } catch (error) {
      console.error("Error creating integration:", error);
    }
  };

  const updateIntegration = async (integration: Integration) => {
    try {
      const { error } = await supabase
        .from("integrations")
        .update({
          name: integration.name,
          config: integration.config,
          updated_at: new Date().toISOString(),
        })
        .eq("id", integration.id);

      if (error) throw error;

      setEditingIntegration(null);
      if (user) {
        await fetchIntegrations(user.id);
      }
    } catch (error) {
      console.error("Error updating integration:", error);
    }
  };

  const toggleIntegration = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("integrations")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
          last_sync: isActive ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) throw error;

      if (user) {
        await fetchIntegrations(user.id);
      }
    } catch (error) {
      console.error("Error toggling integration:", error);
    }
  };

  const deleteIntegration = async (id: string) => {
    try {
      const { error } = await supabase
        .from("integrations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      if (user) {
        await fetchIntegrations(user.id);
      }
    } catch (error) {
      console.error("Error deleting integration:", error);
    }
  };

  const getDefaultConfig = (type: string) => {
    switch (type) {
      case "webhook":
        return { url: "", method: "POST", headers: {} };
      case "email":
        return { smtp_host: "", smtp_port: 587, username: "", password: "" };
      case "slack":
        return { webhook_url: "", channel: "#general" };
      case "zapier":
        return { webhook_url: "" };
      case "crm":
        return { api_key: "", endpoint: "" };
      case "analytics":
        return { tracking_id: "", api_key: "" };
      default:
        return {};
    }
  };

  const getIntegrationTypeInfo = (type: string) => {
    return integrationTypes.find((t) => t.type === type) || integrationTypes[0];
  };

  const renderConfigForm = (integration: Integration) => {
    const typeInfo = getIntegrationTypeInfo(integration.type);

    switch (integration.type) {
      case "webhook":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Webhook URL</Label>
              <Input
                id="url"
                value={integration.config.url || ""}
                onChange={(e) =>
                  setEditingIntegration({
                    ...integration,
                    config: { ...integration.config, url: e.target.value },
                  })
                }
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="https://your-webhook-url.com"
              />
            </div>
            <div>
              <Label htmlFor="method">HTTP Method</Label>
              <Select
                value={integration.config.method || "POST"}
                onValueChange={(value) =>
                  setEditingIntegration({
                    ...integration,
                    config: { ...integration.config, method: value },
                  })
                }
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="POST" className="text-white">
                    POST
                  </SelectItem>
                  <SelectItem value="PUT" className="text-white">
                    PUT
                  </SelectItem>
                  <SelectItem value="PATCH" className="text-white">
                    PATCH
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "email":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="smtp_host">SMTP Host</Label>
              <Input
                id="smtp_host"
                value={integration.config.smtp_host || ""}
                onChange={(e) =>
                  setEditingIntegration({
                    ...integration,
                    config: {
                      ...integration.config,
                      smtp_host: e.target.value,
                    },
                  })
                }
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={integration.config.username || ""}
                onChange={(e) =>
                  setEditingIntegration({
                    ...integration,
                    config: { ...integration.config, username: e.target.value },
                  })
                }
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="your-email@gmail.com"
              />
            </div>
          </div>
        );
      case "slack":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook_url">Slack Webhook URL</Label>
              <Input
                id="webhook_url"
                value={integration.config.webhook_url || ""}
                onChange={(e) =>
                  setEditingIntegration({
                    ...integration,
                    config: {
                      ...integration.config,
                      webhook_url: e.target.value,
                    },
                  })
                }
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div>
              <Label htmlFor="channel">Channel</Label>
              <Input
                id="channel"
                value={integration.config.channel || ""}
                onChange={(e) =>
                  setEditingIntegration({
                    ...integration,
                    config: { ...integration.config, channel: e.target.value },
                  })
                }
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="#general"
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={integration.config.api_key || ""}
                onChange={(e) =>
                  setEditingIntegration({
                    ...integration,
                    config: { ...integration.config, api_key: e.target.value },
                  })
                }
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter API key"
              />
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-cyber items-center justify-center font-orbitron">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-cyber-blue"></div>
          <div className="text-white text-lg font-orbitron">
            Loading Integrations...
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
              Integrations
            </h1>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
              {integrations.length} integrations
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
            {/* Available Integrations */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                Available Integrations
              </h2>
              <div className="space-y-4">
                {integrationTypes.map((type) => {
                  const Icon = type.icon;
                  const hasIntegration = integrations.some(
                    (i) => i.type === type.type,
                  );

                  return (
                    <Card
                      key={type.type}
                      className="cyber-card hover:border-cyber-blue transition-all duration-300 cursor-pointer animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => {
                        if (!hasIntegration) {
                          setSelectedType(type.type);
                          setNewIntegration({
                            ...newIntegration,
                            type: type.type as any,
                          });
                          setShowCreateDialog(true);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${type.color}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-medium">
                              {type.name}
                            </h3>
                            <p className="text-sm text-slate-400">
                              {type.description}
                            </p>
                          </div>
                          {hasIntegration ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <PlusCircle className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Active Integrations */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Your Integrations
                </h2>
                <Dialog
                  open={showCreateDialog}
                  onOpenChange={setShowCreateDialog}
                >
                  <DialogTrigger asChild>
                    <Button className="cyber-button text-black font-semibold">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Integration
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                      <DialogTitle>Add New Integration</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="integration-name">
                          Integration Name
                        </Label>
                        <Input
                          id="integration-name"
                          value={newIntegration.name}
                          onChange={(e) =>
                            setNewIntegration({
                              ...newIntegration,
                              name: e.target.value,
                            })
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Enter integration name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="integration-type">
                          Integration Type
                        </Label>
                        <Select
                          value={selectedType}
                          onValueChange={setSelectedType}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Select integration type" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {integrationTypes.map((type) => (
                              <SelectItem
                                key={type.type}
                                value={type.type}
                                className="text-white"
                              >
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCreateDialog(false);
                            setSelectedType("");
                            setNewIntegration({
                              name: "",
                              type: "webhook",
                              config: {},
                            });
                          }}
                          className="border-slate-600 text-slate-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={createIntegration}
                          className="cyber-button text-black font-semibold"
                          disabled={!newIntegration.name || !selectedType}
                        >
                          Create
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {integrations.length > 0 ? (
                <div className="space-y-4">
                  {integrations.map((integration) => {
                    const typeInfo = getIntegrationTypeInfo(integration.type);
                    const Icon = typeInfo.icon;

                    return (
                      <Card
                        key={integration.id}
                        className="cyber-card hover:border-cyber-blue transition-all duration-300 animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-lg ${typeInfo.color}`}
                              >
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-white text-lg">
                                  {integration.name}
                                </CardTitle>
                                <p className="text-slate-400 text-sm">
                                  {typeInfo.name} Integration
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                className={`${
                                  integration.is_active
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                                } text-white`}
                              >
                                {integration.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Switch
                                checked={integration.is_active}
                                onCheckedChange={(checked) =>
                                  toggleIntegration(integration.id, checked)
                                }
                              />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Last Sync:</span>
                              <span className="text-white">
                                {integration.last_sync
                                  ? new Date(
                                      integration.last_sync,
                                    ).toLocaleString()
                                  : "Never"}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Created:</span>
                              <span className="text-white">
                                {new Date(
                                  integration.created_at,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-700">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setEditingIntegration(integration)
                                }
                                className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                              >
                                <Settings className="h-4 w-4 mr-1" />
                                Configure
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  deleteIntegration(integration.id)
                                }
                                className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-red-400"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Link2 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    No integrations yet
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Connect your favorite tools to automate your workflow
                  </p>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="cyber-button text-black font-semibold"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Integration
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit Integration Modal */}
      {editingIntegration && (
        <Dialog
          open={!!editingIntegration}
          onOpenChange={() => setEditingIntegration(null)}
        >
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure {editingIntegration.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Integration Name</Label>
                <Input
                  id="edit-name"
                  value={editingIntegration.name}
                  onChange={(e) =>
                    setEditingIntegration({
                      ...editingIntegration,
                      name: e.target.value,
                    })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              {renderConfigForm(editingIntegration)}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingIntegration(null)}
                  className="border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateIntegration(editingIntegration)}
                  className="cyber-button text-black font-semibold"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
