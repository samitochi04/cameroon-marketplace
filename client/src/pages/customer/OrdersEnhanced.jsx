import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderStatusBadge, AutoRefundWarning, CustomerProtectionInfo } from '@/components/orders/OrderStatus';
import { customerNotificationService } from '@/services/customerNotificationService';
import { Eye, Package, Clock, AlertTriangle } from 'lucide-react';

const CustomerOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await customerNotificationService.getCustomerOrders();
      setOrders(ordersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
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
      year: 'numeric'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.status === 'pending';
    if (filter === 'processing') return order.status === 'processing';
    if (filter === 'delivered') return order.status === 'delivered';
    if (filter === 'cancelled') return order.status === 'cancelled';
    if (filter === 'refundable') return order.canBeRefunded;
    return true;
  });

  const getFilterStats = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      refundable: orders.filter(o => o.canBeRefunded).length
    };
  };

  const stats = getFilterStats();
  const protectionInfo = customerNotificationService.getProtectionInfo();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchOrders}>Réessayer</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
        <Button onClick={fetchOrders} variant="outline">
          Actualiser
        </Button>
      </div>

      {/* Customer Protection Info */}
      <CustomerProtectionInfo protectionInfo={protectionInfo} className="mb-6" />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {[
          { key: 'all', label: `Toutes (${stats.all})`, icon: Package },
          { key: 'pending', label: `En attente (${stats.pending})`, icon: Clock },
          { key: 'processing', label: `En cours (${stats.processing})`, icon: Package },
          { key: 'delivered', label: `Livrées (${stats.delivered})`, icon: Package },
          { key: 'cancelled', label: `Annulées (${stats.cancelled})`, icon: Package },
          ...(stats.refundable > 0 ? [{ key: 'refundable', label: `Éligibles remboursement (${stats.refundable})`, icon: AlertTriangle }] : [])
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 flex items-center space-x-2 ${
              filter === key
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'Aucune commande' : 'Aucune commande dans cette catégorie'}
          </h2>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? 'Vous n\'avez pas encore passé de commande.'
              : 'Aucune commande ne correspond à ce filtre.'
            }
          </p>
          {filter === 'all' && (
            <Link to="/products">
              <Button>Découvrir nos produits</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-6">
              {/* Auto Refund Warning */}
              <AutoRefundWarning 
                daysUntilRefund={order.daysUntilAutoRefund}
                orderTotal={order.total_amount}
                className="mb-4"
              />

              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Commande #{order.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Passée le {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center space-x-4 mt-2 md:mt-0">
                  <OrderStatusBadge 
                    status={order.status}
                    paymentStatus={order.payment_status}
                    createdAt={order.created_at}
                  />
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>{order.statusMessage}</p>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>Méthode de paiement: {order.payment_method}</p>
                  <p>Livraison: {order.shipping_method}</p>
                </div>
                <Link to={`/account/orders/${order.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Voir détails
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;