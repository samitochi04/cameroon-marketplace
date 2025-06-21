import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderStatusBadge, OrderTimeline, AutoRefundWarning, CustomerProtectionInfo } from '@/components/orders/OrderStatus';
import { customerNotificationService } from '@/services/customerNotificationService';
import { ArrowLeft, Package, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

const CustomerOrderDetailEnhanced = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await customerNotificationService.getOrderDetails(orderId);
      setOrder(orderData);
      setError(null);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Erreur lors du chargement des détails de la commande');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchOrderDetails();
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error || 'Commande non trouvée'}</p>
          <div className="space-x-2">
            <Button onClick={() => navigate('/account/orders')} variant="outline">
              Retour aux commandes
            </Button>
            <Button onClick={fetchOrderDetails}>Réessayer</Button>
          </div>
        </Card>
      </div>
    );
  }

  const protectionInfo = customerNotificationService.getProtectionInfo();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/account/orders')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Commande #{order.id.slice(-8)}
            </h1>
            <p className="text-gray-600">
              Passée le {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <OrderStatusBadge 
            status={order.status}
            paymentStatus={order.payment_status}
            createdAt={order.created_at}
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Auto Refund Warning */}
      <AutoRefundWarning 
        daysUntilRefund={order.daysUntilAutoRefund}
        orderTotal={order.total_amount}
        className="mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Suivi de commande</h2>
            </div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">Statut actuel</p>
              <p className="text-sm text-gray-600">{order.statusMessage}</p>
            </div>
            <OrderTimeline events={order.timelineEvents} />
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Package className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Articles commandés</h2>
            </div>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                    {item.image && item.image !== '/product-placeholder.jpg' ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Prix unitaire: {formatCurrency(item.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Livraison</span>
                <span className="text-gray-900">
                  {order.shipping_fee > 0 ? formatCurrency(order.shipping_fee) : 'Gratuite'}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Shipping Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Livraison</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">Adresse</p>
                <div className="text-gray-600 mt-1">
                  <p>{order.shipping_address.fullName}</p>
                  <p>{order.shipping_address.address}</p>
                  <p>{order.shipping_address.city}</p>
                  <p>{order.shipping_address.region}</p>
                  <p>{order.shipping_address.phoneNumber}</p>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Méthode</p>
                <p className="text-gray-600 mt-1">{order.shipping_method}</p>
              </div>
            </div>
          </Card>

          {/* Payment Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Paiement</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Méthode</span>
                <span className="text-gray-900">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut</span>
                <span className={`font-medium ${
                  order.payment_status === 'completed' ? 'text-green-600' :
                  order.payment_status === 'refunded' ? 'text-blue-600' :
                  'text-yellow-600'
                }`}>
                  {order.payment_status === 'completed' ? 'Payé' :
                   order.payment_status === 'refunded' ? 'Remboursé' :
                   'En attente'}
                </span>
              </div>
              {order.payment_intent_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Référence</span>
                  <span className="text-gray-900 font-mono text-xs">
                    {order.payment_intent_id}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Customer Protection */}
          <CustomerProtectionInfo protectionInfo={protectionInfo} />
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderDetailEnhanced;