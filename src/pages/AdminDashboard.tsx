import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Users, UserPlus, LogOut, Link2, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { adminApi } from '../lib/adminApi';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    organizations: 0,
    users: 0,
    adminUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [orgs, users] = await Promise.all([
        adminApi.getAllOrganizations(),
        adminApi.getAllUsers(),
      ]);

      setStats({
        organizations: orgs.length,
        users: users.length,
        adminUsers: users.filter(u => u.is_admin).length,
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Portail Administration
            </h1>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h2>
          <p className="text-gray-600">
            Gérez les établissements et les utilisateurs
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <Building2 className="text-blue-600" size={32} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Établissements</p>
                <p className="text-3xl font-bold text-gray-900">{stats.organizations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-full">
                <Users className="text-green-600" size={32} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Utilisateurs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-4 rounded-full">
                <UserPlus className="text-purple-600" size={32} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Administrateurs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.adminUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions principales */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/admin/organizations/overview"
            className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-md hover:shadow-xl transition-all p-8 group text-white"
          >
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
              <List className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">
              Vue d'ensemble hiérarchique
            </h3>
            <p className="text-blue-50">
              Afficher tous les établissements avec leurs utilisateurs
            </p>
          </Link>

          <Link
            to="/admin/organizations"
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 group"
          >
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Building2 className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Gérer les établissements
            </h3>
            <p className="text-gray-600">
              Créer, modifier et supprimer des établissements
            </p>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 group"
          >
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <Users className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Gérer les utilisateurs
            </h3>
            <p className="text-gray-600">
              Créer, modifier et supprimer des utilisateurs
            </p>
          </Link>

          <Link
            to="/admin/assignments"
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 group"
          >
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <Link2 className="text-purple-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Affecter des utilisateurs
            </h3>
            <p className="text-gray-600">
              Assigner des utilisateurs aux établissements avec leurs rôles
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
}
