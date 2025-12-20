import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { FileText, FileEdit, List, LogOut, Building2, Settings, ChevronDown } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { organizations, currentOrganization, setCurrentOrganization, loading } = useOrganization();
  const [showOrgDropdown, setShowOrgDropdown] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Gestion de Facturation</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Gestion de l'établissement */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Building2 className="text-blue-600" size={32} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Établissement actif</h3>
                {currentOrganization ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                      className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {currentOrganization.name}
                      <ChevronDown size={20} />
                    </button>
                    {showOrgDropdown && organizations.length > 1 && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        {organizations.map((org) => (
                          <button
                            key={org.id}
                            onClick={() => {
                              setCurrentOrganization(org);
                              setShowOrgDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                              org.id === currentOrganization.id ? 'bg-blue-50 text-blue-600' : ''
                            }`}
                          >
                            <div className="font-medium">{org.name}</div>
                            <div className="text-sm text-gray-500">Rôle: {org.user_role}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xl font-bold text-red-600">Aucun établissement</p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {currentOrganization && (
                <Link
                  to="/organizations/settings"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Settings size={18} />
                  Paramètres
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue dans votre espace
          </h2>
          <p className="text-xl text-gray-600">
            Créez et gérez vos factures en toute simplicité
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Link
            to="/invoices/new/definitive"
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 group"
          >
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <FileText className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Facture Définitive
            </h3>
            <p className="text-gray-600">
              Créez une facture officielle prête pour le paiement
            </p>
          </Link>

          <Link
            to="/invoices/new/proforma"
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 group"
          >
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <FileEdit className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Facture Proforma
            </h3>
            <p className="text-gray-600">
              Créez un devis ou une facture provisoire
            </p>
          </Link>

          <Link
            to="/invoices"
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 group"
          >
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <List className="text-purple-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Mes Factures
            </h3>
            <p className="text-gray-600">
              Consultez et gérez l'historique de vos factures
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
