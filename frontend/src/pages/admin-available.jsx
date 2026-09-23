import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin-available.css';

export default function AdminLaptopManager() {
  const [laptops, setLaptops] = useState([]);
  const [filteredLaptops, setFilteredLaptops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate(role ? '/' : '/login');
      return;
    }

    // Initial fetch
    fetchLaptops();

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchLaptops();
    }, 3000); // Update every 3 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchLaptops = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/laptops', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const normalized = Array.isArray(data) ? data : [];
      setLaptops(normalized);
      setFilteredLaptops(normalized);
    } catch (err) {
      console.error('Failed to fetch laptops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    const filtered = laptops.filter((laptop) => {
      const laptopText = `${laptop.brand || ''} ${laptop.model || ''} ${laptop.features || ''}`.toLowerCase();
      const matchesSearch = !searchLower || laptopText.includes(searchLower);
      const matchesBrand = selectedBrand === 'all' || laptop.brand === selectedBrand;
      const matchesStatus = selectedStatus === 'all' ||
        (selectedStatus === 'available' && laptop.status === 'Available') ||
        (selectedStatus === 'outofstock' && laptop.status === 'Out of Stock');
      const matchesType = selectedType === 'all' || laptop.subscriptionType === selectedType;
      return matchesSearch && matchesBrand && matchesStatus && matchesType;
    });

    setFilteredLaptops(filtered);
  }, [searchTerm, selectedBrand, selectedStatus, selectedType, laptops]);

  const brands = [...new Set(laptops.map(laptop => laptop.brand).filter(Boolean))];
  const subscriptionTypes = [...new Set(laptops.map(laptop => laptop.subscriptionType).filter(Boolean))];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('all');
    setSelectedStatus('all');
    setSelectedType('all');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this laptop?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/laptops/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      // ✅ Update UI immediately
      setLaptops(prev => prev.filter(l => l._id !== id));
      alert(data.message || 'Laptop deleted');
    } catch (err) {
      alert('Failed to delete laptop');
      console.error(err);
    }
  };

  return (
    <div className="admin-laptop-container">
      <h1 className="admin-laptop-header">📦 Manage Laptops</h1>

      <div className="filter-panel">
        <div className="filter-grid">
          <div className="filter-field filter-search">
            <label>Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search laptop, brand or feature..."
            />
          </div>

          <div className="filter-field">
            <label>Brand</label>
            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
              <option value="all">All brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Plan</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="all">All plans</option>
              {subscriptionTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="all">All status</option>
              <option value="available">Available</option>
              <option value="outofstock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <span className="results-summary">Showing {filteredLaptops.length} result{filteredLaptops.length !== 1 ? 's' : ''}</span>
          {(searchTerm || selectedBrand !== 'all' || selectedStatus !== 'all' || selectedType !== 'all') && (
            <button type="button" className="clear-filters-btn" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      </div>

      {/* Laptop List */}
      {loading ? (
        <p className="loading-text">Loading laptops...</p>
      ) : filteredLaptops.length === 0 ? (
        <p className="no-data-text">No laptops found for the selected filters.</p>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Laptop</th>
                <th>Status</th>
                <th>Price</th>
                <th>Features</th>
                <th>Size</th>
                <th>Subscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLaptops.map((laptop) => (
                <tr key={laptop._id}>
                  <td>
                    <span className="laptop-name">{laptop.brand} {laptop.model}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${laptop.status === 'Available' ? 'status-available' : 'status-outofstock'}`}>
                      {laptop.status || 'Available'}
                    </span>
                  </td>
                  <td className="price-cell">
                    KES {laptop.price}
                  </td>
                  <td className="features-cell">
                    {laptop.features}
                  </td>
                  <td>
                    {laptop.size}
                  </td>
                  <td>
                    {laptop.subscriptionType}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(laptop._id)}
                      className="delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
