import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { api, InvoiceItem } from '../lib/api';
import { generateInvoicePDF } from '../lib/pdfGenerator';
import { useOrganization } from '../contexts/OrganizationContext';

export default function CreateInvoice() {
  const { type } = useParams<{ type: 'definitive' | 'proforma' }>();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();

  const [items, setItems] = useState<InvoiceItem[]>([
    { designation: '', quantity: 1, unit_price: 0 },
  ]);
  const [vatRate, setVatRate] = useState(18);
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [laborCost, setLaborCost] = useState(0);

  const addItem = () => {
    setItems([...items, { designation: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotals = () => {
    const itemsTotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const total_ht = itemsTotal + laborCost;
    const total_vat = total_ht * (vatRate / 100);
    const total_ttc = total_ht + total_vat;
    return { total_ht, total_vat, total_ttc };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentOrganization) {
      setError('Veuillez sélectionner un établissement');
      return;
    }

    setLoading(true);

    try {
      await api.createInvoice({
        organization_id: currentOrganization.id,
        type: type as 'definitive' | 'proforma',
        vat_rate: vatRate,
        items,
        client_name: clientName || undefined,
        client_address: clientAddress || undefined,
        labor_cost: laborCost > 0 ? laborCost : undefined,
      });

      navigate('/invoices');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la facture');
    } finally {
      setLoading(false);
    }
  };

  const { total_ht, total_vat, total_ttc } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Retour au tableau de bord
        </Link>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {type === 'proforma' ? 'Nouvelle Facture Proforma' : 'Nouvelle Facture Définitive'}
          </h1>
          <p className="text-gray-600 mb-8">
            {type === 'proforma'
              ? 'Créez un devis ou une facture provisoire'
              : 'Créez une facture officielle'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du client
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom du client"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TVA (%)
                </label>
                <input
                  type="number"
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse du client
              </label>
              <textarea
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Adresse complète"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Articles</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={18} />
                  Ajouter un article
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.designation}
                        onChange={(e) => updateItem(index, 'designation', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Désignation"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        required
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Qté"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Prix unit."
                      />
                    </div>
                    <div className="w-32 px-4 py-2 bg-gray-100 rounded-lg text-right font-medium">
                      {(item.quantity * item.unit_price).toFixed(0)} FCFA
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main d'oeuvre */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Main d'oeuvre
                  </label>
                  <p className="text-xs text-gray-500">Montant forfaitaire (optionnel)</p>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    min="0"
                    step="1"
                    className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Montant"
                  />
                  <span className="text-gray-600 font-medium">FCFA</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between text-gray-700">
                  <span>Total HT:</span>
                  <span className="font-medium">{total_ht.toFixed(0)} FCFA</span>
                </div>
                {laborCost > 0 && (
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>(dont main d'oeuvre:</span>
                    <span>{laborCost.toFixed(0)} FCFA)</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>TVA ({vatRate}%):</span>
                  <span className="font-medium">{total_vat.toFixed(0)} FCFA</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                  <span>Total TTC:</span>
                  <span>{total_ttc.toFixed(0)} FCFA</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <Link
                to="/"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Création...' : 'Créer la facture'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}