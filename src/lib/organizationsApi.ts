import { supabase } from './supabase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token
    ? { Authorization: `Bearer ${data.session.access_token}` }
    : {} as Record<string, string>;
}

export interface Organization {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  tax_number?: string;
  created_at?: string;
  user_role?: string;
}

export interface OrganizationSettings {
  id: string;
  organization_id: string;
  logo_url?: string;
  header_height?: number;
  header_width?: number;
  header_position?: 'left' | 'center' | 'right';
  primary_color: string;
  secondary_color: string;
  font_family: string;
  header_text?: string;
  footer_text?: string;
  show_logo: boolean;
  show_company_info: boolean;
}

export interface CreateOrganizationData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  tax_number?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  tax_number?: string;
}

export interface UpdateOrganizationSettingsData {
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  header_text?: string;
  footer_text?: string;
  show_logo?: boolean;
  show_company_info?: boolean;
}

export const organizationsApi = {
  // async createOrganization(data: CreateOrganizationData) {
  //   const headers = await getAuthHeader();
  //   const response = await fetch(`${API_URL}/organizations`,
  //      {
         
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       ...headers,
  //     },
  //     body: JSON.stringify(data),
  //   });
    
  //   if (!response.ok) {
  //     throw new Error('Erreur lors de la création de l\'organisation');
  //   }
    
  //   return response.json();
  // },
async createOrganization(data: CreateOrganizationData) {
    try {
      const headers = await getAuthHeader();
      console.log('En-têtes de la requête:', headers);
      
      const response = await fetch(`${API_URL}/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
      });
      
      const responseText = await response.text();
      console.log('Réponse brute:', responseText);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}\n${responseText}`);
      }
      
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Erreur détaillée:', {
        error,

      });
      throw error;
    }
  },
  async getUserOrganizations(): Promise<Organization[]> {
    const headers = await getAuthHeader();
    const url = `${API_URL}/organizations`;
    console.log('🔄 API URL:', url);
    console.log('🔑 Headers:', headers);
    
    const response = await fetch(url, { headers });
    const text = await response.text();
    
    console.log('📡 Status:', response.status);
    console.log('📄 Response:', text.substring(0, 300));
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${text.substring(0, 100)}`);
    }
    
    return JSON.parse(text);
  },

  async getOrganization(id: string) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/organizations/${id}`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'organisation');
    }
    
    return response.json();
  },

  async updateOrganization(id: string, data: UpdateOrganizationData) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/organizations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la modification de l\'organisation');
    }
    
    return response.json();
  },

  async getOrganizationSettings(id: string): Promise<OrganizationSettings> {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/organizations/${id}/settings`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des paramètres');
    }
    
    return response.json();
  },

  async updateOrganizationSettings(id: string, data: UpdateOrganizationSettingsData) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/organizations/${id}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la modification des paramètres');
    }
    
    return response.json();
  },
};
