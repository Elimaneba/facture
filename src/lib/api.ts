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

// import axios from 'axios';
// import { supabase } from './supabase';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// async function getAuthHeader(): Promise<Record<string, string>> {
//   const { data } = await supabase.auth.getSession();
//   return data.session?.access_token
//     ? { Authorization: `Bearer ${data.session.access_token}` }
//     : {} as Record<string, string>;
// }

// export interface InvoiceItem {
//   designation: string;
//   quantity: number;
//   unit_price: number;
//   line_total?: number;
// }

// export interface Invoice {
//   id?: string;
//   organization_id: string;
//   type: 'definitive' | 'proforma';
//   vat_rate: number;
//   items: InvoiceItem[];
//   client_name?: string;
//   client_address?: string;
//   invoice_number?: string;
//   total_ht?: number;
//   total_vat?: number;
//   total_ttc?: number;
//   created_at?: string;
// }

// // Create axios instance with base configuration
// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Add request interceptor to include auth token
// api.interceptors.request.use(async (config) => {
//   const token = (await supabase.auth.getSession()).data.session?.access_token;
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export { api };

// export const invoiceApi = {
//   async createInvoice(invoice: Invoice) {
//     const response = await api.post('/invoices', invoice);
//     return response.data;
//   },

//   async getInvoices() {
//     const response = await api.get('/invoices');
//     return response.data;
//   },

//   async getInvoice(id: string) {
//     const response = await api.get(`/invoices/${id}`);
//     return response.data;
//   },

//   async getInvoiceItems(invoiceId: string) {
//     const response = await api.get(`/invoices/${invoiceId}/items`);
//     return response.data;
//   },

//   async updateInvoice(id: string, invoice: Invoice) {
//     const response = await api.put(`/invoices/${id}`, invoice);
//     return response.data;
//   },

//   async deleteInvoice(id: string) {
//     const response = await api.delete(`/invoices/${id}`);
//     return response.data;
//   },
// };
