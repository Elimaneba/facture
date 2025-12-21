import React, { createContext, useContext, useState, useEffect } from 'react';
import { organizationsApi, Organization } from '../lib/organizationsApi';

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  userRole: 'owner' | 'user' | null;
  loading: boolean;
  setCurrentOrganization: (org: Organization) => void;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organizations: [],
  currentOrganization: null,
  userRole: null,
  loading: true,
  setCurrentOrganization: () => {},
  refreshOrganizations: async () => {},
});

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<'owner' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrganizations = async () => {
    try {
      // Vérifier si l'utilisateur est connecté
      const { data } = await import('../lib/supabase').then(m => m.supabase.auth.getSession());
      
      if (!data.session) {
        // Pas de session, ne pas charger les organisations
        setLoading(false);
        return;
      }

      const orgs = await organizationsApi.getUserOrganizations();
      console.log('📋 Organisations chargées:', orgs);
      setOrganizations(orgs);
      
      // Extraire le rôle de l'utilisateur depuis la première organisation
      if (orgs.length > 0 && orgs[0].user_role) {
        setUserRole(orgs[0].user_role as 'owner' | 'user');
      }
      
      // Sélectionner l'organisation depuis localStorage ou la première
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      const org = savedOrgId 
        ? orgs.find(o => o.id === savedOrgId) || orgs[0]
        : orgs[0];
      
      if (org) {
        console.log('✅ Organisation sélectionnée:', org.name);
        setCurrentOrganizationState(org);
      } else {
        console.warn('⚠️ Aucune organisation disponible');
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement organisations:', error);
     console.error('Détails:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const setCurrentOrganization = (org: Organization) => {
    setCurrentOrganizationState(org);
    localStorage.setItem('currentOrganizationId', org.id);
  };

  const refreshOrganizations = async () => {
    await loadOrganizations();
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrganization,
        userRole,
        loading,
        setCurrentOrganization,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => useContext(OrganizationContext);
