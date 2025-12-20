import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Users, Mail, Phone, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { adminApi, Organization } from '../lib/adminApi';

interface OrganizationUser {
  id: string;
  role: 'owner' | 'user';
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
    phone?: string;
    is_admin: boolean;
  };
}

export default function AdminOrganizationsOverview() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgUsers, setOrgUsers] = useState<Record<string, OrganizationUser[]>>({});
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const orgs = await adminApi.getAllOrganizations();
      setOrganizations(orgs);
      
      // Charger les utilisateurs pour chaque organisation
      const usersPromises = orgs.map(org => 
        adminApi.getOrganizationUsers(org.id).catch(() => [])
      );
      const usersData = await Promise.all(usersPromises);
      
      const usersMap: Record<string, OrganizationUser[]> = {};
      orgs.forEach((org, index) => {
        usersMap[org.id] = usersData[index];
      });
      
      setOrgUsers(usersMap);
      // Expandre toutes les organisations par défaut
      setExpandedOrgs(new Set(orgs.map(o => o.id)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrg = (orgId: string) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrgs(newExpanded);
  };

  const filteredOrgs = organizations.filter(org => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      org.name.toLowerCase().includes(search) ||
      org.city?.toLowerCase().includes(search) ||
      org.email?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Retour au dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vue d'ensemble Établissements & Utilisateurs
          </h1>
          <p className="text-gray-600">
            {organizations.length} établissement(s) - {Object.values(orgUsers).flat().length} utilisateur(s) au total
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* Barre de recherche */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher un établissement (nom, ville, email)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {filteredOrgs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun établissement trouvé
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrgs.map((org) => {
              const users = orgUsers[org.id] || [];
              const isExpanded = expandedOrgs.has(org.id);
              
              return (
                <div key={org.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  {/* En-tête de l'établissement */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleOrg(org.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Building2 className="text-blue-600" size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-gray-900">
                              {org.name}
                            </h3>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                              {users.length} utilisateur{users.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            {org.email && <span>📧 {org.email}</span>}
                            {org.city && <span>📍 {org.city}</span>}
                          </div>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        {isExpanded ? (
                          <ChevronDown size={24} className="text-gray-600" />
                        ) : (
                          <ChevronRight size={24} className="text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Liste des utilisateurs */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      {users.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <Users className="mx-auto mb-2 text-gray-400" size={32} />
                          <p>Aucun utilisateur affecté à cet établissement</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {users.map((userOrg) => (
                            <div key={userOrg.id} className="p-4 pl-16 hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${userOrg.role === 'owner' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                                  <Users size={16} className={userOrg.role === 'owner' ? 'text-purple-600' : 'text-blue-600'} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">
                                      {userOrg.user.full_name || 'Sans nom'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      userOrg.role === 'owner' 
                                        ? 'bg-purple-100 text-purple-700' 
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {userOrg.role === 'owner' ? 'Propriétaire' : 'Utilisateur'}
                                    </span>
                                    {userOrg.user.is_admin && (
                                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                                        <Shield size={12} />
                                        Admin
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex gap-3 text-sm text-gray-600 mt-1">
                                    <span className="flex items-center gap-1">
                                      <Mail size={14} />
                                      {userOrg.user.email}
                                    </span>
                                    {userOrg.user.phone && (
                                      <span className="flex items-center gap-1">
                                        <Phone size={14} />
                                        {userOrg.user.phone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
