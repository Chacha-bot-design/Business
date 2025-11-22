// components/SalesManagement.js
import React, { useState, useEffect } from 'react';
import { salesAPI, productsAPI } from '../services/api';

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    sale_price: '',
    payment_method: 'CASH'
  });

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getAll();
      setSales(response.data?.sales || response.data || []);
    } catch (error) {
      setError('Failed to fetch sales. Please check if the backend is running.');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await salesAPI.create({
        ...formData,
        quantity: parseInt(formData.quantity),
        sale_price: parseFloat(formData.sale_price)
      });
      
      setFormData({ product_id: '', quantity: '', sale_price: '', payment_method: 'CASH' });
      fetchSales();
      alert('Sale recorded successfully!');
    } catch (error) {
      setError('Failed to record sale: ' + error.message);
    }
  };

  return (
    <div className="sales-management">
      <h2>Sales Management</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="management-section">
        <h3>Record New Sale</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <select
              name="product_id"
              value={formData.product_id}
              onChange={(e) => setFormData({...formData, product_id: e.target.value})}
              required
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price}
                </option>
              ))}
            </select>
            
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              required
            />
          </div>
          
          <div className="form-row">
            <input
              type="number"
              name="sale_price"
              placeholder="Sale Price"
              value={formData.sale_price}
              onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
              required
            />
            
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="MOMO">Mobile Money</option>
            </select>
          </div>
          
          <button type="submit" className="btn-primary">Record Sale</button>
        </form>
      </div>

      <div className="sales-list">
        <h3>Sales History ({sales.length})</h3>
        {loading ? (
          <p>Loading sales...</p>
        ) : sales.length === 0 ? (
          <p className="no-data">No sales recorded yet. Record your first sale above.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale.id}>
                    <td>{sale.id}</td>
                    <td>{sale.product_name || `Product ${sale.product_id}`}</td>
                    <td>{sale.quantity}</td>
                    <td>${sale.sale_price?.toLocaleString()}</td>
                    <td>${(sale.quantity * sale.sale_price)?.toLocaleString()}</td>
                    <td>{sale.payment_method}</td>
                    <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesManagement;