import { supabase } from '@/lib/supabase';
import axios from 'axios';

class CustomerNotificationService {
  // Get customer's orders with enhanced status information
  async getCustomerOrders() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/orders/my-orders`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.success) {
        return response.data.orders.map(order => ({
          ...order,
          canBeRefunded: this.canOrderBeRefunded(order),
          daysUntilAutoRefund: this.getDaysUntilAutoRefund(order),
          statusMessage: this.getOrderStatusMessage(order)
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  }

  // Get specific order details
  async getOrderDetails(orderId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.success) {
        const order = response.data.order;
        return {
          ...order,
          canBeRefunded: this.canOrderBeRefunded(order),
          daysUntilAutoRefund: this.getDaysUntilAutoRefund(order),
          statusMessage: this.getOrderStatusMessage(order),
          timelineEvents: this.generateOrderTimeline(order)
        };
      }

      throw new Error('Order not found');
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  // Check if order can be refunded (pending > 3 days)
  canOrderBeRefunded(order) {
    if (order.status !== 'pending' || order.payment_status !== 'completed') {
      return false;
    }

    const orderDate = new Date(order.created_at);
    const now = new Date();
    const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
    
    return daysDiff >= 3;
  }

  // Calculate days until automatic refund
  getDaysUntilAutoRefund(order) {
    if (order.status !== 'pending' || order.payment_status !== 'completed') {
      return null;
    }

    const orderDate = new Date(order.created_at);
    const now = new Date();
    const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, 3 - daysDiff);
  }

  // Get user-friendly status message
  getOrderStatusMessage(order) {
    const daysSincePlaced = Math.floor((new Date() - new Date(order.created_at)) / (1000 * 60 * 60 * 24));
    
    switch (order.status) {
      case 'pending':
        if (order.payment_status !== 'completed') {
          return 'Paiement en attente';
        }
        if (daysSincePlaced >= 3) {
          return 'Commande éligible au remboursement automatique';
        }
        if (daysSincePlaced >= 2) {
          return `Commande en attente depuis ${daysSincePlaced} jours - Remboursement automatique dans ${3 - daysSincePlaced} jour(s)`;
        }
        return 'En attente de traitement par le vendeur';
        
      case 'processing':
        return 'Commande acceptée - En cours de préparation';
        
      case 'shipped':
        return 'Commande expédiée - En transit';
        
      case 'delivered':
        return 'Commande livrée avec succès';
        
      case 'cancelled':
        if (order.payment_status === 'refunded') {
          return 'Commande annulée - Remboursement effectué';
        }
        return 'Commande annulée';
        
      default:
        return order.status;
    }
  }

  // Generate order timeline events
  generateOrderTimeline(order) {
    const events = [];
    const orderDate = new Date(order.created_at);
    const now = new Date();

    // Order placed
    events.push({
      status: 'placed',
      date: order.created_at,
      title: 'Commande passée',
      description: 'Votre commande a été enregistrée avec succès',
      completed: true,
      icon: '📝'
    });

    // Payment
    if (order.payment_status === 'completed') {
      events.push({
        status: 'paid',
        date: order.created_at, // Assuming payment was immediate
        title: 'Paiement confirmé',
        description: 'Votre paiement a été traité avec succès',
        completed: true,
        icon: '💳'
      });
    }

    // Processing
    if (['processing', 'shipped', 'delivered'].includes(order.status)) {
      events.push({
        status: 'processing',
        date: order.updated_at,
        title: 'Commande acceptée',
        description: 'Le vendeur a accepté votre commande et la prépare',
        completed: true,
        icon: '✅'
      });
    }

    // Shipped
    if (['shipped', 'delivered'].includes(order.status)) {
      events.push({
        status: 'shipped',
        date: order.updated_at,
        title: 'Commande expédiée',
        description: 'Votre commande est en route',
        completed: true,
        icon: '🚚'
      });
    }

    // Delivered
    if (order.status === 'delivered') {
      events.push({
        status: 'delivered',
        date: order.updated_at,
        title: 'Commande livrée',
        description: 'Votre commande a été livrée avec succès',
        completed: true,
        icon: '📦'
      });
    }

    // Cancelled/Refunded
    if (order.status === 'cancelled') {
      events.push({
        status: 'cancelled',
        date: order.updated_at,
        title: order.payment_status === 'refunded' ? 'Commande remboursée' : 'Commande annulée',
        description: order.payment_status === 'refunded' 
          ? 'Votre commande a été annulée et remboursée automatiquement'
          : 'Votre commande a été annulée',
        completed: true,
        icon: order.payment_status === 'refunded' ? '💰' : '❌'
      });
    }

    // Pending warning for old orders
    if (order.status === 'pending' && order.payment_status === 'completed') {
      const daysSince = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
      if (daysSince >= 2) {
        events.push({
          status: 'warning',
          date: null,
          title: daysSince >= 3 ? 'Remboursement automatique éligible' : 'Attention',
          description: daysSince >= 3 
            ? 'Votre commande sera automatiquement remboursée si le vendeur ne la traite pas'
            : `Si le vendeur ne traite pas votre commande dans ${3 - daysSince} jour(s), elle sera automatiquement remboursée`,
          completed: false,
          icon: daysSince >= 3 ? '⚠️' : '⏰'
        });
      }
    }

    return events.sort((a, b) => new Date(a.date || now) - new Date(b.date || now));
  }

  // Get protection policy information for customers
  getProtectionInfo() {
    return {
      title: 'Protection Acheteur',
      features: [
        {
          icon: '🛡️',
          title: 'Remboursement automatique',
          description: 'Si votre commande reste en attente plus de 3 jours, vous serez automatiquement remboursé'
        },
        {
          icon: '📧',
          title: 'Notifications en temps réel',
          description: 'Recevez des emails à chaque étape de votre commande'
        },
        {
          icon: '💰',
          title: 'Remboursement complet',
          description: 'Récupérez 100% du montant payé en cas de problème'
        },
        {
          icon: '⏰',
          title: 'Traitement rapide',
          description: 'Les vendeurs sont encouragés à traiter les commandes rapidement'
        }
      ],
      policy: {
        title: 'Politique de remboursement',
        points: [
          'Les commandes payées qui restent en attente plus de 3 jours sont automatiquement remboursées',
          'Le remboursement est traité immédiatement et apparaît sous 3-5 jours ouvrables',
          'Vous recevez un email de confirmation avec tous les détails',
          'Aucune action de votre part n\'est requise pour le remboursement automatique'
        ]
      }
    };
  }
}

export const customerNotificationService = new CustomerNotificationService();