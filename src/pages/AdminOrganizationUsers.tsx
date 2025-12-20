import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Phone, Shield, Trash2 } from 'lucide-react';
import { adminApi } from '../lib/adminApi';

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

export default function AdminOrganizationUsers() {
  const { orgId } = useParams<{ orgId: string }>();
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    if (!orgId) return;

    try {
      setLoading(true);
      const [usersData, orgData] = await Promise.all([
        adminApi.getOrganizationUsers(orgId),
        adminApi.getOrganizationById(orgId),
      ]);
      setUsers(usersData);
      setOrgName(orgData.name);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!orgId) return;

    if (!window.confirm('Êtes-vous sûr de vouloir retirer cet utilisateur de cet établissement ?')) {
      return;
    }

    try {
      await adminApi.removeUserFromOrganization(userId, orgId);
      setSuccess('Utilisateur retiré avec succès');
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
          to="/admin/organizations"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Retour aux établissements
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Utilisateurs de {orgName}
            </h1>
            <p className="text-gray-600">
              {users.length} utilisateur(s) affecté(s)
            </p>
          </div>
        </div>

        {(error || success) && (
          <div className={`mb-6 p-4 rounded-lg ${error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {error || success}
          </div>
        )}

        {users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun utilisateur affecté
            </h3>
            <p className="text-gray-600 mb-6">
              Aucun utilisateur n'est encore affecté à cet établissement.
            </p>
            <Link
              to="/admin/assignments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Affecter un utilisateur
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((userOrg) => (
              <div key={userOrg.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-full ${userOrg.role === 'owner' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      <Users className={userOrg.role === 'owner' ? 'text-purple-600' : 'text-blue-600'} size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {userOrg.user.full_name || 'Sans nom'}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          userOrg.role === 'owner' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {userOrg.role === 'owner' ? 'Propriétaire' : 'Utilisateur'}
                        </span>
                        {userOrg.user.is_admin && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                            <Shield size={12} />
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="flex items-center gap-2">
                          <Mail size={16} />
                          {userOrg.user.email}
                        </p>
                        {userOrg.user.phone && (
                          <p className="flex items-center gap-2">
                            <Phone size={16} />
                            {userOrg.user.phone}
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
                      onClick={() => handleRemoveUser(userOrg.user.id)}
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
