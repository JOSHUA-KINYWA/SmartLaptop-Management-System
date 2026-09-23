import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AvailableLaptops() {
  const [laptops, setLaptops] = useState([]);
  const [filteredLaptops, setFilteredLaptops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = String(localStorage.getItem('role') || '').toLowerCase();
    if (!storedRole || storedRole !== 'student') {
      setAuthorized(false);
      navigate(storedRole ? '/dashboard' : '/login');
      return;
    }

    setAuthorized(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthorized(false);
      navigate('/login');
      return;
    }

    fetch('http://localhost:5000/api/laptops', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch laptops');
        }
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }
        setLaptops(data);
        setFilteredLaptops(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching laptops:', err);
        setLaptops([]);
        setLoading(false);
        // Show error message in the UI
        const errorDiv = document.createElement('div');
        errorDiv.style.backgroundColor = '#fee2e2';
        errorDiv.style.color = '#dc2626';
        errorDiv.style.padding = '1rem';
        errorDiv.style.borderRadius = '0.5rem';
        errorDiv.style.marginBottom = '1rem';
        errorDiv.textContent = 'Failed to load laptops. Please try again later.';
        document.querySelector('div[style*="maxWidth: 1400"]')?.prepend(errorDiv);
      });
  }, [navigate]);

  // Filter laptops based on search term and all applicable filters
  useEffect(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    const filtered = laptops.filter(laptop => {
      const laptopText = `${laptop.brand || ''} ${laptop.model || ''} ${laptop.features || ''} ${laptop.size || ''}`.toLowerCase();
      const matchesSearch = !searchLower || laptopText.includes(searchLower);
      const matchesBrand = selectedBrand === 'all' || laptop.brand === selectedBrand;
      const matchesType = selectedType === 'all' || laptop.subscriptionType === selectedType;
      const matchesStatus = selectedStatus === 'all' ||
        (selectedStatus === 'available' && laptop.status === 'Available') ||
        (selectedStatus === 'outofstock' && laptop.status === 'Out of Stock');
      const matchesPrice = !maxPrice || Number(laptop.price || 0) <= Number(maxPrice);

      return matchesSearch && matchesBrand && matchesType && matchesStatus && matchesPrice;
    });

    setFilteredLaptops(filtered);
  }, [searchTerm, selectedBrand, selectedType, selectedStatus, maxPrice, laptops]);

  const brands = [...new Set(laptops.map(laptop => laptop.brand).filter(Boolean))];
  const subscriptionTypes = [...new Set(laptops.map(laptop => laptop.subscriptionType).filter(Boolean))];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('all');
    setSelectedType('all');
    setSelectedStatus('all');
    setMaxPrice('');
  };

  const handleApply = (laptopId) => {
    navigate(`/applications/${laptopId}`);
  };

  const deleteLaptop = async (laptopId) => {
    if (!window.confirm('Are you sure you want to delete this laptop?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/laptops/${laptopId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setLaptops(laptops.filter(laptop => laptop._id !== laptopId));
    } catch (error) {
      console.error('Error deleting laptop:', error);
      alert('Failed to delete laptop. Please try again.');
    }
  };

  if (authorized === false) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '2rem 1rem',
      fontFamily: 'Segoe UI, sans-serif',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* Title Box */}
        <div style={{
          background: '#dbeafe',
          padding: '1.2rem',
          borderRadius: '10px',
          textAlign: 'center',
          marginBottom: '2rem',
          border: '2px solid #1e3a8a',
        }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#1e3a8a',
          }}>
             Available Laptops for Rent
          </h1>
        </div>

        {/* Search and filter controls */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', gridColumn: 'span 2' }}>
              <span style={{ fontSize: '18px' }}>🔍</span>
              <input
                type="text"
                placeholder="Search laptops by brand, model, or features..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: searchTerm ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = searchTerm ? '#3b82f6' : '#e5e7eb'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dbe2ea', background: '#fff' }}
              >
                <option value="all">All brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>Plan</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dbe2ea', background: '#fff' }}
              >
                <option value="all">All plans</option>
                {subscriptionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dbe2ea', background: '#fff' }}
              >
                <option value="all">All status</option>
                <option value="available">Available</option>
                <option value="outofstock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>Max price</label>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="KES"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dbe2ea', background: '#fff' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
            <div style={{ color: '#475569', fontSize: '14px', fontWeight: 600 }}>
              Showing {filteredLaptops.length} result{filteredLaptops.length !== 1 ? 's' : ''}
            </div>
            {(searchTerm || selectedBrand !== 'all' || selectedType !== 'all' || selectedStatus !== 'all' || maxPrice) && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: 600,
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Loader / No Data */}
        {loading ? (
          <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#475569' }}>
            ⏳ Loading laptops...
          </p>
        ) : filteredLaptops.length === 0 ? (
          <div style={{
            background: '#fff7ed',
            color: '#b45309',
            border: '1px solid #fdba74',
            padding: '1rem',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            {searchTerm ? `🚫 No laptops found matching "${searchTerm}"` : '🚫 No laptops available at the moment.'}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '1.2rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))'
          }}>
            {filteredLaptops.map((laptop, index) => (
              <div
                key={index}
                style={{
                  background: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease',
                }}
              >
                {/* Laptop Image */}
                <div style={{
                  height: '160px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: '#f1f5f9',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <img
                    src={laptop.image || 'https://via.placeholder.com/200x120?text=Laptop'}
                    alt={laptop.model}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '150px',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                {/* Laptop Info */}
                <div style={{ padding: '0.9rem' }}>
                  <h2 style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#1d4ed8',
                    marginBottom: 4,
                    lineHeight: 1.3
                  }}>
                    {laptop.brand} {laptop.model}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ color: '#475569', fontSize: '0.85rem', flex: 1 }}>
                      🖥️ {laptop.size} | 💼 {laptop.subscriptionType}
                    </p>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: laptop.status === 'Available' ? '#dcfce7' : '#fee2e2',
                      color: laptop.status === 'Available' ? '#16a34a' : '#dc2626',
                    }}>
                      {laptop.status}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#334155',
                    marginTop: 6,
                    minHeight: '2.2rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    <strong>🧩 Features:</strong> {laptop.features}
                  </p>
                  <p style={{
                    color: '#059669',
                    fontWeight: 700,
                    fontSize: '1rem',
                    marginTop: 8
                  }}>
                    KES {laptop.price}
                  </p>

                  <button
                   onClick={() => handleApply(laptop._id)}
                   disabled={laptop.status === 'Out of Stock'}
                   style={{
                     marginTop: 12,
                     background: laptop.status === 'Out of Stock' ? '#9ca3af' : '#10b981',
                     color: '#ffffff',
                     padding: '0.55rem',
                     borderRadius: 8,
                     border: 'none',
                     fontWeight: 600,
                     fontSize: '0.95rem',
                     cursor: laptop.status === 'Out of Stock' ? 'not-allowed' : 'pointer',
                     width: '100%',
                     transition: 'background 0.2s ease',
                     opacity: laptop.status === 'Out of Stock' ? 0.7 : 1,
                   }}
                   onMouseOver={e => {
                     if (laptop.status !== 'Out of Stock') {
                       e.currentTarget.style.background = '#059669'
                     }
                   }}
                   onMouseOut={e => {
                     if (laptop.status !== 'Out of Stock') {
                       e.currentTarget.style.background = '#10b981'
                     }
                   }}
                  >
                   {laptop.status === 'Out of Stock' ? '❌ Out of Stock' : '✅ Apply'}
                  </button>
                  {localStorage.getItem('role') === 'admin' && (
                    <button
                      onClick={() => deleteLaptop(laptop._id)}
                      style={{
                        marginTop: 12,
                        background: '#dc2626',
                        color: '#ffffff',
                        padding: '0.55rem',
                        borderRadius: 8,
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#b91c1c'}
                      onMouseOut={e => e.currentTarget.style.background = '#dc2626'}
                    >
                      🗑️ Delete Laptop
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
