import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Palette, Save, Upload } from 'lucide-react';
import { adminApi } from '../lib/adminApi';
import { organizationsApi } from '../lib/organizationsApi';
import { supabase } from '../lib/supabase';

export default function AdminOrganizationDesign() {
  const { orgId } = useParams<{ orgId: string }>();
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [headerImageUrl, setHeaderImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(''); // Aperçu local immédiat
  
  // Dimensions de l'en-tête
  const [headerHeight, setHeaderHeight] = useState(60);
  const [headerWidth, setHeaderWidth] = useState(100); // en pourcentage
  const [headerPosition, setHeaderPosition] = useState<'left' | 'center' | 'right'>('center');

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    if (!orgId) return;

    try {
      const org = await adminApi.getOrganizationById(orgId);
      setOrgName(org.name);

      const settings = await organizationsApi.getOrganizationSettings(orgId);
      setHeaderImageUrl(settings.logo_url || '');
      setHeaderHeight(settings.header_height || 60);
      setHeaderWidth(settings.header_width || 100);
      setHeaderPosition(settings.header_position || 'center');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image');
        return;
      }
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
      
      // Créer un aperçu local immédiat
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !orgId) return;

    setUploading(true);
    setError('');

    try {
      // Nom unique pour le fichier
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${orgId}-header-${Date.now()}.${fileExt}`;
      const filePath = `invoice-headers/${fileName}`;

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('organization-assets')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('organization-assets')
        .getPublicUrl(filePath);

      setHeaderImageUrl(urlData.publicUrl);
      setPreviewUrl(''); // Nettoyer l'aperçu local
      setSelectedFile(null);
      setSuccess('Image uploadée avec succès');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Vérifier si un fichier est sélectionné mais pas encore uploadé
      if (selectedFile && !headerImageUrl) {
        setError('Veuillez d\'abord cliquer sur "Uploader" pour envoyer l\'image');
        setSaving(false);
        return;
      }
      
      if (!headerImageUrl) {
        setError('Veuillez uploader une image ou coller une URL');
        setSaving(false);
        return;
      }
      
      const settingsData = {
        logo_url: headerImageUrl,
        header_height: headerHeight,
        header_width: headerWidth,
        header_position: headerPosition,
      };

      console.log('📤 Envoi des settings:', settingsData);
      
      const result = await adminApi.updateOrganizationSettings(orgId, settingsData);
      console.log('✅ Résultat:', result);
      console.log('✅ logo_url sauvegardé:', result.logo_url);
      
      setPreviewUrl('');
      setSuccess('En-tête enregistré avec succès !');
    } catch (err: any) {
      console.error('❌ Erreur enregistrement:', err);
      setError(err.message);
    } finally {
      setSaving(false);
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
      <div className="max-w-4xl mx-auto px-4">
        <Link
          to="/admin/organizations"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Retour aux établissements
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Design des factures
          </h1>
          <p className="text-gray-600">
            Établissement : {orgName}
          </p>
        </div>

        {(error || success) && (
          <div className={`mb-6 p-4 rounded-lg ${error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {error || success}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <Palette size={28} className="text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">En-tête de facture</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Upload de fichier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uploader l'image d'en-tête
                </label>
                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-500 transition-colors">
                      <div className="flex items-center gap-3">
                        <Upload className="text-gray-400" size={24} />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner une image'}
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG jusqu'à 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Upload size={18} />
                      {uploading ? 'Upload...' : 'Uploader'}
                    </button>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OU</span>
                </div>
              </div>

              {/* URL manuelle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de l'image (optionnel)
                </label>
                <input
                  type="url"
                  value={headerImageUrl}
                  onChange={(e) => setHeaderImageUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemple.com/header.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ou collez l'URL d'une image externe
                </p>
              </div>

              {(previewUrl || headerImageUrl) && (
                <div className="space-y-4">
                  {/* Contrôles de mise en page */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-3">🎛️ Mise en page de l'en-tête</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hauteur: {headerHeight}px
                        </label>
                        <input
                          type="range"
                          min="30"
                          max="150"
                          value={headerHeight}
                          onChange={(e) => setHeaderHeight(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Largeur: {headerWidth}%
                        </label>
                        <input
                          type="range"
                          min="30"
                          max="100"
                          value={headerWidth}
                          onChange={(e) => setHeaderWidth(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Position
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setHeaderPosition('left')}
                            className={`px-3 py-1 rounded text-sm ${headerPosition === 'left' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                          >
                            Gauche
                          </button>
                          <button
                            type="button"
                            onClick={() => setHeaderPosition('center')}
                            className={`px-3 py-1 rounded text-sm ${headerPosition === 'center' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                          >
                            Centre
                          </button>
                          <button
                            type="button"
                            onClick={() => setHeaderPosition('right')}
                            className={`px-3 py-1 rounded text-sm ${headerPosition === 'right' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                          >
                            Droite
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prévisualisation de la facture */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      👁️ Aperçu sur la facture {previewUrl && <span className="text-orange-500">(non enregistré)</span>}
                    </label>
                    <div className="border-2 border-purple-300 rounded-lg p-6 bg-white shadow-sm overflow-hidden">
                      <div className="max-w-[210mm] mx-auto bg-white border border-gray-200" style={{ aspectRatio: '210/297', minHeight: '400px' }}>
                        {/* En-tête avec dimensions dynamiques */}
                        <div 
                          className="mb-4 p-2"
                          style={{ 
                            display: 'flex',
                            justifyContent: headerPosition === 'left' ? 'flex-start' : headerPosition === 'right' ? 'flex-end' : 'center'
                          }}
                        >
                          <img 
                            src={previewUrl || headerImageUrl} 
                            alt="En-tête facture" 
                            style={{ 
                              height: `${headerHeight}px`, 
                              width: `${headerWidth}%`,
                              objectFit: 'contain' 
                            }}
                          />
                        </div>
                        
                        {/* Exemple de contenu facture */}
                        <div className="px-4 space-y-3 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-sm">N° FAC-2024-001</p>
                              <p className="text-gray-600">Date: {new Date().toLocaleDateString('fr-FR')}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <p className="font-semibold text-xs">Client:</p>
                            <p className="text-gray-700">Exemple Client</p>
                            <p className="text-gray-600">123 Rue Example, Ville</p>
                          </div>

                          <div className="mt-4 border-t pt-3">
                            <table className="w-full text-xs">
                              <thead className="bg-blue-500 text-white">
                                <tr>
                                  <th className="text-left p-2">Désignation</th>
                                  <th className="text-right p-2">Qté</th>
                                  <th className="text-right p-2">P.U</th>
                                  <th className="text-right p-2">Total</th>
                                </tr>
                              </thead>
                              <tbody className="bg-gray-50">
                                <tr>
                                  <td className="p-2">Article exemple</td>
                                  <td className="text-right p-2">2</td>
                                  <td className="text-right p-2">5 000 FCFA</td>
                                  <td className="text-right p-2">10 000 FCFA</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div className="mt-4 text-right space-y-1">
                            <p>Total HT: 10 000 FCFA</p>
                            <p>TVA (19.25%): 1 925 FCFA</p>
                            <p className="font-bold text-sm">Total TTC: 11 925 FCFA</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠️ Aperçu simplifié - La facture PDF réelle aura tous les détails complets
                    </p>
                  </div>
                </div>
              )}


              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Enregistrement...' : 'Enregistrer l\'en-tête'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Information</h3>
          <p className="text-sm text-blue-800">
            Cette image d'en-tête sera affichée en haut de toutes les factures générées pour cet établissement.
            Elle remplacera le titre par défaut "FACTURE" ou "FACTURE PROFORMA".
          </p>
        </div>
      </div>
    </div>
  );
}
