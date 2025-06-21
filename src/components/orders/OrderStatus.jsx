import React from 'react';
import { Clock, CheckCircle, Truck, Package, XCircle, AlertCircle, DollarSign } from 'lucide-react';

export const OrderStatusBadge = ({ status, paymentStatus, createdAt, className = '' }) => {
  const getStatusConfig = () => {
    const daysSincePlaced = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    
    switch (status) {
      case 'pending':
        if (paymentStatus !== 'completed') {
          return {
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: Clock,
            text: 'Paiement en attente'
          };
        }
        if (daysSincePlaced >= 3) {
          return {
            color: 'bg-orange-100 text-orange-800 border-orange-200',
            icon: AlertCircle,
            text: 'Éligible remboursement'
          };
        }
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
          text: 'En attente'
        };
        
      case 'processing':
        return {
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: CheckCircle,
          text: 'En cours'
        };
        
      case 'shipped':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Truck,
          text: 'Expédiée'
        };
        
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Package,
          text: 'Livrée'
        };
        
      case 'cancelled':
        return {
          color: paymentStatus === 'refunded' 
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
            : 'bg-red-100 text-red-800 border-red-200',
          icon: paymentStatus === 'refunded' ? DollarSign : XCircle,
          text: paymentStatus === 'refunded' ? 'Remboursée' : 'Annulée'
        };
        
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          text: status
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color} ${className}`}>
      <Icon className="w-4 h-4 mr-1.5" />
      {config.text}
    </span>
  );
};

export const OrderTimeline = ({ events, className = '' }) => {
  return (
    <div className={`flow-root ${className}`}>
      <ul className="-mb-8">
        {events.map((event, index) => (
          <li key={index}>
            <div className="relative pb-8">
              {index !== events.length - 1 && (
                <span
                  className={`absolute top-5 left-5 -ml-px h-full w-0.5 ${
                    event.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${
                      event.completed
                        ? 'bg-green-500 text-white'
                        : event.status === 'warning'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {event.icon}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className={`font-medium ${
                        event.completed 
                          ? 'text-gray-900' 
                          : event.status === 'warning'
                          ? 'text-orange-900'
                          : 'text-gray-500'
                      }`}>
                        {event.title}
                      </span>
                    </div>
                    {event.date && (
                      <p className="mt-0.5 text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>{event.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const AutoRefundWarning = ({ daysUntilRefund, orderTotal, className = '' }) => {
  if (daysUntilRefund === null || daysUntilRefund > 1) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (daysUntilRefund === 0) {
    return (
      <div className={`bg-orange-50 border border-orange-200 rounded-lg p-4 ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-orange-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800">
              Remboursement automatique éligible
            </h3>
            <div className="mt-2 text-sm text-orange-700">
              <p>
                Votre commande est éligible au remboursement automatique car elle est restée 
                en attente pendant plus de 3 jours. Si le vendeur ne la traite pas rapidement, 
                vous serez automatiquement remboursé de <strong>{formatCurrency(orderTotal)}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Clock className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Remboursement automatique dans {daysUntilRefund} jour{daysUntilRefund > 1 ? 's' : ''}
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Si le vendeur ne traite pas votre commande dans {daysUntilRefund} jour{daysUntilRefund > 1 ? 's' : ''}, 
              vous serez automatiquement remboursé de <strong>{formatCurrency(orderTotal)}</strong> 
              pour vous protéger contre les retards excessifs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CustomerProtectionInfo = ({ protectionInfo, className = '' }) => {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🛡️</span>
          </div>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-blue-900">
            {protectionInfo.title}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {protectionInfo.features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">{feature.icon}</span>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">
                {feature.title}
              </h4>
              <p className="text-sm text-blue-700">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          {protectionInfo.policy.title}
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          {protectionInfo.policy.points.map((point, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};