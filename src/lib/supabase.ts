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
          status: "draft" | "active" | "completed";
          questions: any;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: "draft" | "active" | "completed";
          questions?: any;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?: "draft" | "active" | "completed";
          questions?: any;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      survey_responses: {
        Row: {
          id: string;
          survey_id: string;
          respondent_email: string | null;
          responses: any;
          sentiment_score: number | null;
          completion_rate: number | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          survey_id: string;
          respondent_email?: string | null;
          responses: any;
          sentiment_score?: number | null;
          completion_rate?: number | null;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          survey_id?: string;
          respondent_email?: string | null;
          responses?: any;
          sentiment_score?: number | null;
          completion_rate?: number | null;
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
    };
  };
};
