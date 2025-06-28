import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Bell, Mail, Phone, Shield, Clock } from 'lucide-react';

export const NotificationSettings = ({ className = '' }) => {
  const [emailNotifications, setEmailNotifications] = useState({
    orderAccepted: true,
    orderDelivered: true,
    orderCancelled: true,
    autoRefundWarning: true,
    orderUpdates: true
  });

  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Paramètres de notification sauvegardés avec succès!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    {
      key: 'orderAccepted',
      title: 'Commande acceptée',
      description: 'Quand un vendeur accepte votre commande',
      icon: Bell,
      enabled: emailNotifications.orderAccepted
    },
    {
      key: 'orderDelivered', 
      title: 'Commande livrée',
      description: 'Confirmation de livraison par le vendeur',
      icon: Mail,
      enabled: emailNotifications.orderDelivered
    },
    {
      key: 'orderCancelled',
      title: 'Commande annulée/remboursée',
      description: 'En cas d\'annulation ou de remboursement automatique',
      icon: Shield,
      enabled: emailNotifications.orderCancelled
    },
    {
      key: 'autoRefundWarning',
      title: 'Avertissement remboursement',
      description: 'Quand votre commande approche des 3 jours sans traitement',
      icon: Clock,
      enabled: emailNotifications.autoRefundWarning
    },
    {
      key: 'orderUpdates',
      title: 'Mises à jour de commande',
      description: 'Tous les changements de statut de vos commandes',
      icon: Bell,
      enabled: emailNotifications.orderUpdates
    }
  ];

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <Bell className="h-6 w-6 text-blue-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Paramètres de Notification
          </h2>
          <p className="text-gray-600 text-sm">
            Gérez vos préférences d'email pour le suivi des commandes
          </p>
        </div>
      </div>

      {/* Protection Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-2">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-blue-900">Protection Automatique</h3>
        </div>
        <p className="text-sm text-blue-700">
          Nos notifications automatiques vous protègent en vous tenant informé 
          de chaque étape de vos commandes. Le remboursement automatique après 
          3 jours est toujours actif, même si vous désactivez certaines notifications.
        </p>
      </div>

      {/* Notification Settings */}
      <div className="space-y-4">
        {notificationTypes.map((notification) => {
          const Icon = notification.icon;
          
          return (
            <div key={notification.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {notification.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={notification.enabled}
                onChange={(checked) => {
                  setEmailNotifications(prev => ({
                    ...prev,
                    [notification.key]: checked
                  }));
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Email Configuration */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-2">
          <Mail className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="font-medium text-gray-900">Configuration Email</h3>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Les notifications seront envoyées à votre adresse email principale.
          Vérifiez vos dossiers de spam si vous ne recevez pas d'emails.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">
            📧 Emails envoyés vers les dossiers principaux
          </span>
          <span className="text-xs text-green-600 font-medium">
            ✓ Configuré
          </span>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          💡 <strong>Astuce:</strong> Même si vous désactivez certaines notifications, 
          la protection automatique contre les retards reste active. Vous serez 
          toujours remboursé si une commande n'est pas traitée dans les 3 jours.
        </p>
      </div>
    </Card>
  );
};