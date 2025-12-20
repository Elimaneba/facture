import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Trash2 } from 'lucide-react';
import { adminApi } from '../lib/adminApi';

interface UserOrganization {
  id: string;
  role: 'owner' | 'user';
  created_at: string;
  organization: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    city?: string;
    country?: string;
  };
}

export default function AdminUserOrganizations() {
  const { userId } = useParams<{ userId: string }>();
  const [organizations, setOrganizations] = useState<UserOrganization[]>([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const [orgsData, userData] = await Promise.all([
        adminApi.getUserOrganizations(userId),
        adminApi.getUserById(userId),
      ]);
      setOrganizations(orgsData);
      setUserName(userData.full_name || userData.email);
      setUserEmail(userData.email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveOrganization = async (orgId: string) => {
    if (!userId) return;

    if (!window.confirm('Êtes-vous sûr de vouloir retirer cet utilisateur de cet établissement ?')) {
      return;
    }

    try {
      await adminApi.removeUserFromOrganization(userId, orgId);
      setSuccess('Utilisateur retiré de l\'établissement avec succès');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

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
          to="/admin/users"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Retour aux utilisateurs
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Établissements de {userName}
            </h1>
            <p className="text-gray-600">
              {userEmail} - {organizations.length} établissement(s)
            </p>
          </div>
        </div>

        {(error || success) && (
          <div className={`mb-6 p-4 rounded-lg ${error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {error || success}
          </div>
        )}

        {organizations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun établissement affecté
            </h3>
            <p className="text-gray-600 mb-6">
              Cet utilisateur n'est affecté à aucun établissement.
            </p>
            <Link
              to="/admin/assignments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Affecter à un établissement
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {organizations.map((userOrg) => (
              <div key={userOrg.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-full ${userOrg.role === 'owner' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      <Building2 className={userOrg.role === 'owner' ? 'text-purple-600' : 'text-blue-600'} size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {userOrg.organization.name}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          userOrg.role === 'owner' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {userOrg.role === 'owner' ? 'Propriétaire' : 'Utilisateur'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {userOrg.organization.email && (
                          <p className="flex items-center gap-2">
                            <Mail size={16} />
                            {userOrg.organization.email}
                          </p>
                        )}
                        {userOrg.organization.phone && (
                          <p className="flex items-center gap-2">
                            <Phone size={16} />
                            {userOrg.organization.phone}
                          </p>
                        )}
                        {(userOrg.organization.city || userOrg.organization.country) && (
                          <p className="flex items-center gap-2">
                            <MapPin size={16} />
                            {userOrg.organization.city}{userOrg.organization.city && userOrg.organization.country ? ', ' : ''}{userOrg.organization.country}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Affecté le {new Date(userOrg.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemoveOrganization(userOrg.organization.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Retirer de cet établissement"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
