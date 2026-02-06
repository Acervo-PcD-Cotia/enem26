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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string
          created_at: string
          description: string
          icon: string | null
          id: string
          name: string
          points: number | null
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          name: string
          points?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_accepted: boolean | null
          parent_comment_id: string | null
          post_id: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_accepted?: boolean | null
          parent_comment_id?: string | null
          post_id: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_accepted?: boolean | null
          parent_comment_id?: string | null
          post_id?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_type: string
          status: string | null
          subject_id: string | null
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_type: string
          status?: string | null
          subject_id?: string | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_type?: string
          status?: string | null
          subject_id?: string | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      community_resources: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          resource_type: string
          source: string | null
          subject_id: string | null
          title: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          resource_type: string
          source?: string | null
          subject_id?: string | null
          title: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          resource_type?: string
          source?: string | null
          subject_id?: string | null
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_resources_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplines: {
        Row: {
          code: string
          color: string
          created_at: string
          display_order: number
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          color: string
          created_at?: string
          display_order: number
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          color?: string
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      essays: {
        Row: {
          competency_1: number | null
          competency_2: number | null
          competency_3: number | null
          competency_4: number | null
          competency_5: number | null
          content: string | null
          created_at: string
          feedback: string | null
          id: string
          scheduled_date: string
          submitted_at: string | null
          theme: string
          total_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          competency_1?: number | null
          competency_2?: number | null
          competency_3?: number | null
          competency_4?: number | null
          competency_5?: number | null
          content?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          scheduled_date: string
          submitted_at?: string | null
          theme: string
          total_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          competency_1?: number | null
          competency_2?: number | null
          competency_3?: number | null
          competency_4?: number | null
          competency_5?: number | null
          content?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          scheduled_date?: string
          submitted_at?: string | null
          theme?: string
          total_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          back_content: string
          created_at: string
          front_content: string
          id: string
          source_id: string | null
          source_type: string | null
          subject_id: string
          user_id: string
        }
        Insert: {
          back_content: string
          created_at?: string
          front_content: string
          id?: string
          source_id?: string | null
          source_type?: string | null
          subject_id: string
          user_id: string
        }
        Update: {
          back_content?: string
          created_at?: string
          front_content?: string
          id?: string
          source_id?: string | null
          source_type?: string | null
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_exams: {
        Row: {
          created_at: string
          exam_date: string
          exam_name: string
          id: string
          notes: string | null
          score_essay: number | null
          score_humanities: number | null
          score_languages: number | null
          score_math: number | null
          score_nature: number | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          exam_date: string
          exam_name: string
          id?: string
          notes?: string | null
          score_essay?: number | null
          score_humanities?: number | null
          score_languages?: number | null
          score_math?: number | null
          score_nature?: number | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          exam_date?: string
          exam_name?: string
          id?: string
          notes?: string | null
          score_essay?: number | null
          score_humanities?: number | null
          score_languages?: number | null
          score_math?: number | null
          score_nature?: number | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          available_days_per_week: number | null
          avatar_url: string | null
          created_at: string
          current_level: string | null
          full_name: string | null
          hours_per_day: number | null
          id: string
          last_study_date: string | null
          onboarding_completed: boolean | null
          streak_count: number | null
          target_course: string | null
          target_score: number | null
          target_university: string | null
          tour_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_days_per_week?: number | null
          avatar_url?: string | null
          created_at?: string
          current_level?: string | null
          full_name?: string | null
          hours_per_day?: number | null
          id?: string
          last_study_date?: string | null
          onboarding_completed?: boolean | null
          streak_count?: number | null
          target_course?: string | null
          target_score?: number | null
          target_university?: string | null
          tour_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_days_per_week?: number | null
          avatar_url?: string | null
          created_at?: string
          current_level?: string | null
          full_name?: string | null
          hours_per_day?: number | null
          id?: string
          last_study_date?: string | null
          onboarding_completed?: boolean | null
          streak_count?: number | null
          target_course?: string | null
          target_score?: number | null
          target_university?: string | null
          tour_completed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_responses: {
        Row: {
          created_at: string
          error_reason: Database["public"]["Enums"]["error_reason"] | null
          id: string
          is_correct: boolean
          question_id: string
          selected_option: number
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          error_reason?: Database["public"]["Enums"]["error_reason"] | null
          id?: string
          is_correct: boolean
          question_id: string
          selected_option: number
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          error_reason?: Database["public"]["Enums"]["error_reason"] | null
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_option?: number
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_option: number
          created_at: string
          difficulty: number | null
          explanation: string | null
          id: string
          options: Json
          question_text: string
          source: string | null
          subject_id: string
          year: number | null
        }
        Insert: {
          correct_option: number
          created_at?: string
          difficulty?: number | null
          explanation?: string | null
          id?: string
          options: Json
          question_text: string
          source?: string | null
          subject_id: string
          year?: number | null
        }
        Update: {
          correct_option?: number
          created_at?: string
          difficulty?: number | null
          explanation?: string | null
          id?: string
          options?: Json
          question_text?: string
          source?: string | null
          subject_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      rpa_reviews: {
        Row: {
          completed_date: string | null
          created_at: string
          id: string
          interval: Database["public"]["Enums"]["rpa_interval"]
          review_type: string | null
          scheduled_date: string
          score: number | null
          status: Database["public"]["Enums"]["task_status"]
          study_session_id: string | null
          subject_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          id?: string
          interval: Database["public"]["Enums"]["rpa_interval"]
          review_type?: string | null
          scheduled_date: string
          score?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          study_session_id?: string | null
          subject_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          id?: string
          interval?: Database["public"]["Enums"]["rpa_interval"]
          review_type?: string | null
          scheduled_date?: string
          score?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          study_session_id?: string | null
          subject_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rpa_reviews_study_session_id_fkey"
            columns: ["study_session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rpa_reviews_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          scheduled_date: string
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          subject_id: string
          task_type: Database["public"]["Enums"]["task_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          scheduled_date: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          subject_id: string
          task_type: Database["public"]["Enums"]["task_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          scheduled_date?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          subject_id?: string
          task_type?: Database["public"]["Enums"]["task_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_materials: {
        Row: {
          created_at: string | null
          description: string | null
          external_url: string | null
          file_url: string | null
          id: string
          material_type: string
          source: string | null
          subject_id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          material_type: string
          source?: string | null
          subject_id: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          material_type?: string
          source?: string | null
          subject_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_materials_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          discipline_id: string
          display_order: number
          estimated_hours: number | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discipline_id: string
          display_order: number
          estimated_hours?: number | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discipline_id?: string
          display_order?: number
          estimated_hours?: number | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_area_assessment: {
        Row: {
          created_at: string
          discipline_id: string
          id: string
          self_rating: number
          user_id: string
        }
        Insert: {
          created_at?: string
          discipline_id: string
          id?: string
          self_rating: number
          user_id: string
        }
        Update: {
          created_at?: string
          discipline_id?: string
          id?: string
          self_rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_area_assessment_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subject_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          difficulty_rating: number | null
          id: string
          started_at: string | null
          status: Database["public"]["Enums"]["subject_status"]
          subject_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          difficulty_rating?: number | null
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["subject_status"]
          subject_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          difficulty_rating?: number | null
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["subject_status"]
          subject_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subject_progress_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_checkins: {
        Row: {
          ai_recommendations: string | null
          consistency_rating: number | null
          created_at: string
          discipline_rating: number | null
          energy_rating: number | null
          focus_rating: number | null
          id: string
          motivation_rating: number | null
          sleep_rating: number | null
          user_id: string
          week_start: string
        }
        Insert: {
          ai_recommendations?: string | null
          consistency_rating?: number | null
          created_at?: string
          discipline_rating?: number | null
          energy_rating?: number | null
          focus_rating?: number | null
          id?: string
          motivation_rating?: number | null
          sleep_rating?: number | null
          user_id: string
          week_start: string
        }
        Update: {
          ai_recommendations?: string | null
          consistency_rating?: number | null
          created_at?: string
          discipline_rating?: number | null
          energy_rating?: number | null
          focus_rating?: number | null
          id?: string
          motivation_rating?: number | null
          sleep_rating?: number | null
          user_id?: string
          week_start?: string
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
    }
    Enums: {
      app_role: "admin" | "user"
      error_reason: "content" | "interpretation" | "attention" | "time"
      rpa_interval: "24h" | "7d" | "15d" | "30d" | "60d" | "120d" | "180d"
      subject_status: "not_started" | "studying" | "reviewing" | "consolidated"
      task_status: "pending" | "completed" | "postponed" | "difficulty"
      task_type: "study" | "rpa_review" | "questions" | "essay"
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
      app_role: ["admin", "user"],
      error_reason: ["content", "interpretation", "attention", "time"],
      rpa_interval: ["24h", "7d", "15d", "30d", "60d", "120d", "180d"],
      subject_status: ["not_started", "studying", "reviewing", "consolidated"],
      task_status: ["pending", "completed", "postponed", "difficulty"],
      task_type: ["study", "rpa_review", "questions", "essay"],
    },
  },
} as const
