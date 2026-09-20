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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          status: string | null
          type: string
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          type: string
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          type?: string
          used_by?: string | null
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          amount_pen: number
          created_at: string
          currency: string
          days: number
          id: string
          izipay_order_id: string | null
          izipay_uuid: string | null
          license_key: string | null
          plan_id: string
          raw_response: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_pen: number
          created_at?: string
          currency?: string
          days: number
          id?: string
          izipay_order_id?: string | null
          izipay_uuid?: string | null
          license_key?: string | null
          plan_id: string
          raw_response?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_pen?: number
          created_at?: string
          currency?: string
          days?: number
          id?: string
          izipay_order_id?: string | null
          izipay_uuid?: string | null
          license_key?: string | null
          plan_id?: string
          raw_response?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          phone: string | null
          reseller_api_token: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          phone?: string | null
          reseller_api_token?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          reseller_api_token?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reseller_licenses: {
        Row: {
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          display_name: string | null
          duration_seconds: number | null
          expires_at: string | null
          id: string
          license_key: string
          lifetime: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          display_name?: string | null
          duration_seconds?: number | null
          expires_at?: string | null
          id?: string
          license_key: string
          lifetime?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          display_name?: string | null
          duration_seconds?: number | null
          expires_at?: string | null
          id?: string
          license_key?: string
          lifetime?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      signup_ips: {
        Row: {
          created_at: string
          id: string
          ip: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          credits: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          credits?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          credits?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      _lovable_export_enums: {
        Row: {
          ddl_sql: string | null
          enum_name: unknown
          enum_values: string | null
          schema_name: unknown
        }
        Relationships: []
      }
      _lovable_export_foreign_keys: {
        Row: {
          column_name: unknown
          ddl_sql: string | null
          delete_rule: string | null
          foreign_column_name: unknown
          foreign_table_name: unknown
          foreign_table_schema: unknown
          table_name: unknown
          table_schema: unknown
          update_rule: string | null
        }
        Relationships: []
      }
      _lovable_export_functions: {
        Row: {
          arguments: string | null
          ddl_sql: string | null
          function_name: unknown
          is_security_definer: boolean | null
          language: unknown
          return_type: string | null
          schema_name: unknown
        }
        Relationships: []
      }
      _lovable_export_indexes: {
        Row: {
          ddl_sql: string | null
          index_name: unknown
          schema_name: unknown
          table_name: unknown
        }
        Relationships: []
      }
      _lovable_export_manifest: {
        Row: {
          table_name: unknown
        }
        Relationships: []
      }
      _lovable_export_policies: {
        Row: {
          cmd: string | null
          ddl_sql: string | null
          permissive: string | null
          policyname: unknown
          qual: string | null
          roles_list: string | null
          schemaname: unknown
          tablename: unknown
          with_check: string | null
        }
        Relationships: []
      }
      _lovable_export_table_columns: {
        Row: {
          character_maximum_length: number | null
          column_default: string | null
          column_name: unknown
          data_type: string | null
          formatted_type: unknown
          is_nullable: string | null
          is_primary_key: boolean | null
          numeric_precision: number | null
          numeric_scale: number | null
          ordinal_position: number | null
          table_name: unknown
          table_schema: unknown
          udt_name: unknown
        }
        Relationships: []
      }
      _lovable_export_triggers: {
        Row: {
          ddl_sql: string | null
          schema_name: unknown
          table_name: unknown
          trigger_name: unknown
        }
        Relationships: []
      }
      _lovable_export_vault_secrets: {
        Row: {
          created_at: string | null
          decrypted_secret: string | null
          description: string | null
          id: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          decrypted_secret?: never
          description?: string | null
          id?: never
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          decrypted_secret?: never
          description?: string | null
          id?: never
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_credits: {
        Args: { _amount: number; _target: string }
        Returns: number
      }
      consume_credit: { Args: never; Returns: boolean }
      is_superadmin: { Args: { _user_id: string }; Returns: boolean }
      refund_credit: { Args: never; Returns: number }
      set_user_role: {
        Args: { _role: string; _target: string }
        Returns: string
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
