import React, { useState, useEffect } from 'react';
import { productsAPI, salesAPI } from '../services/api';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (product.stock_quantity === 0) return;
    
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const processSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    try {
      const saleData = {
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price
        })),
        payment_method: 'CASH'
      };
      
      await salesAPI.create(saleData);
      setCart([]);
      alert('Sale completed successfully!');
      loadProducts();
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error processing sale');
    }
  };

  const cartTotal = cart.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0
  );

  return (
    <div className="seller-dashboard">
      <div className="dashboard-header">
        <h2>Seller Dashboard - Point of Sale</h2>
        <div className="cart-summary">
          <strong>Cart Total: ${cartTotal.toLocaleString()}</strong>
          {cart.length > 0 && (
            <button 
              onClick={processSale}
              className="sale-button"
            >
              Complete Sale
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="products-section">
          <h3>Available Products</h3>
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className={`product-card ${product.stock_quantity === 0 ? 'out-of-stock' : ''}`}>
                  <div className="product-info">
                    <h4 className="product-name">{product.name}</h4>
                    <p className="product-price">Price: ${product.price}</p>
                    <p className="product-stock">Stock: {product.stock_quantity}</p>
                    <p className="product-category">Category: {product.category_name}</p>
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.stock_quantity === 0}
                    className="add-to-cart-button"
                  >
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="cart-section">
          <div className="cart-card">
            <div className="cart-header">
              <h3>Current Sale</h3>
            </div>
            <div className="cart-body">
              {cart.length === 0 ? (
                <p className="empty-cart">Cart is empty</p>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map(item => (
                      <div key={item.product.id} className="cart-item">
                        <div className="item-info">
                          <strong>{item.product.name}</strong>
                          <span className="item-price">${item.product.price} each</span>
                        </div>
                        <div className="item-controls">
                          <button 
                            className="quantity-button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button 
                            className="quantity-button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock_quantity}
                          >
                            +
                          </button>
                          <button 
                            onClick={() => removeFromCart(item.product.id)}
                            className="remove-button"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-total">
                    <div className="total-line">
                      <strong>Total:</strong>
                      <strong>${cartTotal.toLocaleString()}</strong>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;