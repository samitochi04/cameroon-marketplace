import React from 'react';
import { CheckCircle, Clock, Bell, Shield, Mail } from 'lucide-react';

export const OrderConfirmationNotification = ({ orderStatus, className = '' }) => {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Bell className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-blue-900">
            📧 Notifications par Email Activées
          </h3>
          <p className="text-blue-700">
            Vous recevrez des mises à jour automatiques sur votre commande
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Commande acceptée</h4>
            <p className="text-sm text-blue-700">
              Quand le vendeur accepte votre commande
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Commande livrée</h4>
            <p className="text-sm text-blue-700">
              Confirmation de livraison par le vendeur
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Protection automatique</h4>
            <p className="text-sm text-blue-700">
              Remboursement si pas de traitement en 3 jours
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Toutes les mises à jour</h4>
            <p className="text-sm text-blue-700">
              Suivi en temps réel par email
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-blue-600 mr-2" />
          <p className="text-sm font-medium text-blue-900">
            Prochaine étape: Le vendeur va traiter votre commande
          </p>
        </div>
        <p className="text-sm text-blue-700 mt-1 ml-7">
          Vous recevrez un email dès que le vendeur accepte votre commande. 
          Si aucune action n'est prise dans les 3 jours, vous serez automatiquement remboursé.
        </p>
      </div>
    </div>
  );
};

export const CustomerProtectionBanner = ({ className = '' }) => {
  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center">
        <Shield className="h-5 w-5 text-green-600 mr-2" />
        <div>
          <h4 className="text-sm font-semibold text-green-900">
            🛡️ Protection Acheteur Cameroon Marketplace
          </h4>
          <p className="text-sm text-green-700">
            Remboursement automatique garanti si votre commande n'est pas traitée dans les 3 jours
          </p>
        </div>
      </div>
    </div>
  );
};

export const OrderNextSteps = ({ orderId, className = '' }) => {
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📋 Prochaines étapes
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">1</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Attendre la confirmation</h4>
            <p className="text-sm text-gray-600">
              Le vendeur va examiner et accepter votre commande. Vous recevrez un email de confirmation.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">2</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Préparation et expédition</h4>
            <p className="text-sm text-gray-600">
              Une fois acceptée, votre commande sera préparée et expédiée. Suivi par email.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">3</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Livraison</h4>
            <p className="text-sm text-gray-600">
              Réception de votre commande et confirmation de livraison par email.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-yellow-600 mr-2" />
          <p className="text-sm font-medium text-yellow-900">
            Protection automatique active
          </p>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          Si votre commande n'est pas traitée dans les 3 jours, elle sera automatiquement 
          annulée et vous serez remboursé intégralement.
        </p>
      </div>
    </div>
  );
};