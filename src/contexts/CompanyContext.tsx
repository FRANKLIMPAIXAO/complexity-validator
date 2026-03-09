import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Company, UserRole, AppRole } from '@/types/company';

interface CompanyContextType {
  company: Company | null;
  userRoles: UserRole[];
  currentRole: AppRole | null;
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  canAccess: (requiredRoles: AppRole[]) => boolean;
  refreshCompany: () => Promise<void>;
  createCompany: (data: Partial<Company>) => Promise<{ error: Error | null; company: Company | null }>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, refreshProfile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanyAndRoles = useCallback(async () => {
    if (!user || !profile?.company_id) {
      setCompany(null);
      setUserRoles([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData as Company);

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('company_id', profile.company_id);

      if (rolesError) throw rolesError;
      setUserRoles(rolesData as UserRole[]);
    } catch (error) {
      console.error('Error fetching company/roles:', error);
      setCompany(null);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  }, [user, profile?.company_id]);

  useEffect(() => {
    fetchCompanyAndRoles();
  }, [fetchCompanyAndRoles]);

  const currentRole: AppRole | null = userRoles.length > 0 
    ? userRoles[0].role 
    : null;

  const hasRole = useCallback((role: AppRole): boolean => {
    return userRoles.some(r => r.role === role);
  }, [userRoles]);

  const hasAnyRole = useCallback((roles: AppRole[]): boolean => {
    return roles.some(role => hasRole(role));
  }, [hasRole]);

  const canAccess = useCallback((requiredRoles: AppRole[]): boolean => {
    if (requiredRoles.length === 0) return true;
    return hasAnyRole(requiredRoles);
  }, [hasAnyRole]);

  const createCompany = async (data: Partial<Company>) => {
    try {
      // Usar Edge Function para bypassar RLS
      const { data: response, error } = await supabase.functions.invoke('create-company', {
        body: {
          razao_social: data.razao_social,
          nome_fantasia: data.nome_fantasia,
          cnpj: data.cnpj,
          tax_regime: data.tax_regime || 'simples',
          responsible_name: data.responsible_name,
          responsible_email: data.responsible_email,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Erro ao criar empresa');
      }

      if (response?.error) {
        throw new Error(response.error);
      }

      // Refresh profile first to get the updated company_id
      await refreshProfile();
      
      // Then fetch company and roles with the updated profile
      await fetchCompanyAndRoles();

      return { error: null, company: response.company as Company };
    } catch (error) {
      console.error('Error creating company:', error);
      return { error: error as Error, company: null };
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        company,
        userRoles,
        currentRole,
        loading,
        hasRole,
        hasAnyRole,
        canAccess,
        refreshCompany: fetchCompanyAndRoles,
        createCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
