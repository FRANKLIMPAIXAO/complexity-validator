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
      activity_logs: {
        Row: {
          action_type: string
          company_id: string | null
          created_at: string
          description: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action_type: string
          company_id?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action_type?: string
          company_id?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_signups: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          clients_count: string
          company: string
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          clients_count: string
          company: string
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          clients_count?: string
          company?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          status?: string
        }
        Relationships: []
      }
      client_plans: {
        Row: {
          color: string
          company_id: string
          created_at: string
          default_fee: number | null
          description: string | null
          id: string
          is_default: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string
          company_id: string
          created_at?: string
          default_fee?: number | null
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          company_id?: string
          created_at?: string
          default_fee?: number | null
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profitability_cache: {
        Row: {
          client_id: string
          company_id: string
          estimated_cost: number
          id: string
          margin_pct: number
          margin_value: number
          opportunity_score: number
          recommended_fee: number
          updated_at: string
        }
        Insert: {
          client_id: string
          company_id: string
          estimated_cost?: number
          id?: string
          margin_pct?: number
          margin_value?: number
          opportunity_score?: number
          recommended_fee?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          company_id?: string
          estimated_cost?: number
          id?: string
          margin_pct?: number
          margin_value?: number
          opportunity_score?: number
          recommended_fee?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_profitability_cache_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_profitability_cache_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          cnpj: string | null
          company_id: string | null
          complex_payroll: boolean
          complexity_level: Database["public"]["Enums"]["complexity_level"]
          complexity_score: number
          created_at: string
          current_fee: number
          employees_count: number
          has_import_operations: boolean
          has_tax_substitution: boolean
          id: string
          is_ecommerce: boolean
          is_underpriced: boolean
          monthly_entries: number
          monthly_hires: number
          monthly_invoices: number
          monthly_revenue: number
          monthly_terminations: number
          name: string
          plan_id: string | null
          tax_regime: Database["public"]["Enums"]["tax_regime"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cnpj?: string | null
          company_id?: string | null
          complex_payroll?: boolean
          complexity_level?: Database["public"]["Enums"]["complexity_level"]
          complexity_score?: number
          created_at?: string
          current_fee?: number
          employees_count?: number
          has_import_operations?: boolean
          has_tax_substitution?: boolean
          id?: string
          is_ecommerce?: boolean
          is_underpriced?: boolean
          monthly_entries?: number
          monthly_hires?: number
          monthly_invoices?: number
          monthly_revenue?: number
          monthly_terminations?: number
          name: string
          plan_id?: string | null
          tax_regime?: Database["public"]["Enums"]["tax_regime"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cnpj?: string | null
          company_id?: string | null
          complex_payroll?: boolean
          complexity_level?: Database["public"]["Enums"]["complexity_level"]
          complexity_score?: number
          created_at?: string
          current_fee?: number
          employees_count?: number
          has_import_operations?: boolean
          has_tax_substitution?: boolean
          id?: string
          is_ecommerce?: boolean
          is_underpriced?: boolean
          monthly_entries?: number
          monthly_hires?: number
          monthly_invoices?: number
          monthly_revenue?: number
          monthly_terminations?: number
          name?: string
          plan_id?: string | null
          tax_regime?: Database["public"]["Enums"]["tax_regime"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "client_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          cnpj: string
          created_at: string | null
          id: string
          is_active: boolean | null
          nome_fantasia: string | null
          razao_social: string
          responsible_email: string | null
          responsible_name: string | null
          tax_regime: string | null
          updated_at: string | null
        }
        Insert: {
          cnpj: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          nome_fantasia?: string | null
          razao_social: string
          responsible_email?: string | null
          responsible_name?: string | null
          tax_regime?: string | null
          updated_at?: string | null
        }
        Update: {
          cnpj?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          nome_fantasia?: string | null
          razao_social?: string
          responsible_email?: string | null
          responsible_name?: string | null
          tax_regime?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      document_adjustments: {
        Row: {
          adjusted_by: string | null
          created_at: string | null
          document_id: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          reason: string | null
        }
        Insert: {
          adjusted_by?: string | null
          created_at?: string | null
          document_id: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
        }
        Update: {
          adjusted_by?: string | null
          created_at?: string | null
          document_id?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_adjustments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          company_id: string
          competence_id: string
          created_at: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          extracted_data: Json | null
          extraction_confidence: number | null
          extraction_error: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          updated_at: string | null
          uploaded_by: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          company_id: string
          competence_id: string
          created_at?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          extracted_data?: Json | null
          extraction_confidence?: number | null
          extraction_error?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string | null
          uploaded_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          company_id?: string
          competence_id?: string
          created_at?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          extracted_data?: Json | null
          extraction_confidence?: number | null
          extraction_error?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string | null
          uploaded_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_competence_id_fkey"
            columns: ["competence_id"]
            isOneToOne: false
            referencedRelation: "monthly_competences"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_actions: {
        Row: {
          action_type: Database["public"]["Enums"]["employee_action_type"]
          company_id: string | null
          completed_at: string | null
          created_at: string
          description: string
          employee_id: string
          id: string
          is_completed: boolean
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["employee_action_type"]
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          description: string
          employee_id: string
          id?: string
          is_completed?: boolean
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["employee_action_type"]
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string
          employee_id?: string
          id?: string
          is_completed?: boolean
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_actions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_actions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_clients: {
        Row: {
          assigned_at: string
          client_id: string
          company_id: string | null
          employee_id: string
          id: string
          is_primary: boolean
          notes: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string
          client_id: string
          company_id?: string | null
          employee_id: string
          id?: string
          is_primary?: boolean
          notes?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string
          client_id?: string
          company_id?: string | null
          employee_id?: string
          id?: string
          is_primary?: boolean
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_clients_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_competence_evaluations: {
        Row: {
          atitude_score: number
          comments: string | null
          company_id: string | null
          comunicacao: number
          conhecimento_score: number
          created_at: string
          employee_id: string
          evaluator_type: string
          habilidade_score: number
          id: string
          lideranca: number
          organizacao: number
          period_month: number
          period_year: number
          proatividade: number
          responsabilidade: number
          trabalho_equipe: number
          user_id: string
        }
        Insert: {
          atitude_score?: number
          comments?: string | null
          company_id?: string | null
          comunicacao?: number
          conhecimento_score?: number
          created_at?: string
          employee_id: string
          evaluator_type?: string
          habilidade_score?: number
          id?: string
          lideranca?: number
          organizacao?: number
          period_month: number
          period_year: number
          proatividade?: number
          responsabilidade?: number
          trabalho_equipe?: number
          user_id: string
        }
        Update: {
          atitude_score?: number
          comments?: string | null
          company_id?: string | null
          comunicacao?: number
          conhecimento_score?: number
          created_at?: string
          employee_id?: string
          evaluator_type?: string
          habilidade_score?: number
          id?: string
          lideranca?: number
          organizacao?: number
          period_month?: number
          period_year?: number
          proatividade?: number
          responsabilidade?: number
          trabalho_equipe?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_competence_evaluations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_competence_evaluations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_feedback: {
        Row: {
          comment: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          employee_id: string
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          employee_id: string
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          employee_id?: string
          feedback_type?: Database["public"]["Enums"]["feedback_type"]
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_feedback_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_feedback_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_goals: {
        Row: {
          company_id: string | null
          created_at: string
          current_value: number | null
          deadline: string | null
          description: string | null
          employee_id: string
          id: string
          is_achievable: boolean
          is_measurable: boolean
          is_relevant: boolean
          is_specific: boolean
          is_time_bound: boolean
          status: string
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          employee_id: string
          id?: string
          is_achievable?: boolean
          is_measurable?: boolean
          is_relevant?: boolean
          is_specific?: boolean
          is_time_bound?: boolean
          status?: string
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          employee_id?: string
          id?: string
          is_achievable?: boolean
          is_measurable?: boolean
          is_relevant?: boolean
          is_specific?: boolean
          is_time_bound?: boolean
          status?: string
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_goals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_goals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_metrics: {
        Row: {
          avg_client_complexity: number | null
          clients_served: number
          company_id: string | null
          created_at: string
          employee_id: string
          id: string
          monthly_demands: number
          obligations_delayed: number
          obligations_delivered: number
          obligations_errors: number
          performance_level:
            | Database["public"]["Enums"]["performance_level"]
            | null
          performance_score: number | null
          period_month: number
          period_year: number
          tasks_assigned: number
          tasks_completed: number
          tasks_on_time: number
          tasks_rework: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_client_complexity?: number | null
          clients_served?: number
          company_id?: string | null
          created_at?: string
          employee_id: string
          id?: string
          monthly_demands?: number
          obligations_delayed?: number
          obligations_delivered?: number
          obligations_errors?: number
          performance_level?:
            | Database["public"]["Enums"]["performance_level"]
            | null
          performance_score?: number | null
          period_month: number
          period_year: number
          tasks_assigned?: number
          tasks_completed?: number
          tasks_on_time?: number
          tasks_rework?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_client_complexity?: number | null
          clients_served?: number
          company_id?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          monthly_demands?: number
          obligations_delayed?: number
          obligations_delivered?: number
          obligations_errors?: number
          performance_level?:
            | Database["public"]["Enums"]["performance_level"]
            | null
          performance_score?: number | null
          period_month?: number
          period_year?: number
          tasks_assigned?: number
          tasks_completed?: number
          tasks_on_time?: number
          tasks_rework?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_metrics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_metrics_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_pdi: {
        Row: {
          acao_pratica: string | null
          company_id: string | null
          created_at: string
          deadline: string | null
          employee_id: string
          id: string
          ponto_forte: string | null
          ponto_melhoria: string | null
          responsavel: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acao_pratica?: string | null
          company_id?: string | null
          created_at?: string
          deadline?: string | null
          employee_id: string
          id?: string
          ponto_forte?: string | null
          ponto_melhoria?: string | null
          responsavel?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acao_pratica?: string | null
          company_id?: string | null
          created_at?: string
          deadline?: string | null
          employee_id?: string
          id?: string
          ponto_forte?: string | null
          ponto_melhoria?: string | null
          responsavel?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_pdi_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_pdi_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_performance_history: {
        Row: {
          ai_analysis: string | null
          company_id: string | null
          employee_id: string
          factors: Json | null
          id: string
          performance_level: Database["public"]["Enums"]["performance_level"]
          performance_score: number
          period_month: number
          period_year: number
          recorded_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          company_id?: string | null
          employee_id: string
          factors?: Json | null
          id?: string
          performance_level: Database["public"]["Enums"]["performance_level"]
          performance_score: number
          period_month: number
          period_year: number
          recorded_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          company_id?: string | null
          employee_id?: string
          factors?: Json | null
          id?: string
          performance_level?: Database["public"]["Enums"]["performance_level"]
          performance_score?: number
          period_month?: number
          period_year?: number
          recorded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_performance_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_performance_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          company_id: string | null
          created_at: string
          department: string | null
          email: string | null
          hire_date: string
          id: string
          is_active: boolean
          name: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          hire_date?: string
          id?: string
          is_active?: boolean
          name: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          hire_date?: string
          id?: string
          is_active?: boolean
          name?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_reports: {
        Row: {
          action_plan: string | null
          adjustments_needed: string | null
          company_id: string | null
          created_at: string
          critical_analysis: string | null
          cycle_type: Database["public"]["Enums"]["governance_cycle"]
          decisions_made: string | null
          id: string
          period_end: string
          period_start: string
          updated_at: string
          user_id: string
          what_didnt_work: string | null
          what_worked: string | null
        }
        Insert: {
          action_plan?: string | null
          adjustments_needed?: string | null
          company_id?: string | null
          created_at?: string
          critical_analysis?: string | null
          cycle_type: Database["public"]["Enums"]["governance_cycle"]
          decisions_made?: string | null
          id?: string
          period_end: string
          period_start: string
          updated_at?: string
          user_id: string
          what_didnt_work?: string | null
          what_worked?: string | null
        }
        Update: {
          action_plan?: string | null
          adjustments_needed?: string | null
          company_id?: string | null
          created_at?: string
          critical_analysis?: string | null
          cycle_type?: Database["public"]["Enums"]["governance_cycle"]
          decisions_made?: string | null
          id?: string
          period_end?: string
          period_start?: string
          updated_at?: string
          user_id?: string
          what_didnt_work?: string | null
          what_worked?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_history: {
        Row: {
          company_id: string | null
          id: string
          kpi_id: string
          notes: string | null
          recorded_at: string
          recorded_value: number
          user_id: string
        }
        Insert: {
          company_id?: string | null
          id?: string
          kpi_id: string
          notes?: string | null
          recorded_at?: string
          recorded_value: number
          user_id: string
        }
        Update: {
          company_id?: string | null
          id?: string
          kpi_id?: string
          notes?: string | null
          recorded_at?: string
          recorded_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpi_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_history_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "strategic_kpis"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_analyses: {
        Row: {
          accumulated_revenue: number | null
          calculated_metrics: Json | null
          company_id: string
          competence_id: string
          created_at: string | null
          das_value: number | null
          employees_count: number | null
          hires_count: number | null
          id: string
          payroll_validated: boolean | null
          payroll_validated_at: string | null
          payroll_validated_by: string | null
          period_revenue: number | null
          pgdas_validated: boolean | null
          pgdas_validated_at: string | null
          pgdas_validated_by: string | null
          simples_anexo: string | null
          terminations_count: number | null
          total_charges: number | null
          total_payroll: number | null
          updated_at: string | null
        }
        Insert: {
          accumulated_revenue?: number | null
          calculated_metrics?: Json | null
          company_id: string
          competence_id: string
          created_at?: string | null
          das_value?: number | null
          employees_count?: number | null
          hires_count?: number | null
          id?: string
          payroll_validated?: boolean | null
          payroll_validated_at?: string | null
          payroll_validated_by?: string | null
          period_revenue?: number | null
          pgdas_validated?: boolean | null
          pgdas_validated_at?: string | null
          pgdas_validated_by?: string | null
          simples_anexo?: string | null
          terminations_count?: number | null
          total_charges?: number | null
          total_payroll?: number | null
          updated_at?: string | null
        }
        Update: {
          accumulated_revenue?: number | null
          calculated_metrics?: Json | null
          company_id?: string
          competence_id?: string
          created_at?: string | null
          das_value?: number | null
          employees_count?: number | null
          hires_count?: number | null
          id?: string
          payroll_validated?: boolean | null
          payroll_validated_at?: string | null
          payroll_validated_by?: string | null
          period_revenue?: number | null
          pgdas_validated?: boolean | null
          pgdas_validated_at?: string | null
          pgdas_validated_by?: string | null
          simples_anexo?: string | null
          terminations_count?: number | null
          total_charges?: number | null
          total_payroll?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_analyses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_analyses_competence_id_fkey"
            columns: ["competence_id"]
            isOneToOne: false
            referencedRelation: "monthly_competences"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_competences: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          company_id: string
          created_at: string | null
          id: string
          month: number
          status: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          month: number
          status?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          month?: number
          status?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_competences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      office_expenses: {
        Row: {
          category: string
          company_id: string
          created_at: string
          description: string | null
          id: string
          month: number
          updated_at: string
          user_id: string
          value: number
          year: number
        }
        Insert: {
          category: string
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          month: number
          updated_at?: string
          user_id: string
          value?: number
          year: number
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          month?: number
          updated_at?: string
          user_id?: string
          value?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "office_expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      office_financial_settings: {
        Row: {
          base_cost_per_client: number
          company_id: string
          complexity_cost_factor: number
          created_at: string
          id: string
          target_margin: number
          updated_at: string
        }
        Insert: {
          base_cost_per_client?: number
          company_id: string
          complexity_cost_factor?: number
          created_at?: string
          id?: string
          target_margin?: number
          updated_at?: string
        }
        Update: {
          base_cost_per_client?: number
          company_id?: string
          complexity_cost_factor?: number
          created_at?: string
          id?: string
          target_margin?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "office_financial_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          trial_expires_at: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          trial_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          trial_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_diagnosis: {
        Row: {
          company_id: string | null
          core_values: string | null
          created_at: string
          external_competition: string | null
          external_economy: string | null
          external_legislation: string | null
          external_market: string | null
          external_technology: string | null
          id: string
          internal_brand: string | null
          internal_commercial: string | null
          internal_financial: string | null
          internal_people: string | null
          internal_processes: string | null
          internal_technology: string | null
          mission: string | null
          strategic_summary: string | null
          target_audience: string | null
          updated_at: string
          user_id: string
          value_proposition: string | null
          vision: string | null
        }
        Insert: {
          company_id?: string | null
          core_values?: string | null
          created_at?: string
          external_competition?: string | null
          external_economy?: string | null
          external_legislation?: string | null
          external_market?: string | null
          external_technology?: string | null
          id?: string
          internal_brand?: string | null
          internal_commercial?: string | null
          internal_financial?: string | null
          internal_people?: string | null
          internal_processes?: string | null
          internal_technology?: string | null
          mission?: string | null
          strategic_summary?: string | null
          target_audience?: string | null
          updated_at?: string
          user_id: string
          value_proposition?: string | null
          vision?: string | null
        }
        Update: {
          company_id?: string | null
          core_values?: string | null
          created_at?: string
          external_competition?: string | null
          external_economy?: string | null
          external_legislation?: string | null
          external_market?: string | null
          external_technology?: string | null
          id?: string
          internal_brand?: string | null
          internal_commercial?: string | null
          internal_financial?: string | null
          internal_people?: string | null
          internal_processes?: string | null
          internal_technology?: string | null
          mission?: string | null
          strategic_summary?: string | null
          target_audience?: string | null
          updated_at?: string
          user_id?: string
          value_proposition?: string | null
          vision?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategic_diagnosis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_goals: {
        Row: {
          company_id: string | null
          created_at: string
          deadline: string
          goal_description: string
          id: string
          is_achievable: boolean | null
          is_measurable: boolean | null
          is_relevant: boolean | null
          is_specific: boolean | null
          is_time_bound: boolean | null
          notes: string | null
          objective_id: string
          priority: Database["public"]["Enums"]["priority_level"]
          progress_percentage: number | null
          responsible: string
          status: Database["public"]["Enums"]["goal_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          deadline: string
          goal_description: string
          id?: string
          is_achievable?: boolean | null
          is_measurable?: boolean | null
          is_relevant?: boolean | null
          is_specific?: boolean | null
          is_time_bound?: boolean | null
          notes?: string | null
          objective_id: string
          priority?: Database["public"]["Enums"]["priority_level"]
          progress_percentage?: number | null
          responsible: string
          status?: Database["public"]["Enums"]["goal_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          deadline?: string
          goal_description?: string
          id?: string
          is_achievable?: boolean | null
          is_measurable?: boolean | null
          is_relevant?: boolean | null
          is_specific?: boolean | null
          is_time_bound?: boolean | null
          notes?: string | null
          objective_id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          progress_percentage?: number | null
          responsible?: string
          status?: Database["public"]["Enums"]["goal_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategic_goals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_goals_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "strategic_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_kpis: {
        Row: {
          company_id: string | null
          created_at: string
          current_value: number | null
          data_source: string | null
          description: string | null
          formula: string | null
          frequency: Database["public"]["Enums"]["kpi_frequency"]
          goal_id: string | null
          id: string
          is_active: boolean
          minimum_acceptable: number | null
          name: string
          pillar: Database["public"]["Enums"]["strategic_pillar"]
          responsible: string | null
          target_value: number
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          current_value?: number | null
          data_source?: string | null
          description?: string | null
          formula?: string | null
          frequency?: Database["public"]["Enums"]["kpi_frequency"]
          goal_id?: string | null
          id?: string
          is_active?: boolean
          minimum_acceptable?: number | null
          name: string
          pillar: Database["public"]["Enums"]["strategic_pillar"]
          responsible?: string | null
          target_value: number
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          current_value?: number | null
          data_source?: string | null
          description?: string | null
          formula?: string | null
          frequency?: Database["public"]["Enums"]["kpi_frequency"]
          goal_id?: string | null
          id?: string
          is_active?: boolean
          minimum_acceptable?: number | null
          name?: string
          pillar?: Database["public"]["Enums"]["strategic_pillar"]
          responsible?: string | null
          target_value?: number
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategic_kpis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_kpis_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "strategic_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_objectives: {
        Row: {
          company_id: string | null
          created_at: string
          expected_impact: string | null
          id: string
          is_active: boolean
          justification: string | null
          objective: string
          pillar: Database["public"]["Enums"]["strategic_pillar"]
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          expected_impact?: string | null
          id?: string
          is_active?: boolean
          justification?: string | null
          objective: string
          pillar: Database["public"]["Enums"]["strategic_pillar"]
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          expected_impact?: string | null
          id?: string
          is_active?: boolean
          justification?: string | null
          objective?: string
          pillar?: Database["public"]["Enums"]["strategic_pillar"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategic_objectives_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          category: string | null
          company_id: string
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          is_public: boolean | null
          title: string
          updated_at: string | null
          uploaded_by: string
          youtube_id: string | null
          youtube_url: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string | null
          uploaded_by: string
          youtube_id?: string | null
          youtube_url?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string
          youtube_id?: string | null
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      user_belongs_to_company: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "gestor" | "operacional" | "visualizador"
      complexity_level:
        | "basico"
        | "intermediario"
        | "avancado"
        | "alto_risco"
        | "critico"
      document_status:
        | "uploaded"
        | "processing"
        | "extracted"
        | "validated"
        | "error"
      document_type:
        | "folha_pagamento"
        | "pgdas"
        | "balancete"
        | "dctf"
        | "sped"
        | "outros"
      employee_action_type:
        | "melhoria_salarial"
        | "reconhecimento"
        | "feedback_periodico"
        | "feedback_estruturado"
        | "treinamento"
        | "plano_desenvolvimento"
        | "reavaliacao_funcao"
        | "plano_corretivo"
      feedback_type: "cliente" | "gestor" | "autoavaliacao"
      goal_status:
        | "nao_iniciada"
        | "em_andamento"
        | "concluida"
        | "atrasada"
        | "cancelada"
      governance_cycle: "semanal" | "mensal" | "trimestral"
      kpi_frequency:
        | "diaria"
        | "semanal"
        | "quinzenal"
        | "mensal"
        | "trimestral"
        | "semestral"
        | "anual"
      performance_level:
        | "alto_desempenho"
        | "desempenho_adequado"
        | "atencao"
        | "risco_operacional"
      priority_level: "baixa" | "media" | "alta" | "critica"
      strategic_pillar:
        | "financeiro"
        | "comercial"
        | "marketing"
        | "operacoes"
        | "pessoas"
        | "tecnologia"
        | "compliance"
      subscription_status: "trial" | "active" | "expired" | "cancelled"
      tax_regime: "mei" | "simples" | "presumido" | "real"
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
      app_role: ["admin", "gestor", "operacional", "visualizador"],
      complexity_level: [
        "basico",
        "intermediario",
        "avancado",
        "alto_risco",
        "critico",
      ],
      document_status: [
        "uploaded",
        "processing",
        "extracted",
        "validated",
        "error",
      ],
      document_type: [
        "folha_pagamento",
        "pgdas",
        "balancete",
        "dctf",
        "sped",
        "outros",
      ],
      employee_action_type: [
        "melhoria_salarial",
        "reconhecimento",
        "feedback_periodico",
        "feedback_estruturado",
        "treinamento",
        "plano_desenvolvimento",
        "reavaliacao_funcao",
        "plano_corretivo",
      ],
      feedback_type: ["cliente", "gestor", "autoavaliacao"],
      goal_status: [
        "nao_iniciada",
        "em_andamento",
        "concluida",
        "atrasada",
        "cancelada",
      ],
      governance_cycle: ["semanal", "mensal", "trimestral"],
      kpi_frequency: [
        "diaria",
        "semanal",
        "quinzenal",
        "mensal",
        "trimestral",
        "semestral",
        "anual",
      ],
      performance_level: [
        "alto_desempenho",
        "desempenho_adequado",
        "atencao",
        "risco_operacional",
      ],
      priority_level: ["baixa", "media", "alta", "critica"],
      strategic_pillar: [
        "financeiro",
        "comercial",
        "marketing",
        "operacoes",
        "pessoas",
        "tecnologia",
        "compliance",
      ],
      subscription_status: ["trial", "active", "expired", "cancelled"],
      tax_regime: ["mei", "simples", "presumido", "real"],
    },
  },
} as const
