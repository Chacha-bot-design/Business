import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    role: 'SELLER',
    phone: '',
    address: '',
    first_name: '',
    last_name: '',
    salary: '',
    date_of_birth: '',
    is_active: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, formData);
        alert('User updated successfully!');
      } else {
        await usersAPI.create(formData);
        alert('User created successfully!');
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({
        username: '', email: '', password: '', password_confirm: '',
        role: 'SELLER', phone: '', address: '', first_name: '',
        last_name: '', salary: '', date_of_birth: '', is_active: true
      });
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      password_confirm: '',
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      salary: user.salary || '',
      date_of_birth: user.date_of_birth || '',
      is_active: user.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.delete(userId);
        alert('User deleted successfully!');
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Enter new password for this user:');
    if (newPassword) {
      try {
        await usersAPI.resetPassword(userId, { new_password: newPassword });
        alert('Password reset successfully!');
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('Error resetting password');
      }
    }
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      BOSS: 'role-badge boss',
      MANAGER: 'role-badge manager',
      SELLER: 'role-badge seller'
    };
    return <span className={roleStyles[role]}>{role}</span>;
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="user-management">
      <div className="management-header">
        <h3>User Management</h3>
        <button 
          className="add-user-button"
          onClick={() => {
            setEditingUser(null);
            setShowForm(true);
            setFormData({
              username: '', email: '', password: '', password_confirm: '',
              role: 'SELLER', phone: '', address: '', first_name: '',
              last_name: '', salary: '', date_of_birth: '', is_active: true
            });
          }}
        >
          + Add New User
        </button>
      </div>

      {showForm && (
        <div className="user-form-card">
          <div className="form-header">
            <h4>{editingUser ? 'Edit User' : 'Create New User'}</h4>
          </div>
          <div className="form-body">
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required={!editingUser}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.password_confirm}
                    onChange={(e) => setFormData({...formData, password_confirm: e.target.value})}
                    required={!editingUser}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="SELLER">Seller</option>
                    <option value="MANAGER">Manager</option>
                    <option value="BOSS">Boss</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <label className="form-check-label">Active User</label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="users-table-card">
        <div className="table-header">
          <h4>All Users ({users.length})</h4>
        </div>
        <div className="table-body">
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td><span className="employee-id">{user.employee_id}</span></td>
                    <td>{user.username}</td>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.email}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{user.phone || '-'}</td>
                    <td>
                      <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-button edit"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-button reset"
                          onClick={() => handleResetPassword(user.id)}
                        >
                          Reset Password
                        </button>
                        <button
                          className="action-button delete"
                          onClick={() => handleDelete(user.id)}
                          disabled={user.role === 'BOSS'}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;