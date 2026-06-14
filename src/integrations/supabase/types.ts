export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chat_history: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          ai_summary: string | null
          category: Database["public"]["Enums"]["complaint_category"]
          created_at: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["complaint_priority"]
          room_number: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          category?: Database["public"]["Enums"]["complaint_category"]
          created_at?: string
          description: string
          id?: string
          priority?: Database["public"]["Enums"]["complaint_priority"]
          room_number?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          category?: Database["public"]["Enums"]["complaint_category"]
          created_at?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["complaint_priority"]
          room_number?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          ai_summary: string | null
          created_at: string
          feedback_text: string
          id: string
          rating: number
          sentiment: Database["public"]["Enums"]["sentiment"] | null
          sentiment_score: number | null
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          feedback_text: string
          id?: string
          rating?: number
          sentiment?: Database["public"]["Enums"]["sentiment"] | null
          sentiment_score?: number | null
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          feedback_text?: string
          id?: string
          rating?: number
          sentiment?: Database["public"]["Enums"]["sentiment"] | null
          sentiment_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      mess_menu: {
        Row: {
          breakfast: string | null
          day_of_week: string
          dinner: string | null
          id: string
          lunch: string | null
          snacks: string | null
          updated_at: string
        }
        Insert: {
          breakfast?: string | null
          day_of_week: string
          dinner?: string | null
          id?: string
          lunch?: string | null
          snacks?: string | null
          updated_at?: string
        }
        Update: {
          breakfast?: string | null
          day_of_week?: string
          dinner?: string | null
          id?: string
          lunch?: string | null
          snacks?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          ai_summary: string | null
          created_at: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["notice_priority"]
          title: string
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: Database["public"]["Enums"]["notice_priority"]
          title: string
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["notice_priority"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_id: string | null
          created_at: string
          designation: string | null
          email: string | null
          gender: string | null
          id: string
          name: string
          phone: string | null
          room_number: string | null
          student_id: string | null
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          designation?: string | null
          email?: string | null
          gender?: string | null
          id: string
          name?: string
          phone?: string | null
          room_number?: string | null
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          designation?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          name?: string
          phone?: string | null
          room_number?: string | null
          student_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string
          floor: number
          id: string
          occupied_count: number
          room_number: string
          room_type: string
          status: Database["public"]["Enums"]["room_status"]
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          floor?: number
          id?: string
          occupied_count?: number
          room_number: string
          room_type?: string
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          floor?: number
          id?: string
          occupied_count?: number
          room_number?: string
          room_type?: string
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "student"
      complaint_category:
        | "electrical"
        | "plumbing"
        | "cleaning"
        | "internet"
        | "furniture"
        | "mess"
        | "other"
      complaint_priority: "low" | "medium" | "high"
      complaint_status: "open" | "in_progress" | "resolved"
      notice_priority: "low" | "medium" | "high"
      room_status: "available" | "occupied" | "full" | "maintenance"
      sentiment: "positive" | "neutral" | "negative"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student"],
      complaint_category: [
        "electrical",
        "plumbing",
        "cleaning",
        "internet",
        "furniture",
        "mess",
        "other",
      ],
      complaint_priority: ["low", "medium", "high"],
      complaint_status: ["open", "in_progress", "resolved"],
      notice_priority: ["low", "medium", "high"],
      room_status: ["available", "occupied", "full", "maintenance"],
      sentiment: ["positive", "neutral", "negative"],
    },
  },
} as const
