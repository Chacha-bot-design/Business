import React, { useState, useEffect } from 'react';
import { transactionAPI, productAPI } from '../services/api';

const TransactionForm = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product: '',
    transaction_type: 'SALE',
    quantity: 1,
    unit_price: 0,
    notes: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await transactionAPI.create(formData);
      alert('Transaction recorded successfully!');
      setFormData({
        product: '',
        transaction_type: 'SALE',
        quantity: 1,
        unit_price: 0,
        notes: ''
      });
      fetchProducts(); // Refresh products to update stock
    } catch (error) {
      alert('Error recording transaction: ' + error.response?.data?.detail || error.message);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });

    // Auto-fill unit price when product is selected
    if (e.target.name === 'product') {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        setFormData(prev => ({
          ...prev,
          unit_price: selectedProduct.price
        }));
      }
    }
  };

  return (
    <div className="transaction-form">
      <h2>Record Transaction</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product:</label>
          <select
            name="product"
            value={formData.product}
            onChange={handleChange}
            required
          >
            <option value="">Select Product</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} (Stock: {product.current_stock})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Transaction Type:</label>
          <select
            name="transaction_type"
            value={formData.transaction_type}
            onChange={handleChange}
            required
          >
            <option value="SALE">Sale</option>
            <option value="PURCHASE">Purchase</option>
            <option value="RETURN">Return</option>
          </select>
        </div>

        <div className="form-group">
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Unit Price:</label>
          <input
            type="number"
            step="0.01"
            name="unit_price"
            value={formData.unit_price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Notes:</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-primary">
          Record Transaction
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;