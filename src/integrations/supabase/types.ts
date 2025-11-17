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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      politician_expenses: {
        Row: {
          category: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          month: number
          politician_id: number | null
          value: number
          year: number
        }
        Insert: {
          category: string
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          month: number
          politician_id?: number | null
          value: number
          year: number
        }
        Update: {
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          month?: number
          politician_id?: number | null
          value?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "politician_expenses_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      politician_scores: {
        Row: {
          calculated_at: string
          gastos: number
          outros: number
          politician_id: number
          processos: number
          score_total: number
          votacoes: number
        }
        Insert: {
          calculated_at?: string
          gastos?: number
          outros?: number
          politician_id: number
          processos?: number
          score_total: number
          votacoes?: number
        }
        Update: {
          calculated_at?: string
          gastos?: number
          outros?: number
          politician_id?: number
          processos?: number
          score_total?: number
          votacoes?: number
        }
        Relationships: [
          {
            foreignKeyName: "politician_scores_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: true
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      politician_votes: {
        Row: {
          created_at: string | null
          date: string
          id: string
          politician_id: number | null
          proposition_id: string
          proposition_title: string
          vote: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          politician_id?: number | null
          proposition_id: string
          proposition_title: string
          vote: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          politician_id?: number | null
          proposition_id?: string
          proposition_title?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "politician_votes_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      politicians: {
        Row: {
          created_at: string | null
          email: string | null
          id: number
          name: string
          party: string
          photo: string | null
          role: string
          state: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: number
          name: string
          party: string
          photo?: string | null
          role: string
          state: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: number
          name?: string
          party?: string
          photo?: string | null
          role?: string
          state?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      propositions: {
        Row: {
          author: string | null
          created_at: string | null
          date: string
          id: string
          number: string
          status: string
          summary: string
          type: string
          updated_at: string | null
          year: string
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          date: string
          id: string
          number: string
          status: string
          summary: string
          type: string
          updated_at?: string | null
          year: string
        }
        Update: {
          author?: string | null
          created_at?: string | null
          date?: string
          id?: string
          number?: string
          status?: string
          summary?: string
          type?: string
          updated_at?: string | null
          year?: string
        }
        Relationships: []
      }
      user_alert_preferences: {
        Row: {
          alert_high_expenses: boolean | null
          alert_important_votes: boolean | null
          alert_new_laws: boolean | null
          created_at: string | null
          expense_threshold: number | null
          id: string
          politician_id: number | null
          state: string | null
          user_id: string | null
        }
        Insert: {
          alert_high_expenses?: boolean | null
          alert_important_votes?: boolean | null
          alert_new_laws?: boolean | null
          created_at?: string | null
          expense_threshold?: number | null
          id?: string
          politician_id?: number | null
          state?: string | null
          user_id?: string | null
        }
        Update: {
          alert_high_expenses?: boolean | null
          alert_important_votes?: boolean | null
          alert_new_laws?: boolean | null
          created_at?: string | null
          expense_threshold?: number | null
          id?: string
          politician_id?: number | null
          state?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_alerts: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_read: boolean | null
          related_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
