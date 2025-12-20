import { supabase } from './supabase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token
    ? { Authorization: `Bearer ${data.session.access_token}` }
    : {} as Record<string, string>;
}

export interface User {
  id: string;
  auth_id: string;
  email: string;
  full_name?: string;
  phone?: string;
  is_admin: boolean;
  created_at: string;
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
  created_by?: string;
  created_at: string;
}

export interface UserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'owner' | 'user';
  created_at: string;
  user?: User;
  organization?: Organization;
}

export const adminApi = {
  // ============================================
  // GESTION DES UTILISATEURS
  // ============================================
  
  async createUser(data: {
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
    is_admin?: boolean;
  }) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de l\'utilisateur');
    }

    return response.json();
  },

  async getAllUsers(): Promise<User[]> {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/admin/users`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }

    return response.json();
  },

  async getUserById(id: string): Promise<User> {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }

    return response.json();
  },

  async updateUser(id: string, data: {
    full_name?: string;
    phone?: string;
    is_admin?: boolean;
  }) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la modification de l\'utilisateur');
    }

    return response.json();
  },

  async deleteUser(id: string) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de l\'utilisateur');
    }

    return response.json();
  },

  // ============================================
  // GESTION DES ORGANISATIONS
  // ============================================

  async createOrganization(data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    tax_number?: string;
  }) {
    const headers = await getAuthHeader();
    
    // Filtrer les champs vides pour éviter les erreurs de validation
    const cleanData: any = { name: data.name };
    if (data.email && data.email.trim()) cleanData.email = data.email.trim();
    if (data.phone && data.phone.trim()) cleanData.phone = data.phone.trim();
    if (data.address && data.address.trim()) cleanData.address = data.address.trim();
    if (data.city && data.city.trim()) cleanData.city = data.city.trim();
    if (data.postal_code && data.postal_code.trim()) cleanData.postal_code = data.postal_code.trim();
    if (data.country && data.country.trim()) cleanData.country = data.country.trim();
    if (data.tax_number && data.tax_number.trim()) cleanData.tax_number = data.tax_number.trim();
    
    const response = await fetch(`${API_URL}/admin/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(cleanData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de l\'établissement');
    }

    return response.json();
  },

  async getAllOrganizations(): Promise<Organization[]> {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/admin/organizations`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des établissements');
    }

    return response.json();
  },

  async getOrganizationById(id: string): Promise<Organization> {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/admin/organizations/${id}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'établissement');
    }

    return response.json();
  },

  async updateOrganization(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    tax_number?: string;
  }) {
    const headers = await getAuthHeader();
    
    // Filtrer les champs vides pour éviter les erreurs de validation
    const cleanData: any = {};
    if (data.name && data.name.trim()) cleanData.name = data.name.trim();
    if (data.email && data.email.trim()) cleanData.email = data.email.trim();
    if (data.phone && data.phone.trim()) cleanData.phone = data.phone.trim();
    if (data.address && data.address.trim()) cleanData.address = data.address.trim();
    if (data.city && data.city.trim()) cleanData.city = data.city.trim();
    if (data.postal_code && data.postal_code.trim()) cleanData.postal_code = data.postal_code.trim();
    if (data.country && data.country.trim()) cleanData.country = data.country.trim();
    if (data.tax_number && data.tax_number.trim()) cleanData.tax_number = data.tax_number.trim();
    
    const response = await fetch(`${API_URL}/admin/organizations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(cleanData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la modification de l\'établissement');
    }

    return response.json();
  },

  async deleteOrganization(id: string) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/admin/organizations/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de l\'établissement');
    }

    return response.json();
  },

  // ============================================
  // AFFECTATIONS
  // ============================================

  async assignUserToOrganization(data: {
    user_id: string;
    organization_id: string;
    role: 'owner' | 'user';
  }) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/admin/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'affectation');
    }

    return response.json();
  },

  async updateUserRole(userId: string, orgId: string, role: 'owner' | 'user') {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/admin/assignments/${userId}/${orgId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du changement de rôle');
    }

    return response.json();
  },

  async removeUserFromOrganization(userId: string, orgId: string) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/admin/assignments/${userId}/${orgId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Erreur lors du retrait de l\'utilisateur');
    }

    return response.json();
  },

  async getOrganizationUsers(orgId: string) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/admin/organizations/${orgId}/users`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }

    return response.json();
  },

  async getUserOrganizations(userId: string) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/admin/users/${userId}/organizations`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des établissements');
    }

    return response.json();
  },

  async updateOrganizationSettings(orgId: string, settings: any) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/admin/organizations/${orgId}/settings`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la modification des paramètres');
    }

    return response.json();
  },
};
