import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Only throw error if we're not using placeholder values and they're actually missing
if ((!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && 
    (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key')) {
  console.warn('Supabase environment variables not configured. Using placeholder values.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для базы данных
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'photographer' | 'designer' | 'admin';
          department: string | null;
          position: string | null;
          salary: number | null;
          phone: string | null;
          telegram: string | null;
          avatar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role: 'photographer' | 'designer' | 'admin';
          department?: string | null;
          position?: string | null;
          salary?: number | null;
          phone?: string | null;
          telegram?: string | null;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'photographer' | 'designer' | 'admin';
          department?: string | null;
          position?: string | null;
          salary?: number | null;
          phone?: string | null;
          telegram?: string | null;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          album_type: string;
          description: string | null;
          status: 'planning' | 'in-progress' | 'review' | 'completed';
          manager_id: string | null;
          deadline: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          album_type: string;
          description?: string | null;
          status?: 'planning' | 'in-progress' | 'review' | 'completed';
          manager_id?: string | null;
          deadline: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          album_type?: string;
          description?: string | null;
          status?: 'planning' | 'in-progress' | 'review' | 'completed';
          manager_id?: string | null;
          deadline?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: 'photographer' | 'designer';
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role: 'photographer' | 'designer';
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role?: 'photographer' | 'designer';
          created_at?: string;
        };
      };
      project_files: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          file_type: string;
          file_size: number;
          preview_url: string | null;
          file_url: string;
          uploaded_by: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          file_type: string;
          file_size: number;
          preview_url?: string | null;
          file_url: string;
          uploaded_by?: string | null;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          file_type?: string;
          file_size?: number;
          preview_url?: string | null;
          file_url?: string;
          uploaded_by?: string | null;
          uploaded_at?: string;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_date: string;
          event_time: string;
          event_type: 'meeting' | 'photoshoot' | 'design' | 'deadline' | 'other';
          created_by: string | null;
          project_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_date: string;
          event_time: string;
          event_type: 'meeting' | 'photoshoot' | 'design' | 'deadline' | 'other';
          created_by?: string | null;
          project_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          event_time?: string;
          event_type?: 'meeting' | 'photoshoot' | 'design' | 'deadline' | 'other';
          created_by?: string | null;
          project_id?: string | null;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          project_id: string;
          author_id: string | null;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          author_id?: string | null;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          author_id?: string | null;
          content?: string;
          created_at?: string;
        };
      };
    };
  };
}