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
          photo_url: string | null
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
          photo_url?: string | null
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
          photo_url?: string | null
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
      custom_regulations: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string | null
          file_name: string | null
          file_url: string | null
          id: string
          link: string | null
          notes: string | null
          title: string
          updated_at: string
          user_id: string
          version: string | null
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          link?: string | null
          notes?: string | null
          title: string
          updated_at?: string
          user_id: string
          version?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          link?: string | null
          notes?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          version?: string | null
        }
        Relationships: []
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
      project_vessels: {
        Row: {
          audit_type: string | null
          created_at: string
          id: string
          notes: string | null
          planned_audit_date: string | null
          project_id: string
          vessel_id: string
        }
        Insert: {
          audit_type?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          planned_audit_date?: string | null
          project_id: string
          vessel_id: string
        }
        Update: {
          audit_type?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          planned_audit_date?: string | null
          project_id?: string
          vessel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_vessels_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_vessels_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number | null
          budget: number | null
          completed_date: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          priority: string | null
          progress: number | null
          project_manager: string | null
          project_type: string | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
          vessel_count: number | null
        }
        Insert: {
          actual_cost?: number | null
          budget?: number | null
          completed_date?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          priority?: string | null
          progress?: number | null
          project_manager?: string | null
          project_type?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vessel_count?: number | null
        }
        Update: {
          actual_cost?: number | null
          budget?: number | null
          completed_date?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          priority?: string | null
          progress?: number | null
          project_manager?: string | null
          project_type?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vessel_count?: number | null
        }
        Relationships: []
      }
      regulation_vessels: {
        Row: {
          compliance_status: string
          created_at: string
          id: string
          notes: string | null
          regulation_id: string
          vessel_id: string
        }
        Insert: {
          compliance_status?: string
          created_at?: string
          id?: string
          notes?: string | null
          regulation_id: string
          vessel_id: string
        }
        Update: {
          compliance_status?: string
          created_at?: string
          id?: string
          notes?: string | null
          regulation_id?: string
          vessel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "regulation_vessels_regulation_id_fkey"
            columns: ["regulation_id"]
            isOneToOne: false
            referencedRelation: "custom_regulations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regulation_vessels_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
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
      setup_audit_types: {
        Row: {
          audit_type_name: string
          created_at: string
          description: string | null
          frequency_months: number | null
          id: string
          is_external: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audit_type_name: string
          created_at?: string
          description?: string | null
          frequency_months?: number | null
          id?: string
          is_external?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audit_type_name?: string
          created_at?: string
          description?: string | null
          frequency_months?: number | null
          id?: string
          is_external?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      setup_certificate_types: {
        Row: {
          certificate_category: string
          certificate_name: string
          created_at: string
          id: string
          is_mandatory: boolean | null
          issuing_authority: string | null
          updated_at: string
          user_id: string
          validity_months: number | null
        }
        Insert: {
          certificate_category: string
          certificate_name: string
          created_at?: string
          id?: string
          is_mandatory?: boolean | null
          issuing_authority?: string | null
          updated_at?: string
          user_id: string
          validity_months?: number | null
        }
        Update: {
          certificate_category?: string
          certificate_name?: string
          created_at?: string
          id?: string
          is_mandatory?: boolean | null
          issuing_authority?: string | null
          updated_at?: string
          user_id?: string
          validity_months?: number | null
        }
        Relationships: []
      }
      setup_classification_societies: {
        Row: {
          abbreviation: string | null
          created_at: string
          id: string
          society_name: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          abbreviation?: string | null
          created_at?: string
          id?: string
          society_name: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          abbreviation?: string | null
          created_at?: string
          id?: string
          society_name?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      setup_companies: {
        Row: {
          address: string | null
          company_type: string
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          remarks: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company_type: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          remarks?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company_type?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          remarks?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      setup_contract_types: {
        Row: {
          contract_name: string
          created_at: string
          description: string | null
          duration_months: number | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contract_name: string
          created_at?: string
          description?: string | null
          duration_months?: number | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contract_name?: string
          created_at?: string
          description?: string | null
          duration_months?: number | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      setup_crew_ranks: {
        Row: {
          created_at: string
          department: string | null
          id: string
          is_officer: boolean | null
          rank_name: string
          rank_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          is_officer?: boolean | null
          rank_name: string
          rank_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          is_officer?: boolean | null
          rank_name?: string
          rank_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      setup_currencies: {
        Row: {
          created_at: string
          currency_code: string
          currency_name: string
          id: string
          symbol: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency_code: string
          currency_name: string
          id?: string
          symbol?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          currency_name?: string
          id?: string
          symbol?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      setup_finding_statuses: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_closed: boolean | null
          status_name: string
          status_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_closed?: boolean | null
          status_name: string
          status_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_closed?: boolean | null
          status_name?: string
          status_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      setup_finding_types: {
        Row: {
          created_at: string
          description: string | null
          finding_type_name: string
          id: string
          severity: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          finding_type_name: string
          id?: string
          severity?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          finding_type_name?: string
          id?: string
          severity?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      setup_flag_states: {
        Row: {
          created_at: string
          flag_code: string | null
          flag_name: string
          id: string
          risk_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flag_code?: string | null
          flag_name: string
          id?: string
          risk_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          flag_code?: string | null
          flag_name?: string
          id?: string
          risk_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      setup_nationalities: {
        Row: {
          country_code: string | null
          country_name: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          country_code?: string | null
          country_name: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          country_code?: string | null
          country_name?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      setup_root_causes: {
        Row: {
          category: string | null
          cause_name: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          cause_name: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          cause_name?: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          user_id?: string
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
          beam: number | null
          call_sign: string | null
          cargo_capacity: number | null
          class_number: string | null
          classification_society: string | null
          created_at: string
          crew_capacity: number | null
          currency: string | null
          deadweight: number | null
          delivery_date: string | null
          depth: number | null
          draft: number | null
          engine_make: string | null
          engine_model: string | null
          engine_power: number | null
          flag_state: string | null
          fuel_consumption: number | null
          fuel_type: string | null
          gross_tonnage: number | null
          hull_coating: string | null
          hull_material: string | null
          id: string
          imo_number: string | null
          insurance_value: number | null
          ism_manager_id: string | null
          keel_laid_date: string | null
          last_drydock_date: string | null
          length_overall: number | null
          lifeboats: number | null
          liferafts: number | null
          max_speed: number | null
          mmsi_number: string | null
          name: string
          net_tonnage: number | null
          next_drydock_date: string | null
          notes: string | null
          official_number: string | null
          operator_company_id: string | null
          owner_company_id: string | null
          passenger_capacity: number | null
          port_of_registry: string | null
          propulsion_type: string | null
          purchase_price: number | null
          service_speed: number | null
          status: string | null
          technical_manager_id: string | null
          trading_area: string | null
          updated_at: string
          user_id: string | null
          vessel_type: string | null
          year_built: number | null
        }
        Insert: {
          beam?: number | null
          call_sign?: string | null
          cargo_capacity?: number | null
          class_number?: string | null
          classification_society?: string | null
          created_at?: string
          crew_capacity?: number | null
          currency?: string | null
          deadweight?: number | null
          delivery_date?: string | null
          depth?: number | null
          draft?: number | null
          engine_make?: string | null
          engine_model?: string | null
          engine_power?: number | null
          flag_state?: string | null
          fuel_consumption?: number | null
          fuel_type?: string | null
          gross_tonnage?: number | null
          hull_coating?: string | null
          hull_material?: string | null
          id?: string
          imo_number?: string | null
          insurance_value?: number | null
          ism_manager_id?: string | null
          keel_laid_date?: string | null
          last_drydock_date?: string | null
          length_overall?: number | null
          lifeboats?: number | null
          liferafts?: number | null
          max_speed?: number | null
          mmsi_number?: string | null
          name: string
          net_tonnage?: number | null
          next_drydock_date?: string | null
          notes?: string | null
          official_number?: string | null
          operator_company_id?: string | null
          owner_company_id?: string | null
          passenger_capacity?: number | null
          port_of_registry?: string | null
          propulsion_type?: string | null
          purchase_price?: number | null
          service_speed?: number | null
          status?: string | null
          technical_manager_id?: string | null
          trading_area?: string | null
          updated_at?: string
          user_id?: string | null
          vessel_type?: string | null
          year_built?: number | null
        }
        Update: {
          beam?: number | null
          call_sign?: string | null
          cargo_capacity?: number | null
          class_number?: string | null
          classification_society?: string | null
          created_at?: string
          crew_capacity?: number | null
          currency?: string | null
          deadweight?: number | null
          delivery_date?: string | null
          depth?: number | null
          draft?: number | null
          engine_make?: string | null
          engine_model?: string | null
          engine_power?: number | null
          flag_state?: string | null
          fuel_consumption?: number | null
          fuel_type?: string | null
          gross_tonnage?: number | null
          hull_coating?: string | null
          hull_material?: string | null
          id?: string
          imo_number?: string | null
          insurance_value?: number | null
          ism_manager_id?: string | null
          keel_laid_date?: string | null
          last_drydock_date?: string | null
          length_overall?: number | null
          lifeboats?: number | null
          liferafts?: number | null
          max_speed?: number | null
          mmsi_number?: string | null
          name?: string
          net_tonnage?: number | null
          next_drydock_date?: string | null
          notes?: string | null
          official_number?: string | null
          operator_company_id?: string | null
          owner_company_id?: string | null
          passenger_capacity?: number | null
          port_of_registry?: string | null
          propulsion_type?: string | null
          purchase_price?: number | null
          service_speed?: number | null
          status?: string | null
          technical_manager_id?: string | null
          trading_area?: string | null
          updated_at?: string
          user_id?: string | null
          vessel_type?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vessels_ism_manager_id_fkey"
            columns: ["ism_manager_id"]
            isOneToOne: false
            referencedRelation: "setup_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessels_operator_company_id_fkey"
            columns: ["operator_company_id"]
            isOneToOne: false
            referencedRelation: "setup_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessels_owner_company_id_fkey"
            columns: ["owner_company_id"]
            isOneToOne: false
            referencedRelation: "setup_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessels_technical_manager_id_fkey"
            columns: ["technical_manager_id"]
            isOneToOne: false
            referencedRelation: "setup_companies"
            referencedColumns: ["id"]
          },
        ]
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
