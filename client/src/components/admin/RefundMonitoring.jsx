import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RefreshCw, AlertTriangle, DollarSign, Clock, CheckCircle, Mail } from 'lucide-react';
import axios from 'axios';

export const AdminRefundMonitoring = ({ className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [lastRefundCheck, setLastRefundCheck] = useState(null);
  const [cronStatus, setCronStatus] = useState(null);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/health`
      );
      
      if (response.data) {
        setSystemStatus(response.data);
        setCronStatus(response.data.cronJobs);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const triggerStockCheck = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/stock-check`
      );
      
      if (response.data?.success) {
        alert('Vérification des stocks effectuée avec succès!');
      } else {
        alert('Erreur lors de la vérification des stocks');
      }
    } catch (error) {
      console.error('Error triggering stock check:', error);
      alert('Erreur lors de la vérification des stocks');
    } finally {
      setLoading(false);
    }
  };

  const triggerRefundCheck = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/delayed-order-check`
      );
      
      if (response.data?.success) {
        setLastRefundCheck(response.data);
        alert(`Vérification des remboursements effectuée! ${response.data.data?.processedCount || 0} commandes traitées.`);
      } else {
        alert('Erreur lors de la vérification des remboursements');
      }
    } catch (error) {
      console.error('Error triggering refund check:', error);
      alert('Erreur lors de la vérification des remboursements');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* System Health */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                État du Système de Protection Client
              </h2>
              <p className="text-gray-600 text-sm">
                Surveillance en temps réel des notifications et remboursements automatiques
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchSystemStatus}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {systemStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-900">Système</p>
                  <p className="text-lg font-bold text-green-600">
                    {systemStatus.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Dernière vérif.</p>
                  <p className="text-sm text-blue-600">
                    {new Date(systemStatus.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Cron Jobs</p>
                  <p className="text-sm text-purple-600">
                    {cronStatus?.isRunning ? 'Actifs' : 'Inactifs'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Cron Jobs Status */}
      {cronStatus && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Tâches Automatiques
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cronStatus.jobs?.map((job, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {job.name === 'stock-check' ? '📦 Vérification Stock' : 
                     job.name === 'delayed-order-refund' ? '💰 Remboursements Auto' : 
                     job.name}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.running 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {job.running ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {job.schedule}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Manual Controls */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Contrôles Manuels
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              📦 Vérification des Stocks
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Déclencher manuellement la vérification des stocks faibles 
              pour envoyer des notifications aux vendeurs.
            </p>
            <Button 
              onClick={triggerStockCheck}
              disabled={loading}
              size="sm"
              className="w-full"
            >
              {loading ? 'Vérification...' : 'Vérifier Stocks'}
            </Button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              💰 Vérification Remboursements
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Déclencher manuellement la vérification des commandes 
              en retard pour traiter les remboursements automatiques.
            </p>
            <Button 
              onClick={triggerRefundCheck}
              disabled={loading}
              size="sm"
              className="w-full"
              variant="secondary"
            >
              {loading ? 'Vérification...' : 'Vérifier Remboursements'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Last Refund Check Results */}
      {lastRefundCheck && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Dernière Vérification des Remboursements
            </h3>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Commandes traitées</p>
                <p className="text-2xl font-bold text-green-600">
                  {lastRefundCheck.data?.processedCount || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Remboursements réussis</p>
                <p className="text-2xl font-bold text-blue-600">
                  {lastRefundCheck.data?.results?.filter(r => r.success).length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Erreurs</p>
                <p className="text-2xl font-bold text-red-600">
                  {lastRefundCheck.data?.results?.filter(r => !r.success).length || 0}
                </p>
              </div>
            </div>

            {lastRefundCheck.data?.results?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Détails:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {lastRefundCheck.data.results.map((result, index) => (
                    <div key={index} className={`text-sm p-2 rounded ${
                      result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Commande {result.orderId}: {result.success ? 
                        `Remboursé ${result.refundAmount} FCFA` : 
                        `Erreur: ${result.error}`
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Protection Policy Info */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Politique de Protection Client
          </h3>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
              3
            </span>
            <div>
              <p className="font-medium text-gray-900">Délai de 3 jours</p>
              <p className="text-gray-600">
                Les commandes payées qui restent en attente plus de 3 jours sont automatiquement remboursées
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">
              📧
            </span>
            <div>
              <p className="font-medium text-gray-900">Notifications automatiques</p>
              <p className="text-gray-600">
                Les clients reçoivent des emails à chaque changement de statut de leur commande
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">
              ⏰
            </span>
            <div>
              <p className="font-medium text-gray-900">Surveillance continue</p>
              <p className="text-gray-600">
                Le système vérifie les commandes toutes les 2 heures pour détecter les retards
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};