import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      surveys: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: "draft" | "active" | "completed" | "paused";
          questions: any;
          settings: any;
          distribution_channels: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: "draft" | "active" | "completed" | "paused";
          questions?: any;
          settings?: any;
          distribution_channels?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?: "draft" | "active" | "completed" | "paused";
          questions?: any;
          settings?: any;
          distribution_channels?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      survey_responses: {
        Row: {
          id: string;
          survey_id: string;
          respondent_email: string | null;
          respondent_name: string | null;
          responses: any;
          sentiment_score: number | null;
          completion_rate: number | null;
          ip_address: string | null;
          user_agent: string | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          survey_id: string;
          respondent_email?: string | null;
          respondent_name?: string | null;
          responses: any;
          sentiment_score?: number | null;
          completion_rate?: number | null;
          ip_address?: string | null;
          user_agent?: string | null;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          survey_id?: string;
          respondent_email?: string | null;
          respondent_name?: string | null;
          responses?: any;
          sentiment_score?: number | null;
          completion_rate?: number | null;
          ip_address?: string | null;
          user_agent?: string | null;
          submitted_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          survey_id: string;
          total_responses: number | null;
          average_sentiment: number | null;
          completion_rate: number | null;
          response_trend: any;
          sentiment_distribution: any;
          updated_at: string;
        };
        Insert: {
          id?: string;
          survey_id: string;
          total_responses?: number | null;
          average_sentiment?: number | null;
          completion_rate?: number | null;
          response_trend?: any;
          sentiment_distribution?: any;
          updated_at?: string;
        };
        Update: {
          id?: string;
          survey_id?: string;
          total_responses?: number | null;
          average_sentiment?: number | null;
          completion_rate?: number | null;
          response_trend?: any;
          sentiment_distribution?: any;
          updated_at?: string;
        };
      };
      automations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          trigger_type:
            | "response_received"
            | "survey_completed"
            | "sentiment_threshold"
            | "time_based";
          trigger_conditions: any;
          actions: any;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          trigger_type:
            | "response_received"
            | "survey_completed"
            | "sentiment_threshold"
            | "time_based";
          trigger_conditions?: any;
          actions?: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          trigger_type?:
            | "response_received"
            | "survey_completed"
            | "sentiment_threshold"
            | "time_based";
          trigger_conditions?: any;
          actions?: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      integrations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "webhook" | "email" | "slack" | "zapier" | "crm" | "analytics";
          config: any;
          is_active: boolean;
          last_sync: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: "webhook" | "email" | "slack" | "zapier" | "crm" | "analytics";
          config: any;
          is_active?: boolean;
          last_sync?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: "webhook" | "email" | "slack" | "zapier" | "crm" | "analytics";
          config?: any;
          is_active?: boolean;
          last_sync?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      automation_logs: {
        Row: {
          id: string;
          automation_id: string;
          survey_response_id: string | null;
          status: "success" | "failed" | "pending";
          error_message: string | null;
          executed_at: string;
        };
        Insert: {
          id?: string;
          automation_id: string;
          survey_response_id?: string | null;
          status: "success" | "failed" | "pending";
          error_message?: string | null;
          executed_at?: string;
        };
        Update: {
          id?: string;
          automation_id?: string;
          survey_response_id?: string | null;
          status?: "success" | "failed" | "pending";
          error_message?: string | null;
          executed_at?: string;
        };
      };
      survey_distributions: {
        Row: {
          id: string;
          survey_id: string;
          channel: "email" | "sms" | "link" | "qr_code" | "widget";
          recipient_list: any;
          sent_count: number;
          opened_count: number;
          response_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          survey_id: string;
          channel: "email" | "sms" | "link" | "qr_code" | "widget";
          recipient_list?: any;
          sent_count?: number;
          opened_count?: number;
          response_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          survey_id?: string;
          channel?: "email" | "sms" | "link" | "qr_code" | "widget";
          recipient_list?: any;
          sent_count?: number;
          opened_count?: number;
          response_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
