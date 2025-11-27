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
      campaign_participants: {
        Row: {
          campaign_id: string
          enrolled_at: string
          id: string
          rewards_earned: number
          total_bonus_earned: number
          user_id: string
        }
        Insert: {
          campaign_id: string
          enrolled_at?: string
          id?: string
          rewards_earned?: number
          total_bonus_earned?: number
          user_id: string
        }
        Update: {
          campaign_id?: string
          enrolled_at?: string
          id?: string
          rewards_earned?: number
          total_bonus_earned?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promotional_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_rewards: {
        Row: {
          bonus_reward_value: number
          campaign_id: string
          created_at: string
          id: string
          original_reward_value: number
          referral_id: string | null
          total_reward_value: number
          user_id: string
        }
        Insert: {
          bonus_reward_value: number
          campaign_id: string
          created_at?: string
          id?: string
          original_reward_value: number
          referral_id?: string | null
          total_reward_value: number
          user_id: string
        }
        Update: {
          bonus_reward_value?: number
          campaign_id?: string
          created_at?: string
          id?: string
          original_reward_value?: number
          referral_id?: string | null
          total_reward_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_rewards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promotional_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "partner_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      free_months_rewards: {
        Row: {
          created_at: string | null
          id: string
          months_earned: number
          months_used: number
          referral_id: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          months_earned?: number
          months_used?: number
          referral_id?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          months_earned?: number
          months_used?: number
          referral_id?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "free_months_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          regenerated_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          regenerated_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          regenerated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      partner_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: Database["public"]["Enums"]["partner_event_type"]
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: Database["public"]["Enums"]["partner_event_type"]
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: Database["public"]["Enums"]["partner_event_type"]
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_referrals: {
        Row: {
          code_used: string
          confirmed_at: string | null
          created_at: string
          id: string
          partner_user_id: string
          referred_user_id: string
          status: Database["public"]["Enums"]["referral_status"]
        }
        Insert: {
          code_used: string
          confirmed_at?: string | null
          created_at?: string
          id?: string
          partner_user_id: string
          referred_user_id: string
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Update: {
          code_used?: string
          confirmed_at?: string | null
          created_at?: string
          id?: string
          partner_user_id?: string
          referred_user_id?: string
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Relationships: []
      }
      partner_rewards: {
        Row: {
          granted_at: string
          id: string
          partner_user_id: string
          referral_id: string
          reward_type: string
          reward_value: number
        }
        Insert: {
          granted_at?: string
          id?: string
          partner_user_id: string
          referral_id: string
          reward_type: string
          reward_value?: number
        }
        Update: {
          granted_at?: string
          id?: string
          partner_user_id?: string
          referral_id?: string
          reward_type?: string
          reward_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "partner_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "partner_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_campaigns: {
        Row: {
          activated_at: string | null
          applies_to_reward_types: string[] | null
          banner_color: string | null
          banner_text: string | null
          bonus_type: Database["public"]["Enums"]["campaign_bonus_type"]
          bonus_value: number
          campaign_code: string | null
          created_at: string
          created_by: string | null
          current_uses: number
          description: string | null
          end_date: string
          id: string
          is_public: boolean
          max_uses: number | null
          min_referrals: number | null
          name: string
          start_date: string
          status: Database["public"]["Enums"]["campaign_status"]
          target_user_segment: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          applies_to_reward_types?: string[] | null
          banner_color?: string | null
          banner_text?: string | null
          bonus_type?: Database["public"]["Enums"]["campaign_bonus_type"]
          bonus_value: number
          campaign_code?: string | null
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          end_date: string
          id?: string
          is_public?: boolean
          max_uses?: number | null
          min_referrals?: number | null
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["campaign_status"]
          target_user_segment?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          applies_to_reward_types?: string[] | null
          banner_color?: string | null
          banner_text?: string | null
          bonus_type?: Database["public"]["Enums"]["campaign_bonus_type"]
          bonus_value?: number
          campaign_code?: string | null
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          end_date?: string
          id?: string
          is_public?: boolean
          max_uses?: number | null
          min_referrals?: number | null
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          target_user_segment?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          status: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          status?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_user_id?: string
          referrer_user_id?: string
          status?: string | null
        }
        Relationships: []
      }
      reward_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          required_action: string | null
          requires_referral_action: boolean
          reward_type: Database["public"]["Enums"]["reward_type"]
          reward_unit: string | null
          reward_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          required_action?: string | null
          requires_referral_action?: boolean
          reward_type: Database["public"]["Enums"]["reward_type"]
          reward_unit?: string | null
          reward_value: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          required_action?: string | null
          requires_referral_action?: boolean
          reward_type?: Database["public"]["Enums"]["reward_type"]
          reward_unit?: string | null
          reward_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      reward_transactions: {
        Row: {
          amount: number | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          reward_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reward_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reward_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_transactions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "user_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          activated_at: string | null
          earned_at: string
          expires_at: string | null
          id: string
          metadata: Json | null
          reward_config_id: string
          reward_type: Database["public"]["Enums"]["reward_type"]
          reward_unit: string | null
          reward_value: number
          source_referral_id: string | null
          status: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          earned_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          reward_config_id: string
          reward_type: Database["public"]["Enums"]["reward_type"]
          reward_unit?: string | null
          reward_value: number
          source_referral_id?: string | null
          status?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          earned_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          reward_config_id?: string
          reward_type?: Database["public"]["Enums"]["reward_type"]
          reward_unit?: string | null
          reward_value?: number
          source_referral_id?: string | null
          status?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_config_id_fkey"
            columns: ["reward_config_id"]
            isOneToOne: false
            referencedRelation: "reward_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_source_referral_id_fkey"
            columns: ["source_referral_id"]
            isOneToOne: false
            referencedRelation: "partner_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_campaign_bonus_to_reward: {
        Args: {
          p_base_reward_value: number
          p_referral_id: string
          p_reward_type: Database["public"]["Enums"]["reward_type"]
          p_user_id: string
        }
        Returns: {
          bonus_value: number
          campaign_id: string
          campaign_name: string
          total_value: number
        }[]
      }
      calculate_campaign_bonus: {
        Args: {
          p_base_value: number
          p_bonus_type: Database["public"]["Enums"]["campaign_bonus_type"]
          p_bonus_value: number
        }
        Returns: number
      }
      check_referral_code_available: {
        Args: { code_to_check: string }
        Returns: boolean
      }
      distribute_referral_reward: {
        Args: {
          p_partner_user_id: string
          p_referral_id: string
          p_referred_user_id: string
        }
        Returns: boolean
      }
      generate_partner_code: { Args: never; Returns: string }
      get_active_campaigns: {
        Args: never
        Returns: {
          activated_at: string | null
          applies_to_reward_types: string[] | null
          banner_color: string | null
          banner_text: string | null
          bonus_type: Database["public"]["Enums"]["campaign_bonus_type"]
          bonus_value: number
          campaign_code: string | null
          created_at: string
          created_by: string | null
          current_uses: number
          description: string | null
          end_date: string
          id: string
          is_public: boolean
          max_uses: number | null
          min_referrals: number | null
          name: string
          start_date: string
          status: Database["public"]["Enums"]["campaign_status"]
          target_user_segment: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "promotional_campaigns"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_referrer_by_code: {
        Args: { referral_code: string }
        Returns: {
          code: string
          user_id: string
        }[]
      }
      get_user_available_credits: {
        Args: { p_user_id: string }
        Returns: number
      }
      log_partner_event: {
        Args: {
          p_event_data?: Json
          p_event_type: Database["public"]["Enums"]["partner_event_type"]
          p_user_id: string
        }
        Returns: string
      }
      process_referral_reward: {
        Args: { referral_id_param: string }
        Returns: undefined
      }
      update_campaign_statuses: { Args: never; Returns: undefined }
    }
    Enums: {
      campaign_bonus_type: "multiplier" | "fixed_bonus" | "percentage_increase"
      campaign_status:
        | "draft"
        | "scheduled"
        | "active"
        | "expired"
        | "cancelled"
      partner_event_type:
        | "code_generated"
        | "code_regenerated"
        | "code_claimed"
        | "referral_confirmed"
        | "payout_requested"
      referral_status: "pending" | "confirmed" | "rewarded"
      reward_type: "credit" | "discount" | "trial_extension" | "premium_access"
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
      campaign_bonus_type: ["multiplier", "fixed_bonus", "percentage_increase"],
      campaign_status: ["draft", "scheduled", "active", "expired", "cancelled"],
      partner_event_type: [
        "code_generated",
        "code_regenerated",
        "code_claimed",
        "referral_confirmed",
        "payout_requested",
      ],
      referral_status: ["pending", "confirmed", "rewarded"],
      reward_type: ["credit", "discount", "trial_extension", "premium_access"],
    },
  },
} as const
