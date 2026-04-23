import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Dashboard() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    type: 'Lost',
    location: '',
    contactInfo: ''
  });

  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchItems();
    }
  }, [navigate]);

  const fetchItems = async () => {
    try {
      const res = await api.get('/items');
      setItems(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchItems();
      return;
    }
    try {
      const res = await api.get(`/items/search?name=${searchQuery}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const openModal = (item = null) => {
    setError('');
    if (item) {
      setEditingItem(item);
      setFormData({
        itemName: item.itemName,
        description: item.description,
        type: item.type,
        location: item.location,
        contactInfo: item.contactInfo
      });
    } else {
      setEditingItem(null);
      setFormData({
        itemName: '',
        description: '',
        type: 'Lost',
        location: '',
        contactInfo: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const onFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingItem) {
        await api.put(`/items/${editingItem._id}`, formData);
      } else {
        await api.post('/items', formData);
      }
      closeModal();
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/items/${id}`);
        fetchItems();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  return (
    <div>
      <nav className="navbar">
        <h1>Lost & Found</h1>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </nav>

      <div className="dashboard">
        <div className="top-controls">
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => openModal()}>
            + Add New Item
          </button>
          
          <form className="search-bar" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Search items by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>

        <div className="items-grid">
          {items.map(item => (
            <div key={item._id} className="item-card">
              <span className={`badge ${item.type.toLowerCase()}`}>{item.type}</span>
              <h3>{item.itemName}</h3>
              <p><strong>Description:</strong> {item.description}</p>
              <p><strong>Location:</strong> {item.location}</p>
              <p><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</p>
              <p><strong>Contact:</strong> {item.contactInfo}</p>
              <p><strong>Posted By:</strong> {item.postedBy?.name || 'Unknown'}</p>
              
              {currentUserId === item.postedBy?._id && (
                <div className="card-actions">
                  <button onClick={() => openModal(item)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="btn-delete">Delete</button>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && <p>No items found.</p>}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={onFormSubmit}>
              <div className="form-group">
                <label>Item Name</label>
                <input type="text" name="itemName" value={formData.itemName} onChange={onFormChange} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={onFormChange} required>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={onFormChange} rows="3"></textarea>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={onFormChange} required />
              </div>
              <div className="form-group">
                <label>Contact Info</label>
                <input type="text" name="contactInfo" value={formData.contactInfo} onChange={onFormChange} required />
              </div>
              <div className="button-group">
                <button type="submit" className="btn btn-primary">{editingItem ? 'Update' : 'Save'}</button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
