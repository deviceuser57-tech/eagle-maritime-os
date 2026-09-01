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
      audit_findings: {
        Row: {
          audit_id: string | null
          closed_date: string | null
          corrective_action: string | null
          created_at: string
          description: string
          finding_type: string
          finding_type_id: string | null
          id: string
          org_id: string | null
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
          finding_type_id?: string | null
          id?: string
          org_id?: string | null
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
          finding_type_id?: string | null
          id?: string
          org_id?: string | null
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
          {
            foreignKeyName: "audit_findings_finding_type_id_fkey"
            columns: ["finding_type_id"]
            isOneToOne: false
            referencedRelation: "dropdown_finding_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_findings_finding_type_id_fkey"
            columns: ["finding_type_id"]
            isOneToOne: false
            referencedRelation: "setup_finding_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_findings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_regulations: {
        Row: {
          audit_type_id: string
          created_at: string
          id: string
          org_id: string | null
          regulation_id: string
          updated_at: string
        }
        Insert: {
          audit_type_id: string
          created_at?: string
          id?: string
          org_id?: string | null
          regulation_id: string
          updated_at?: string
        }
        Update: {
          audit_type_id?: string
          created_at?: string
          id?: string
          org_id?: string | null
          regulation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_regulations_audit_type_id_fkey"
            columns: ["audit_type_id"]
            isOneToOne: false
            referencedRelation: "dropdown_audit_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_regulations_audit_type_id_fkey"
            columns: ["audit_type_id"]
            isOneToOne: false
            referencedRelation: "setup_audit_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_regulations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_regulations_regulation_id_fkey"
            columns: ["regulation_id"]
            isOneToOne: false
            referencedRelation: "regulations"
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
          org_id: string | null
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
          org_id?: string | null
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
          org_id?: string | null
          phone?: string | null
          rating?: number | null
          specialization?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auditors_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audits: {
        Row: {
          audit_type: string
          audit_type_id: string | null
          auditor_name: string | null
          completed_date: string | null
          created_at: string
          findings_count: number | null
          id: string
          location: string | null
          notes: string | null
          org_id: string | null
          scheduled_date: string
          score: number | null
          status: string
          updated_at: string
          user_id: string | null
          vessel_id: string | null
        }
        Insert: {
          audit_type: string
          audit_type_id?: string | null
          auditor_name?: string | null
          completed_date?: string | null
          created_at?: string
          findings_count?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          org_id?: string | null
          scheduled_date: string
          score?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
          vessel_id?: string | null
        }
        Update: {
          audit_type?: string
          audit_type_id?: string | null
          auditor_name?: string | null
          completed_date?: string | null
          created_at?: string
          findings_count?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          org_id?: string | null
          scheduled_date?: string
          score?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audits_audit_type_id_fkey"
            columns: ["audit_type_id"]
            isOneToOne: false
            referencedRelation: "dropdown_audit_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audits_audit_type_id_fkey"
            columns: ["audit_type_id"]
            isOneToOne: false
            referencedRelation: "setup_audit_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audits_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_regulations: {
        Row: {
          certificate_type_id: string
          created_at: string
          id: string
          mandatory: boolean | null
          notes: string | null
          org_id: string | null
          regulation_id: string
          updated_at: string
        }
        Insert: {
          certificate_type_id: string
          created_at?: string
          id?: string
          mandatory?: boolean | null
          notes?: string | null
          org_id?: string | null
          regulation_id: string
          updated_at?: string
        }
        Update: {
          certificate_type_id?: string
          created_at?: string
          id?: string
          mandatory?: boolean | null
          notes?: string | null
          org_id?: string | null
          regulation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_regulations_certificate_type_id_fkey"
            columns: ["certificate_type_id"]
            isOneToOne: false
            referencedRelation: "dropdown_certificate_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_regulations_certificate_type_id_fkey"
            columns: ["certificate_type_id"]
            isOneToOne: false
            referencedRelation: "setup_certificate_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_regulations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_regulations_regulation_id_fkey"
            columns: ["regulation_id"]
            isOneToOne: false
            referencedRelation: "regulations"
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
          org_id: string | null
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
          org_id?: string | null
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
          org_id?: string | null
          target_value?: number | null
          updated_at?: string
          user_id?: string
          vessel_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cii_records_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          org_id: string | null
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
          org_id?: string | null
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
          org_id?: string | null
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
            foreignKeyName: "communications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          org_id: string | null
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
          org_id?: string | null
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
          org_id?: string | null
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
          {
            foreignKeyName: "corrective_actions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          nationality_id: string | null
          org_id: string | null
          phone: string | null
          photo_url: string | null
          rank: string
          rank_id: string | null
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
          nationality_id?: string | null
          org_id?: string | null
          phone?: string | null
          photo_url?: string | null
          rank: string
          rank_id?: string | null
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
          nationality_id?: string | null
          org_id?: string | null
          phone?: string | null
          photo_url?: string | null
          rank?: string
          rank_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_nationality_id_fkey"
            columns: ["nationality_id"]
            isOneToOne: false
            referencedRelation: "dropdown_nationalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_nationality_id_fkey"
            columns: ["nationality_id"]
            isOneToOne: false
            referencedRelation: "setup_nationalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "dropdown_crew_ranks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "setup_crew_ranks"
            referencedColumns: ["id"]
          },
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
          org_id: string | null
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
          org_id?: string | null
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
          org_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_regulations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_configurations: {
        Row: {
          base_url: string | null
          created_at: string
          erp_type: string
          id: string
          metadata: Json | null
          name: string
          org_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          base_url?: string | null
          created_at?: string
          erp_type: string
          id?: string
          metadata?: Json | null
          name: string
          org_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          base_url?: string | null
          created_at?: string
          erp_type?: string
          id?: string
          metadata?: Json | null
          name?: string
          org_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "erp_configurations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      external_credentials: {
        Row: {
          created_at: string
          credential_key: string
          encrypted_value: string
          erp_config_id: string | null
          id: string
          iv: string | null
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_key: string
          encrypted_value: string
          erp_config_id?: string | null
          id?: string
          iv?: string | null
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_key?: string
          encrypted_value?: string
          erp_config_id?: string | null
          id?: string
          iv?: string | null
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_credentials_erp_config_id_fkey"
            columns: ["erp_config_id"]
            isOneToOne: false
            referencedRelation: "erp_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_credentials_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      extraction_logs: {
        Row: {
          created_at: string | null
          draft_id: string | null
          id: string
          model_used: string | null
          processing_time_ms: number | null
          tokens_input: number | null
          tokens_output: number | null
        }
        Insert: {
          created_at?: string | null
          draft_id?: string | null
          id?: string
          model_used?: string | null
          processing_time_ms?: number | null
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Update: {
          created_at?: string | null
          draft_id?: string | null
          id?: string
          model_used?: string | null
          processing_time_ms?: number | null
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "extraction_logs_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "vessel_drafts"
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
          org_id: string | null
          reported_by: string | null
          root_cause: string | null
          root_cause_id: string | null
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
          org_id?: string | null
          reported_by?: string | null
          root_cause?: string | null
          root_cause_id?: string | null
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
          org_id?: string | null
          reported_by?: string | null
          root_cause?: string | null
          root_cause_id?: string | null
          severity?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_root_cause_id_fkey"
            columns: ["root_cause_id"]
            isOneToOne: false
            referencedRelation: "dropdown_root_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_root_cause_id_fkey"
            columns: ["root_cause_id"]
            isOneToOne: false
            referencedRelation: "setup_root_causes"
            referencedColumns: ["id"]
          },
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
          org_id: string | null
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
          org_id?: string | null
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
          org_id?: string | null
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
            foreignKeyName: "insurance_claims_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          org_id: string | null
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
          org_id?: string | null
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
          org_id?: string | null
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
            foreignKeyName: "maintenance_tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      org_roles: {
        Row: {
          created_at: string
          id: string
          name: string
          org_id: string | null
          permissions: Json
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          org_id?: string | null
          permissions?: Json
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          org_id?: string | null
          permissions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "org_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          org_id: string | null
          role: string | null
          status: string | null
          token: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          org_id?: string | null
          role?: string | null
          status?: string | null
          token?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          org_id?: string | null
          role?: string | null
          status?: string | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          org_id: string | null
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          org_id?: string | null
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string | null
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "org_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          plan_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
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
          org_id: string | null
          planned_audit_date: string | null
          project_id: string
          vessel_id: string
        }
        Insert: {
          audit_type?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          org_id?: string | null
          planned_audit_date?: string | null
          project_id: string
          vessel_id: string
        }
        Update: {
          audit_type?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          org_id?: string | null
          planned_audit_date?: string | null
          project_id?: string
          vessel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_vessels_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          org_id: string | null
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
          org_id?: string | null
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
          org_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      regulation_vessels: {
        Row: {
          compliance_status: string
          created_at: string
          id: string
          notes: string | null
          org_id: string | null
          regulation_id: string
          vessel_id: string
        }
        Insert: {
          compliance_status?: string
          created_at?: string
          id?: string
          notes?: string | null
          org_id?: string | null
          regulation_id: string
          vessel_id: string
        }
        Update: {
          compliance_status?: string
          created_at?: string
          id?: string
          notes?: string | null
          org_id?: string | null
          regulation_id?: string
          vessel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "regulation_vessels_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
      regulations: {
        Row: {
          code: string
          convention: string
          created_at: string
          description: string | null
          effective_date: string | null
          id: string
          is_global: boolean | null
          issuing_body: string | null
          org_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          convention: string
          created_at?: string
          description?: string | null
          effective_date?: string | null
          id?: string
          is_global?: boolean | null
          issuing_body?: string | null
          org_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          convention?: string
          created_at?: string
          description?: string | null
          effective_date?: string | null
          id?: string
          is_global?: boolean | null
          issuing_body?: string | null
          org_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regulations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_matrix: {
        Row: {
          certificate_type_id: string
          created_at: string
          flag_state_pattern: string | null
          gt_max: number | null
          gt_min: number | null
          id: string
          is_mandatory: boolean | null
          org_id: string | null
          trading_area_pattern: string | null
          updated_at: string
          vessel_type_pattern: string | null
        }
        Insert: {
          certificate_type_id: string
          created_at?: string
          flag_state_pattern?: string | null
          gt_max?: number | null
          gt_min?: number | null
          id?: string
          is_mandatory?: boolean | null
          org_id?: string | null
          trading_area_pattern?: string | null
          updated_at?: string
          vessel_type_pattern?: string | null
        }
        Update: {
          certificate_type_id?: string
          created_at?: string
          flag_state_pattern?: string | null
          gt_max?: number | null
          gt_min?: number | null
          id?: string
          is_mandatory?: boolean | null
          org_id?: string | null
          trading_area_pattern?: string | null
          updated_at?: string
          vessel_type_pattern?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regulatory_matrix_certificate_type_id_fkey"
            columns: ["certificate_type_id"]
            isOneToOne: false
            referencedRelation: "dropdown_certificate_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regulatory_matrix_certificate_type_id_fkey"
            columns: ["certificate_type_id"]
            isOneToOne: false
            referencedRelation: "setup_certificate_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regulatory_matrix_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          org_id: string | null
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
          org_id?: string | null
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
          org_id?: string | null
          parameters?: Json | null
          report_type?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_audit_types: {
        Row: {
          audit_type_name: string
          created_at: string
          description: string | null
          frequency_months: number | null
          id: string
          is_active: boolean | null
          is_external: boolean | null
          org_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audit_type_name: string
          created_at?: string
          description?: string | null
          frequency_months?: number | null
          id?: string
          is_active?: boolean | null
          is_external?: boolean | null
          org_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audit_type_name?: string
          created_at?: string
          description?: string | null
          frequency_months?: number | null
          id?: string
          is_active?: boolean | null
          is_external?: boolean | null
          org_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setup_audit_types_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_certificate_types: {
        Row: {
          certificate_category: string
          certificate_name: string
          created_at: string
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          issuing_authority: string | null
          org_id: string | null
          updated_at: string
          user_id: string
          validity_months: number | null
        }
        Insert: {
          certificate_category: string
          certificate_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          issuing_authority?: string | null
          org_id?: string | null
          updated_at?: string
          user_id: string
          validity_months?: number | null
        }
        Update: {
          certificate_category?: string
          certificate_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          issuing_authority?: string | null
          org_id?: string | null
          updated_at?: string
          user_id?: string
          validity_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "setup_certificate_types_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_classification_societies: {
        Row: {
          abbreviation: string | null
          created_at: string
          id: string
          is_active: boolean | null
          org_id: string | null
          society_name: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          abbreviation?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          society_name: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          abbreviation?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          society_name?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setup_classification_societies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_companies: {
        Row: {
          address: string | null
          company_type: string
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          org_id: string | null
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
          is_active?: boolean | null
          name: string
          org_id?: string | null
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
          is_active?: boolean | null
          name?: string
          org_id?: string | null
          phone?: string | null
          remarks?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setup_companies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_contract_types: {
        Row: {
          contract_name: string
          created_at: string
          description: string | null
          duration_months: number | null
          id: string
          is_active: boolean | null
          org_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contract_name: string
          created_at?: string
          description?: string | null
          duration_months?: number | null
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contract_name?: string
          created_at?: string
          description?: string | null
          duration_months?: number | null
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setup_contract_types_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_crew_ranks: {
        Row: {
          created_at: string
          department: string | null
          id: string
          is_active: boolean | null
          is_officer: boolean | null
          org_id: string | null
          rank_name: string
          rank_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          is_active?: boolean | null
          is_officer?: boolean | null
          org_id?: string | null
          rank_name: string
          rank_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          is_active?: boolean | null
          is_officer?: boolean | null
          org_id?: string | null
          rank_name?: string
          rank_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setup_crew_ranks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_currencies: {
        Row: {
          created_at: string
          currency_code: string
          currency_name: string
          id: string
          is_active: boolean | null
          org_id: string | null
          symbol: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency_code: string
          currency_name: string
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          symbol?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          currency_name?: string
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          symbol?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setup_currencies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_finding_statuses: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_closed: boolean | null
          org_id: string | null
          status_name: string
          status_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_closed?: boolean | null
          org_id?: string | null
          status_name: string
          status_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_closed?: boolean | null
          org_id?: string | null
          status_name?: string
          status_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setup_finding_statuses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_finding_types: {
        Row: {
          created_at: string
          default_deduction: number
          description: string | null
          finding_type_name: string
          id: string
          is_active: boolean | null
          org_id: string | null
          severity: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_deduction?: number
          description?: string | null
          finding_type_name: string
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          severity?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_deduction?: number
          description?: string | null
          finding_type_name?: string
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          severity?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setup_finding_types_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_flag_states: {
        Row: {
          created_at: string
          flag_code: string | null
          flag_name: string
          id: string
          is_active: boolean | null
          org_id: string | null
          risk_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flag_code?: string | null
          flag_name: string
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          risk_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          flag_code?: string | null
          flag_name?: string
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          risk_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setup_flag_states_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_nationalities: {
        Row: {
          country_code: string | null
          country_name: string
          created_at: string
          id: string
          is_active: boolean | null
          org_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          country_code?: string | null
          country_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          country_code?: string | null
          country_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setup_nationalities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_root_causes: {
        Row: {
          category: string | null
          cause_name: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          org_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          cause_name: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          cause_name?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setup_root_causes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          feature_flags: Json
          id: string
          limits: Json
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feature_flags?: Json
          id?: string
          limits?: Json
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feature_flags?: Json
          id?: string
          limits?: Json
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      vessel_certifications: {
        Row: {
          attachments: Json | null
          certificate_name: string
          certificate_number: string | null
          certificate_type: string
          certificate_type_id: string | null
          cost: number | null
          created_at: string
          currency: string | null
          currency_id: string | null
          document_url: string | null
          endorsement_details: string | null
          expiry_date: string
          id: string
          issue_date: string | null
          issuing_authority: string | null
          last_annual_date: string | null
          last_intermediate_date: string | null
          limitations: string | null
          next_annual_date: string | null
          next_intermediate_date: string | null
          notes: string | null
          org_id: string | null
          place_of_issue: string | null
          renewal_reminder_days: number | null
          responsible_person: string | null
          status: string
          survey_type: string | null
          surveyor_name: string | null
          updated_at: string
          user_id: string
          vessel_id: string | null
        }
        Insert: {
          attachments?: Json | null
          certificate_name: string
          certificate_number?: string | null
          certificate_type: string
          certificate_type_id?: string | null
          cost?: number | null
          created_at?: string
          currency?: string | null
          currency_id?: string | null
          document_url?: string | null
          endorsement_details?: string | null
          expiry_date: string
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          last_annual_date?: string | null
          last_intermediate_date?: string | null
          limitations?: string | null
          next_annual_date?: string | null
          next_intermediate_date?: string | null
          notes?: string | null
          org_id?: string | null
          place_of_issue?: string | null
          renewal_reminder_days?: number | null
          responsible_person?: string | null
          status?: string
          survey_type?: string | null
          surveyor_name?: string | null
          updated_at?: string
          user_id: string
          vessel_id?: string | null
        }
        Update: {
          attachments?: Json | null
          certificate_name?: string
          certificate_number?: string | null
          certificate_type?: string
          certificate_type_id?: string | null
          cost?: number | null
          created_at?: string
          currency?: string | null
          currency_id?: string | null
          document_url?: string | null
          endorsement_details?: string | null
          expiry_date?: string
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          last_annual_date?: string | null
          last_intermediate_date?: string | null
          limitations?: string | null
          next_annual_date?: string | null
          next_intermediate_date?: string | null
          notes?: string | null
          org_id?: string | null
          place_of_issue?: string | null
          renewal_reminder_days?: number | null
          responsible_person?: string | null
          status?: string
          survey_type?: string | null
          surveyor_name?: string | null
          updated_at?: string
          user_id?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vessel_certifications_certificate_type_id_fkey"
            columns: ["certificate_type_id"]
            isOneToOne: false
            referencedRelation: "dropdown_certificate_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_certifications_certificate_type_id_fkey"
            columns: ["certificate_type_id"]
            isOneToOne: false
            referencedRelation: "setup_certificate_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_certifications_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "dropdown_currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_certifications_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "setup_currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_certifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_certifications_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      vessel_compliance_history: {
        Row: {
          created_at: string
          id: string
          org_id: string
          recorded_date: string
          total_score: number
          vessel_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          recorded_date?: string
          total_score: number
          vessel_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          recorded_date?: string
          total_score?: number
          vessel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vessel_compliance_history_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_compliance_history_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      vessel_compliance_scores: {
        Row: {
          admin_score: number | null
          coverage_score: number | null
          created_at: string
          findings_score: number | null
          has_statutory_breach: boolean | null
          last_calculated_at: string | null
          org_id: string
          risk_score: number | null
          total_score: number | null
          updated_at: string
          vessel_id: string
        }
        Insert: {
          admin_score?: number | null
          coverage_score?: number | null
          created_at?: string
          findings_score?: number | null
          has_statutory_breach?: boolean | null
          last_calculated_at?: string | null
          org_id: string
          risk_score?: number | null
          total_score?: number | null
          updated_at?: string
          vessel_id: string
        }
        Update: {
          admin_score?: number | null
          coverage_score?: number | null
          created_at?: string
          findings_score?: number | null
          has_statutory_breach?: boolean | null
          last_calculated_at?: string | null
          org_id?: string
          risk_score?: number | null
          total_score?: number | null
          updated_at?: string
          vessel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vessel_compliance_scores_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_compliance_scores_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: true
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      vessel_drafts: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          error_log: string | null
          extracted_data: Json | null
          id: string
          org_id: string | null
          processed_at: string | null
          source_file_path: string
          source_filename: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          error_log?: string | null
          extracted_data?: Json | null
          id?: string
          org_id?: string | null
          processed_at?: string | null
          source_file_path: string
          source_filename: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          error_log?: string | null
          extracted_data?: Json | null
          id?: string
          org_id?: string | null
          processed_at?: string | null
          source_file_path?: string
          source_filename?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vessel_drafts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vessel_regulation_tags: {
        Row: {
          created_at: string
          id: string
          org_id: string | null
          regulation_id: string
          relevance_type: string | null
          updated_at: string
          vessel_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id?: string | null
          regulation_id: string
          relevance_type?: string | null
          updated_at?: string
          vessel_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string | null
          regulation_id?: string
          relevance_type?: string | null
          updated_at?: string
          vessel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vessel_regulation_tags_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_regulation_tags_regulation_id_fkey"
            columns: ["regulation_id"]
            isOneToOne: false
            referencedRelation: "regulations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_regulation_tags_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      vessels: {
        Row: {
          accommodations_pax: string | null
          beam: number | null
          call_sign: string | null
          cargo_capacity: number | null
          class_number: string | null
          classification_society: string | null
          classification_society_id: string | null
          created_at: string
          crew_capacity: number | null
          currency: string | null
          currency_id: string | null
          deadweight: number | null
          delivery_date: string | null
          depth: number | null
          draft: number | null
          engine_make: string | null
          engine_model: string | null
          engine_power: number | null
          flag_state: string | null
          flag_state_id: string | null
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
          navigation_equipment: string | null
          net_tonnage: number | null
          next_drydock_date: string | null
          notes: string | null
          official_number: string | null
          operator_company_id: string | null
          org_id: string | null
          owner_company_id: string | null
          painting_details: string | null
          passenger_capacity: number | null
          port_of_registry: string | null
          previous_yard: string | null
          propulsion_type: string | null
          purchase_price: number | null
          remaining_tasks: string | null
          service_speed: number | null
          status: string | null
          technical_manager_id: string | null
          trading_area: string | null
          updated_at: string
          user_id: string | null
          vessel_brochure: string | null
          vessel_photos: string[] | null
          vessel_type: string | null
          year_built: number | null
        }
        Insert: {
          accommodations_pax?: string | null
          beam?: number | null
          call_sign?: string | null
          cargo_capacity?: number | null
          class_number?: string | null
          classification_society?: string | null
          classification_society_id?: string | null
          created_at?: string
          crew_capacity?: number | null
          currency?: string | null
          currency_id?: string | null
          deadweight?: number | null
          delivery_date?: string | null
          depth?: number | null
          draft?: number | null
          engine_make?: string | null
          engine_model?: string | null
          engine_power?: number | null
          flag_state?: string | null
          flag_state_id?: string | null
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
          navigation_equipment?: string | null
          net_tonnage?: number | null
          next_drydock_date?: string | null
          notes?: string | null
          official_number?: string | null
          operator_company_id?: string | null
          org_id?: string | null
          owner_company_id?: string | null
          painting_details?: string | null
          passenger_capacity?: number | null
          port_of_registry?: string | null
          previous_yard?: string | null
          propulsion_type?: string | null
          purchase_price?: number | null
          remaining_tasks?: string | null
          service_speed?: number | null
          status?: string | null
          technical_manager_id?: string | null
          trading_area?: string | null
          updated_at?: string
          user_id?: string | null
          vessel_brochure?: string | null
          vessel_photos?: string[] | null
          vessel_type?: string | null
          year_built?: number | null
        }
        Update: {
          accommodations_pax?: string | null
          beam?: number | null
          call_sign?: string | null
          cargo_capacity?: number | null
          class_number?: string | null
          classification_society?: string | null
          classification_society_id?: string | null
          created_at?: string
          crew_capacity?: number | null
          currency?: string | null
          currency_id?: string | null
          deadweight?: number | null
          delivery_date?: string | null
          depth?: number | null
          draft?: number | null
          engine_make?: string | null
          engine_model?: string | null
          engine_power?: number | null
          flag_state?: string | null
          flag_state_id?: string | null
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
          navigation_equipment?: string | null
          net_tonnage?: number | null
          next_drydock_date?: string | null
          notes?: string | null
          official_number?: string | null
          operator_company_id?: string | null
          org_id?: string | null
          owner_company_id?: string | null
          painting_details?: string | null
          passenger_capacity?: number | null
          port_of_registry?: string | null
          previous_yard?: string | null
          propulsion_type?: string | null
          purchase_price?: number | null
          remaining_tasks?: string | null
          service_speed?: number | null
          status?: string | null
          technical_manager_id?: string | null
          trading_area?: string | null
          updated_at?: string
          user_id?: string | null
          vessel_brochure?: string | null
          vessel_photos?: string[] | null
          vessel_type?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vessels_classification_society_id_fkey"
            columns: ["classification_society_id"]
            isOneToOne: false
            referencedRelation: "dropdown_classification_societies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessels_classification_society_id_fkey"
            columns: ["classification_society_id"]
            isOneToOne: false
            referencedRelation: "setup_classification_societies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessels_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "dropdown_currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessels_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "setup_currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessels_flag_state_id_fkey"
            columns: ["flag_state_id"]
            isOneToOne: false
            referencedRelation: "dropdown_flag_states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessels_flag_state_id_fkey"
            columns: ["flag_state_id"]
            isOneToOne: false
            referencedRelation: "setup_flag_states"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "vessels_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          org_id: string | null
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
          org_id?: string | null
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
          org_id?: string | null
          origin_port?: string
          status?: string
          updated_at?: string
          user_id?: string
          vessel_id?: string | null
          voyage_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voyages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voyages_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          events: string[] | null
          id: string
          is_active: boolean | null
          org_id: string
          url: string
        }
        Insert: {
          created_at?: string
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          org_id: string
          url: string
        }
        Update: {
          created_at?: string
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          org_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_secrets: {
        Row: {
          created_at: string | null
          endpoint_id: string
          secret_token: string
        }
        Insert: {
          created_at?: string | null
          endpoint_id: string
          secret_token: string
        }
        Update: {
          created_at?: string | null
          endpoint_id?: string
          secret_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_secrets_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: true
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_dropdown_options: {
        Row: {
          field: string | null
          label: string | null
          org_id: string | null
          value: string | null
        }
        Relationships: []
      }
      dropdown_audit_types: {
        Row: {
          id: string | null
          label: string | null
          org_id: string | null
          value: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setup_audit_types_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dropdown_certificate_types: {
        Row: {
          id: string | null
          label: string | null
          org_id: string | null
          value: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setup_certificate_types_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dropdown_classification_societies: {
        Row: {
          id: string | null
          label: string | null
          org_id: string | null
          value: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setup_classification_societies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dropdown_crew_ranks: {
        Row: {
          id: string | null
          label: string | null
          org_id: string | null
          value: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setup_crew_ranks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dropdown_currencies: {
        Row: {
          id: string | null
          label: string | null
          org_id: string | null
          value: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setup_currencies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dropdown_finding_types: {
        Row: {
          id: string | null
          label: string | null
          org_id: string | null
          value: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setup_finding_types_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dropdown_flag_states: {
        Row: {
          id: string | null
          label: string | null
          org_id: string | null
          value: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setup_flag_states_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dropdown_nationalities: {
        Row: {
          id: string | null
          label: string | null
          org_id: string | null
          value: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setup_nationalities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dropdown_root_causes: {
        Row: {
          id: string | null
          label: string | null
          org_id: string | null
          value: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setup_root_causes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dropdown_setup_sources: {
        Row: {
          field: string | null
          label_column: string | null
          source_table: string | null
          value_column: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_new_organization: {
        Args: { org_name: string; org_slug: string; p_user_id?: string }
        Returns: string
      }
      fn_get_finding_deductions: {
        Args: { p_vessel_id: string }
        Returns: number
      }
      fn_get_regulatory_coverage: {
        Args: { p_vessel_id: string }
        Returns: number
      }
      fn_is_org_admin: { Args: { p_org_id: string }; Returns: boolean }
      fn_is_org_member: { Args: { p_org_id: string }; Returns: boolean }
      get_auth_user_org_ids: { Args: never; Returns: string[] }
      get_my_org_ids: {
        Args: never
        Returns: {
          org_id: string
        }[]
      }
      get_user_org_ids: {
        Args: never
        Returns: {
          org_id: string
        }[]
      }
      rpc_calculate_vessel_compliance: {
        Args: { p_vessel_id: string }
        Returns: Json
      }
      rpc_get_ai_vessel_insights: {
        Args: { p_vessel_id: string }
        Returns: Json
      }
      rpc_get_fleet_compliance_index: {
        Args: { p_org_id: string }
        Returns: Json
      }
      rpc_log_cii_entry: {
        Args: {
          p_cargo_carried: number
          p_distance_travelled: number
          p_fuel_consumption: number
          p_fuel_type: string
          p_notes?: string
          p_org_id: string
          p_target_cii: number
          p_vessel_id: string
          p_year: number
        }
        Returns: Json
      }
      rpc_safe_execute: {
        Args: { p_action: string; p_payload: Json }
        Returns: Json
      }
      rpc_snapshot_compliance_history: {
        Args: { p_org_id: string }
        Returns: Json
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
