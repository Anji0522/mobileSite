import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [cart, setCart] = useState({ items: [] });
  const [summary, setSummary] = useState({
    itemsCount: 0,
    itemsTotal: 0,
    itemsMrpTotal: 0,
    discountTotal: 0,
    shippingFee: 0,
    couponCode: '',
    couponDiscount: 0,
    grandTotal: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      // Local storage cart for guest
      try {
        const guestCart = JSON.parse(localStorage.getItem('mv_guest_cart') || '{"items":[]}');
        setCart(guestCart);
        const count = guestCart.items.reduce((sum, item) => sum + item.quantity, 0);
        const total = guestCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const mrpTotal = guestCart.items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
        setSummary({
          itemsCount: count,
          itemsTotal: total,
          itemsMrpTotal: mrpTotal,
          discountTotal: mrpTotal - total,
          shippingFee: total > 999 || total === 0 ? 0 : 99,
          couponCode: '',
          couponDiscount: 0,
          grandTotal: total > 999 || total === 0 ? total : total + 99,
        });
      } catch {
        // Ignore JSON error
      }
      return;
    }

    try {
      setLoading(true);
      const res = await cartAPI.get();
      if (res?.data) {
        setCart(res.data.cart || { items: [] });
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch {
      // Ignore initial cart fetch error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (itemType, itemId, variantSku, quantity = 1, itemMeta = null) => {
    if (!isAuthenticated) {
      // Add to guest cart
      const guestCart = JSON.parse(localStorage.getItem('mv_guest_cart') || '{"items":[]}');
      const existing = guestCart.items.find(
        (i) => i.itemId === itemId && (i.variantSku === variantSku || !variantSku)
      );

      if (existing) {
        existing.quantity += quantity;
      } else {
        guestCart.items.push({
          _id: `guest_${Date.now()}`,
          itemType,
          itemId,
          variantSku,
          name: itemMeta?.name || 'Product',
          image: itemMeta?.image || '',
          price: itemMeta?.price || 0,
          mrp: itemMeta?.mrp || itemMeta?.price || 0,
          quantity,
        });
      }

      localStorage.setItem('mv_guest_cart', JSON.stringify(guestCart));
      fetchCart();
      toast.success('Added to bag!');
      return;
    }

    try {
      setLoading(true);
      const res = await cartAPI.add({ itemType, itemId, variantSku, quantity });
      setCart(res.data.cart);
      setSummary(res.data.summary);
      toast.success('Added to cart!');
      return res.data;
    } catch (err) {
      toast.error(err.message || 'Failed to add item to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) {
      const guestCart = JSON.parse(localStorage.getItem('mv_guest_cart') || '{"items":[]}');
      if (quantity <= 0) {
        guestCart.items = guestCart.items.filter((i) => i._id !== itemId);
      } else {
        const item = guestCart.items.find((i) => i._id === itemId);
        if (item) item.quantity = quantity;
      }
      localStorage.setItem('mv_guest_cart', JSON.stringify(guestCart));
      fetchCart();
      return;
    }

    try {
      const res = await cartAPI.updateQty(itemId, quantity);
      setCart(res.data.cart);
      setSummary(res.data.summary);
    } catch (err) {
      toast.error(err.message || 'Could not update quantity');
    }
  };

  const removeItem = async (itemId) => {
    if (!isAuthenticated) {
      const guestCart = JSON.parse(localStorage.getItem('mv_guest_cart') || '{"items":[]}');
      guestCart.items = guestCart.items.filter((i) => i._id !== itemId);
      localStorage.setItem('mv_guest_cart', JSON.stringify(guestCart));
      fetchCart();
      toast.info('Item removed from cart');
      return;
    }

    try {
      const res = await cartAPI.remove(itemId);
      setCart(res.data.cart);
      setSummary(res.data.summary);
      toast.info('Item removed from cart');
    } catch (err) {
      toast.error(err.message || 'Could not remove item');
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await cartAPI.applyCoupon(code);
      setCart(res.data.cart);
      setSummary(res.data.summary);
      toast.success(res.message || 'Coupon applied!');
    } catch (err) {
      toast.error(err.message || 'Invalid coupon code');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      localStorage.removeItem('mv_guest_cart');
      fetchCart();
      return;
    }

    try {
      const res = await cartAPI.clear();
      setCart(res.data.cart);
      setSummary(res.data.summary);
    } catch (err) {
      toast.error(err.message || 'Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        summary,
        itemCount: summary.itemsCount || 0,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
