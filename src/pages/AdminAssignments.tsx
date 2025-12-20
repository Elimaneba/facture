import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Link2, Plus, Trash2, RefreshCw } from 'lucide-react';
import { adminApi, User, Organization } from '../lib/adminApi';

export default function AdminAssignments() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'user'>('user');
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, orgsData] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getAllOrganizations(),
      ]);
      setUsers(usersData.filter(u => !u.is_admin)); // Exclure les admins
      setOrganizations(orgsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (orgId: string) => {
    try {
      const data = await adminApi.getOrganizationUsers(orgId);
      setAssignments(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedUserId || !selectedOrgId) {
      setError('Veuillez sélectionner un utilisateur et un établissement');
      return;
    }

    try {
      await adminApi.assignUserToOrganization({
        user_id: selectedUserId,
        organization_id: selectedOrgId,
        role: selectedRole,
      });
      setSuccess('Utilisateur affecté avec succès');
      setSelectedUserId('');
      if (selectedOrgId) {
        await loadAssignments(selectedOrgId);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChangeRole = async (userId: string, orgId: string, newRole: 'owner' | 'user') => {
    try {
      await adminApi.updateUserRole(userId, orgId, newRole);
      setSuccess('Rôle modifié avec succès');
      await loadAssignments(orgId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemove = async (userId: string, orgId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer cet utilisateur ?')) {
      return;
    }

    try {
      await adminApi.removeUserFromOrganization(userId, orgId);
      setSuccess('Utilisateur retiré avec succès');
      await loadAssignments(orgId);
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
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Retour au dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Affectation des utilisateurs
          </h1>
          <p className="text-gray-600">
            Assignez des utilisateurs aux établissements avec leurs rôles
          </p>
        </div>

        {(error || success) && (
          <div className={`mb-6 p-4 rounded-lg ${error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {error || success}
          </div>
        )}

        {/* Formulaire d'affectation */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Link2 className="text-purple-600" size={32} />
            <h2 className="text-xl font-bold text-gray-900">
              Nouvelle affectation
            </h2>
          </div>

          <form onSubmit={handleAssign} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utilisateur *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Sélectionner...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Établissement *
                </label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => {
                    setSelectedOrgId(e.target.value);
                    if (e.target.value) {
                      loadAssignments(e.target.value);
                    }
                  }}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Sélectionner...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'owner' | 'user')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="user">Utilisateur (Create/Read/Update)</option>
                  <option value="owner">Propriétaire (CRUD complet)</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Owner:</strong> Peut créer, lire, modifier et <strong>supprimer</strong> des factures<br />
                <strong>User:</strong> Peut créer, lire, modifier mais <strong>PAS supprimer</strong> des factures
              </p>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus size={20} />
              Affecter
            </button>
          </form>
        </div>

        {/* Liste des affectations */}
        {selectedOrgId && assignments.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Utilisateurs de {organizations.find(o => o.id === selectedOrgId)?.name}
              </h2>
              <button
                onClick={() => loadAssignments(selectedOrgId)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Actualiser"
              >
                <RefreshCw size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {assignment.user?.full_name || assignment.user?.email}
                    </p>
                    <p className="text-sm text-gray-600">{assignment.user?.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={assignment.role}
                      onChange={(e) => handleChangeRole(
                        assignment.user_id,
                        assignment.organization_id,
                        e.target.value as 'owner' | 'user'
                      )}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="owner">Propriétaire</option>
                    </select>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      assignment.role === 'owner' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {assignment.role === 'owner' ? 'OWNER' : 'USER'}
                    </span>
                    <button
                      onClick={() => handleRemove(assignment.user_id, assignment.organization_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Retirer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedOrgId && assignments.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">
              Aucun utilisateur affecté à cet établissement
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
