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
      bookings: {
        Row: {
          created_at: string
          hostel_id: string
          id: string
          message: string | null
          name: string | null
          phone: string | null
          sharing_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hostel_id: string
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          sharing_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hostel_id?: string
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          sharing_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          ai_summary: string | null
          category: string | null
          created_at: string
          description: string | null
          hostel_id: string
          id: string
          priority: string | null
          resident_name: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          hostel_id: string
          id?: string
          priority?: string | null
          resident_name?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          ai_summary?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          hostel_id?: string
          id?: string
          priority?: string | null
          resident_name?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_images: {
        Row: {
          category: string | null
          created_at: string
          hostel_id: string
          id: string
          sort_order: number
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          hostel_id: string
          id?: string
          sort_order?: number
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          hostel_id?: string
          id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_images_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      hostels: {
        Row: {
          address: string | null
          city: string | null
          college_name: string | null
          created_at: string
          description: string | null
          distance_from_college: string | null
          double_fee: number | null
          email: string | null
          facilities: Json
          hostel_type: Database["public"]["Enums"]["hostel_type"]
          id: string
          is_published: boolean
          latitude: number | null
          longitude: number | null
          maps_link: string | null
          mess_menu: Json
          mess_timings: string | null
          mess_veg_nonveg: string | null
          name: string
          owner_id: string
          phone: string | null
          pincode: string | null
          rating: number
          review_count: number
          rules: string | null
          security_deposit: number | null
          security_info: Json
          single_fee: number | null
          state: string | null
          triple_fee: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          college_name?: string | null
          created_at?: string
          description?: string | null
          distance_from_college?: string | null
          double_fee?: number | null
          email?: string | null
          facilities?: Json
          hostel_type?: Database["public"]["Enums"]["hostel_type"]
          id?: string
          is_published?: boolean
          latitude?: number | null
          longitude?: number | null
          maps_link?: string | null
          mess_menu?: Json
          mess_timings?: string | null
          mess_veg_nonveg?: string | null
          name: string
          owner_id: string
          phone?: string | null
          pincode?: string | null
          rating?: number
          review_count?: number
          rules?: string | null
          security_deposit?: number | null
          security_info?: Json
          single_fee?: number | null
          state?: string | null
          triple_fee?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          college_name?: string | null
          created_at?: string
          description?: string | null
          distance_from_college?: string | null
          double_fee?: number | null
          email?: string | null
          facilities?: Json
          hostel_type?: Database["public"]["Enums"]["hostel_type"]
          id?: string
          is_published?: boolean
          latitude?: number | null
          longitude?: number | null
          maps_link?: string | null
          mess_menu?: Json
          mess_timings?: string | null
          mess_veg_nonveg?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          pincode?: string | null
          rating?: number
          review_count?: number
          rules?: string | null
          security_deposit?: number | null
          security_info?: Json
          single_fee?: number | null
          state?: string | null
          triple_fee?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string
          email: string | null
          hostel_id: string
          id: string
          message: string | null
          name: string
          phone: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          hostel_id: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          status?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          hostel_id?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      residents: {
        Row: {
          created_at: string
          fee_status: string
          hostel_id: string
          id: string
          joining_date: string | null
          name: string
          phone: string | null
          room_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fee_status?: string
          hostel_id: string
          id?: string
          joining_date?: string | null
          name: string
          phone?: string | null
          room_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fee_status?: string
          hostel_id?: string
          id?: string
          joining_date?: string | null
          name?: string
          phone?: string | null
          room_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "residents_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string | null
          comment: string | null
          created_at: string
          hostel_id: string
          id: string
          images: Json
          rating: number
          user_id: string
        }
        Insert: {
          author_name?: string | null
          comment?: string | null
          created_at?: string
          hostel_id: string
          id?: string
          images?: Json
          rating: number
          user_id: string
        }
        Update: {
          author_name?: string | null
          comment?: string | null
          created_at?: string
          hostel_id?: string
          id?: string
          images?: Json
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string
          hostel_id: string
          id: string
          monthly_fee: number | null
          occupied_beds: number
          room_number: string
          room_type: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          hostel_id: string
          id?: string
          monthly_fee?: number | null
          occupied_beds?: number
          room_number: string
          room_type?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          hostel_id?: string
          id?: string
          monthly_fee?: number | null
          occupied_beds?: number
          room_number?: string
          room_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
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
      hostel_type: "boys" | "girls" | "coliving"
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
      hostel_type: ["boys", "girls", "coliving"],
      notice_priority: ["low", "medium", "high"],
      room_status: ["available", "occupied", "full", "maintenance"],
      sentiment: ["positive", "neutral", "negative"],
    },
  },
} as const
