import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Edit, Printer } from 'lucide-react';
import { api } from '../lib/api';
import { generateInvoicePDF, printInvoice } from '../lib/pdfGenerator';
import { useOrganization } from '../contexts/OrganizationContext';
import { organizationsApi } from '../lib/organizationsApi';

interface InvoiceItem {
  id: string;
  designation: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Invoice {
  id: string;
  organization_id: string;
  type: 'definitive' | 'proforma';
  invoice_number: string;
  vat_rate: number;
  total_ht: number;
  total_vat: number;
  total_ttc: number;
  client_name?: string;
  client_address?: string;
  created_at: string;
  items: InvoiceItem[];
}

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userRole } = useOrganization();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [headerImageUrl, setHeaderImageUrl] = useState<string>();
  const [headerHeight, setHeaderHeight] = useState<number>();
  const [headerWidth, setHeaderWidth] = useState<number>();
  const [headerPosition, setHeaderPosition] = useState<'left' | 'center' | 'right'>();

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    if (!id) return;

    try {
      const data = await api.getInvoice(id);
      setInvoice(data);
      
      // Charger les settings de l'organisation pour l'en-tête
      if (data.organization_id) {
        try {
          console.log('📋 Chargement des settings pour org:', data.organization_id);
          const settings = await organizationsApi.getOrganizationSettings(data.organization_id);
          console.log('📋 Settings reçus:', settings);
          console.log('🖼️ URL en-tête:', settings.logo_url);
          setHeaderImageUrl(settings.logo_url || undefined);
          setHeaderHeight(settings.header_height || undefined);
          setHeaderWidth(settings.header_width || undefined);
          setHeaderPosition(settings.header_position || undefined);
        } catch (err) {
          console.error('❌ Erreur lors du chargement des settings:', err);
        }
      } else {
        console.warn('⚠️ Pas d\'organization_id sur la facture');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la facture');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (invoice) {
      await generateInvoicePDF(invoice, { 
        headerImageUrl, 
        headerHeight, 
        headerWidth, 
        headerPosition 
      });
    }
  };

  const handlePrint = async () => {
    if (invoice) {
      await printInvoice(invoice, { 
        headerImageUrl, 
        headerHeight, 
        headerWidth, 
        headerPosition 
      });
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      return;
    }

    try {
      await api.deleteInvoice(id);
      navigate('/invoices');
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
              <p className="text-gray-600 mb-6">{error || 'Facture introuvable'}</p>
              <Link
                to="/invoices"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retour à la liste
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Retour à la liste
        </Link>

        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {invoice.type === 'proforma' ? 'Facture Proforma' : 'Facture Définitive'}
              </h1>
              <p className="text-xl text-gray-600">N° {invoice.invoice_number}</p>
              {invoice.type === 'proforma' && (
                <p className="text-sm text-red-600 mt-2 font-medium">
                  PROFORMA - Non valable pour paiement
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Printer size={18} />
                Imprimer
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download size={18} />
                Télécharger PDF
              </button>
              <Link
                to={`/invoices/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                <Edit size={18} />
                Modifier
              </Link>
              {userRole === 'owner' && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 size={18} />
                  Supprimer
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Date de création
              </h3>
              <p className="text-gray-900">
                {new Date(invoice.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {invoice.client_name && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Client
                </h3>
                <p className="text-gray-900 font-medium">{invoice.client_name}</p>
                {invoice.client_address && (
                  <p className="text-gray-600 text-sm mt-1">{invoice.client_address}</p>
                )}
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Articles</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Désignation
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Quantité
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Prix unitaire
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">{item.designation}</td>
                      <td className="py-3 px-4 text-center">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">
                        {item.unit_price.toFixed(0)} FCFA
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {item.line_total.toFixed(0)} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between text-gray-700">
                <span>Total HT:</span>
                <span className="font-medium">{invoice.total_ht.toFixed(0)} FCFA</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>TVA ({invoice.vat_rate}%):</span>
                <span className="font-medium">{invoice.total_vat.toFixed(0)} FCFA</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                <span>Total TTC:</span>
                <span>{invoice.total_ttc.toFixed(0)} FCFA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
