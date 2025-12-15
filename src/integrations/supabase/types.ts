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
      audit_findings: {
        Row: {
          audit_id: string | null
          closed_date: string | null
          corrective_action: string | null
          created_at: string
          description: string
          finding_type: string
          id: string
          severity: string
          status: string
          target_date: string | null
          updated_at: string
        }
        Insert: {
          audit_id?: string | null
          closed_date?: string | null
          corrective_action?: string | null
          created_at?: string
          description: string
          finding_type: string
          id?: string
          severity?: string
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          audit_id?: string | null
          closed_date?: string | null
          corrective_action?: string | null
          created_at?: string
          description?: string
          finding_type?: string
          id?: string
          severity?: string
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_findings_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      auditors: {
        Row: {
          audits_completed: number | null
          certification_number: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          rating: number | null
          specialization: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audits_completed?: number | null
          certification_number?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          rating?: number | null
          specialization?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audits_completed?: number | null
          certification_number?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          rating?: number | null
          specialization?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audits: {
        Row: {
          audit_type: string
          auditor_name: string | null
          completed_date: string | null
          created_at: string
          findings_count: number | null
          id: string
          location: string | null
          notes: string | null
          scheduled_date: string
          score: number | null
          status: string
          updated_at: string
          user_id: string | null
          vessel_id: string | null
        }
        Insert: {
          audit_type: string
          auditor_name?: string | null
          completed_date?: string | null
          created_at?: string
          findings_count?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          scheduled_date: string
          score?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
          vessel_id?: string | null
        }
        Update: {
          audit_type?: string
          auditor_name?: string | null
          completed_date?: string | null
          created_at?: string
          findings_count?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          scheduled_date?: string
          score?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audits_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      cii_records: {
        Row: {
          cargo_carried: number | null
          cii_rating: string
          cii_value: number
          created_at: string
          distance_travelled: number | null
          fuel_consumption: number | null
          id: string
          notes: string | null
          target_value: number | null
          updated_at: string
          user_id: string
          vessel_id: string | null
          year: number
        }
        Insert: {
          cargo_carried?: number | null
          cii_rating: string
          cii_value: number
          created_at?: string
          distance_travelled?: number | null
          fuel_consumption?: number | null
          id?: string
          notes?: string | null
          target_value?: number | null
          updated_at?: string
          user_id: string
          vessel_id?: string | null
          year: number
        }
        Update: {
          cargo_carried?: number | null
          cii_rating?: string
          cii_value?: number
          created_at?: string
          distance_travelled?: number | null
          fuel_consumption?: number | null
          id?: string
          notes?: string | null
          target_value?: number | null
          updated_at?: string
          user_id?: string
          vessel_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cii_records_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          created_at: string
          id: string
          message: string
          priority: string | null
          read_at: string | null
          recipient_name: string | null
          sender_name: string | null
          sent_at: string
          status: string
          subject: string
          user_id: string
          vessel_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          priority?: string | null
          read_at?: string | null
          recipient_name?: string | null
          sender_name?: string | null
          sent_at?: string
          status?: string
          subject: string
          user_id: string
          vessel_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          priority?: string | null
          read_at?: string | null
          recipient_name?: string | null
          sender_name?: string | null
          sent_at?: string
          status?: string
          subject?: string
          user_id?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      corrective_actions: {
        Row: {
          action_description: string
          completed_date: string | null
          created_at: string
          due_date: string | null
          evidence_url: string | null
          finding_id: string | null
          id: string
          notes: string | null
          responsible_person: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_description: string
          completed_date?: string | null
          created_at?: string
          due_date?: string | null
          evidence_url?: string | null
          finding_id?: string | null
          id?: string
          notes?: string | null
          responsible_person?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_description?: string
          completed_date?: string | null
          created_at?: string
          due_date?: string | null
          evidence_url?: string | null
          finding_id?: string | null
          id?: string
          notes?: string | null
          responsible_person?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "corrective_actions_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "audit_findings"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_members: {
        Row: {
          certificate_expiry: string | null
          certificate_number: string | null
          contract_end: string | null
          contract_start: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          nationality: string | null
          phone: string | null
          rank: string
          status: string | null
          updated_at: string
          user_id: string | null
          vessel_id: string | null
        }
        Insert: {
          certificate_expiry?: string | null
          certificate_number?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          nationality?: string | null
          phone?: string | null
          rank: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
          vessel_id?: string | null
        }
        Update: {
          certificate_expiry?: string | null
          certificate_number?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          nationality?: string | null
          phone?: string | null
          rank?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          corrective_actions: string | null
          created_at: string
          description: string | null
          id: string
          incident_date: string
          incident_type: string
          investigation_status: string | null
          location: string | null
          reported_by: string | null
          root_cause: string | null
          severity: string
          title: string
          updated_at: string
          user_id: string | null
          vessel_id: string | null
        }
        Insert: {
          corrective_actions?: string | null
          created_at?: string
          description?: string | null
          id?: string
          incident_date: string
          incident_type: string
          investigation_status?: string | null
          location?: string | null
          reported_by?: string | null
          root_cause?: string | null
          severity?: string
          title: string
          updated_at?: string
          user_id?: string | null
          vessel_id?: string | null
        }
        Update: {
          corrective_actions?: string | null
          created_at?: string
          description?: string | null
          id?: string
          incident_date?: string
          incident_type?: string
          investigation_status?: string | null
          location?: string | null
          reported_by?: string | null
          root_cause?: string | null
          severity?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_claims: {
        Row: {
          approved_amount: number | null
          claim_amount: number | null
          claim_number: string | null
          claim_type: string
          created_at: string
          description: string | null
          id: string
          incident_date: string | null
          insurer_name: string | null
          policy_number: string | null
          resolved_date: string | null
          status: string
          submitted_date: string | null
          updated_at: string
          user_id: string
          vessel_id: string | null
        }
        Insert: {
          approved_amount?: number | null
          claim_amount?: number | null
          claim_number?: string | null
          claim_type: string
          created_at?: string
          description?: string | null
          id?: string
          incident_date?: string | null
          insurer_name?: string | null
          policy_number?: string | null
          resolved_date?: string | null
          status?: string
          submitted_date?: string | null
          updated_at?: string
          user_id: string
          vessel_id?: string | null
        }
        Update: {
          approved_amount?: number | null
          claim_amount?: number | null
          claim_number?: string | null
          claim_type?: string
          created_at?: string
          description?: string | null
          id?: string
          incident_date?: string | null
          insurer_name?: string | null
          policy_number?: string | null
          resolved_date?: string | null
          status?: string
          submitted_date?: string | null
          updated_at?: string
          user_id?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tasks: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          assigned_to: string | null
          completed_date: string | null
          cost_estimate: number | null
          created_at: string
          description: string | null
          due_date: string
          estimated_hours: number | null
          id: string
          notes: string | null
          priority: string
          status: string
          task_type: string
          title: string
          updated_at: string
          user_id: string | null
          vessel_id: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          cost_estimate?: number | null
          created_at?: string
          description?: string | null
          due_date: string
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          task_type?: string
          title: string
          updated_at?: string
          user_id?: string | null
          vessel_id?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          cost_estimate?: number | null
          created_at?: string
          description?: string | null
          due_date?: string
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          completed_date: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          name: string
          progress: number | null
          project_type: string | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
          vessel_count: number | null
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          progress?: number | null
          project_type?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vessel_count?: number | null
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          progress?: number | null
          project_type?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vessel_count?: number | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          generated_at: string
          id: string
          parameters: Json | null
          report_type: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          generated_at?: string
          id?: string
          parameters?: Json | null
          report_type: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          generated_at?: string
          id?: string
          parameters?: Json | null
          report_type?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      vessel_certifications: {
        Row: {
          certificate_name: string
          certificate_type: string
          created_at: string
          document_url: string | null
          expiry_date: string
          id: string
          issue_date: string | null
          issuing_authority: string | null
          notes: string | null
          status: string
          updated_at: string
          user_id: string
          vessel_id: string | null
        }
        Insert: {
          certificate_name: string
          certificate_type: string
          created_at?: string
          document_url?: string | null
          expiry_date: string
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vessel_id?: string | null
        }
        Update: {
          certificate_name?: string
          certificate_type?: string
          created_at?: string
          document_url?: string | null
          expiry_date?: string
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vessel_certifications_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      vessels: {
        Row: {
          call_sign: string | null
          classification_society: string | null
          created_at: string
          deadweight: number | null
          flag_state: string | null
          gross_tonnage: number | null
          id: string
          imo_number: string | null
          mmsi_number: string | null
          name: string
          status: string | null
          updated_at: string
          user_id: string | null
          vessel_type: string | null
          year_built: number | null
        }
        Insert: {
          call_sign?: string | null
          classification_society?: string | null
          created_at?: string
          deadweight?: number | null
          flag_state?: string | null
          gross_tonnage?: number | null
          id?: string
          imo_number?: string | null
          mmsi_number?: string | null
          name: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
          vessel_type?: string | null
          year_built?: number | null
        }
        Update: {
          call_sign?: string | null
          classification_society?: string | null
          created_at?: string
          deadweight?: number | null
          flag_state?: string | null
          gross_tonnage?: number | null
          id?: string
          imo_number?: string | null
          mmsi_number?: string | null
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
          vessel_type?: string | null
          year_built?: number | null
        }
        Relationships: []
      }
      voyages: {
        Row: {
          arrival_date: string | null
          cargo_quantity: number | null
          cargo_type: string | null
          created_at: string
          departure_date: string | null
          destination_port: string
          eta: string | null
          id: string
          notes: string | null
          origin_port: string
          status: string
          updated_at: string
          user_id: string
          vessel_id: string | null
          voyage_number: string | null
        }
        Insert: {
          arrival_date?: string | null
          cargo_quantity?: number | null
          cargo_type?: string | null
          created_at?: string
          departure_date?: string | null
          destination_port: string
          eta?: string | null
          id?: string
          notes?: string | null
          origin_port: string
          status?: string
          updated_at?: string
          user_id: string
          vessel_id?: string | null
          voyage_number?: string | null
        }
        Update: {
          arrival_date?: string | null
          cargo_quantity?: number | null
          cargo_type?: string | null
          created_at?: string
          departure_date?: string | null
          destination_port?: string
          eta?: string | null
          id?: string
          notes?: string | null
          origin_port?: string
          status?: string
          updated_at?: string
          user_id?: string
          vessel_id?: string | null
          voyage_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voyages_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
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
