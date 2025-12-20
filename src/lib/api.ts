import { supabase } from './supabase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token
    ? { Authorization: `Bearer ${data.session.access_token}` }
    : {} as Record<string, string>;
}

export interface InvoiceItem {
  designation: string;
  quantity: number;
  unit_price: number;
  line_total?: number;
}

export interface Invoice {
  id?: string;
  organization_id: string;
  type: 'definitive' | 'proforma';
  vat_rate: number;
  items: InvoiceItem[];
  client_name?: string;
  client_address?: string;
  invoice_number?: string;
  total_ht?: number;
  total_vat?: number;
  total_ttc?: number;
  created_at?: string;
}

export const api = {
  async createInvoice(invoice: Invoice) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(invoice),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la création de la facture');
    }
    
    return response.json();
  },

  async getInvoices() {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/invoices`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des factures');
    }
    
    return response.json();
  },

  async getInvoice(id: string) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la facture');
    }
    
    return response.json();
  },

  async updateInvoice(id: string, invoice: Invoice) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(invoice),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la modification de la facture');
    }
    
    return response.json();
  },

  async deleteInvoice(id: string) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la facture');
    }
    
    return response.json();
  },
};
