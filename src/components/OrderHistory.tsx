import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useCart } from '../contexts/CartContext';
import { X, Clock, CheckCircle, Package, XCircle, RotateCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  items: any[];
  total: number;
  status: string;
  order_type: string;
  created_at: string;
}

interface OrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ isOpen, onClose }) => {
  const { currentRestaurant } = useRestaurant();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && currentRestaurant) {
      fetchOrders();
    }
  }, [isOpen, currentRestaurant]);

  const fetchOrders = async () => {
    if (!currentRestaurant) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', currentRestaurant.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setOrders(data);
    }
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'confirmed':
      case 'preparing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'ready':
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleOrderAgain = (order: Order) => {
    if (!order.items || !Array.isArray(order.items)) return;

    order.items.forEach((item: any) => {
      addToCart({
        menu_item_id: item.menu_item_id || '',
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity || 1,
        customizations: item.customizations || []
      });
    });

    onClose();
    alert(`${order.items.length} item(s) added to cart!`);
  };

  if (!isOpen || !currentRestaurant) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full md:max-w-lg bg-white shadow-2xl overflow-hidden flex flex-col">
        <div
          className="p-6 text-white flex items-center justify-between"
          style={{ backgroundColor: currentRestaurant.primary_color }}
        >
          <div>
            <h2 className="text-2xl font-bold">Order History</h2>
            <p className="text-sm opacity-90">View your current and past orders</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: currentRestaurant.primary_color }}></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600">Your order history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-900">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{order.customer_phone}</p>
                  </div>

                  <div className="space-y-2 mb-3">
                    {order.items && Array.isArray(order.items) && order.items.slice(0, 3).map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          <span className="font-medium">{item.quantity}x</span> {item.name}
                        </span>
                        <span className="text-gray-900 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <p className="text-xs text-gray-500">+{order.items.length - 3} more items</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{order.order_type}</span>
                      <span className="text-lg font-bold" style={{ color: currentRestaurant.accent_color }}>
                        ${Number(order.total).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleOrderAgain(order)}
                      className="w-full py-2 px-4 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
                      style={{ backgroundColor: currentRestaurant.accent_color }}
                    >
                      <RotateCw className="w-4 h-4" />
                      Order Again
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
