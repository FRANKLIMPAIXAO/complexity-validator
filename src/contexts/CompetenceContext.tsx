import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import type { MonthlyCompetence, MonthlyAnalysis } from '@/types/company';

interface CompetenceContextType {
  competences: MonthlyCompetence[];
  currentCompetence: MonthlyCompetence | null;
  currentAnalysis: MonthlyAnalysis | null;
  loading: boolean;
  setCurrentCompetence: (competence: MonthlyCompetence | null) => void;
  selectCompetence: (year: number, month: number) => Promise<void>;
  createCompetence: (year: number, month: number) => Promise<MonthlyCompetence | null>;
  refreshCompetences: () => Promise<void>;
  refreshAnalysis: () => Promise<void>;
}

const CompetenceContext = createContext<CompetenceContextType | undefined>(undefined);

export function CompetenceProvider({ children }: { children: React.ReactNode }) {
  const { company } = useCompany();
  const [competences, setCompetences] = useState<MonthlyCompetence[]>([]);
  const [currentCompetence, setCurrentCompetence] = useState<MonthlyCompetence | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<MonthlyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompetences = useCallback(async () => {
    if (!company?.id) {
      setCompetences([]);
      setCurrentCompetence(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('monthly_competences')
        .select('*')
        .eq('company_id', company.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      
      const competenceList = data as MonthlyCompetence[];
      setCompetences(competenceList);

      // Auto-select the most recent competence if none selected
      if (!currentCompetence && competenceList.length > 0) {
        setCurrentCompetence(competenceList[0]);
      }
    } catch (error) {
      console.error('Error fetching competences:', error);
    } finally {
      setLoading(false);
    }
  }, [company?.id, currentCompetence]);

  const fetchAnalysis = useCallback(async () => {
    if (!company?.id || !currentCompetence?.id) {
      setCurrentAnalysis(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('monthly_analyses')
        .select('*')
        .eq('company_id', company.id)
        .eq('competence_id', currentCompetence.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentAnalysis(data as MonthlyAnalysis | null);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setCurrentAnalysis(null);
    }
  }, [company?.id, currentCompetence?.id]);

  useEffect(() => {
    fetchCompetences();
  }, [fetchCompetences]);

  useEffect(() => {
    if (currentCompetence) {
      fetchAnalysis();
    }
  }, [currentCompetence, fetchAnalysis]);

  const selectCompetence = async (year: number, month: number) => {
    const existing = competences.find(c => c.year === year && c.month === month);
    if (existing) {
      setCurrentCompetence(existing);
    } else {
      // Create new competence if it doesn't exist
      const newCompetence = await createCompetence(year, month);
      if (newCompetence) {
        setCurrentCompetence(newCompetence);
      }
    }
  };

  const createCompetence = async (year: number, month: number): Promise<MonthlyCompetence | null> => {
    if (!company?.id) return null;

    try {
      const { data, error } = await supabase
        .from('monthly_competences')
        .insert({
          company_id: company.id,
          year,
          month,
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      const newCompetence = data as MonthlyCompetence;
      setCompetences(prev => [newCompetence, ...prev]);
      
      // Also create an empty analysis record
      await supabase
        .from('monthly_analyses')
        .insert({
          company_id: company.id,
          competence_id: newCompetence.id,
        });

      return newCompetence;
    } catch (error) {
      console.error('Error creating competence:', error);
      return null;
    }
  };

  return (
    <CompetenceContext.Provider
      value={{
        competences,
        currentCompetence,
        currentAnalysis,
        loading,
        setCurrentCompetence,
        selectCompetence,
        createCompetence,
        refreshCompetences: fetchCompetences,
        refreshAnalysis: fetchAnalysis,
      }}
    >
      {children}
    </CompetenceContext.Provider>
  );
}

export function useCompetence() {
  const context = useContext(CompetenceContext);
  if (context === undefined) {
    throw new Error('useCompetence must be used within a CompetenceProvider');
  }
  return context;
}
