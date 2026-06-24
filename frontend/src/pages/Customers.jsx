import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Plus, Pencil, Trash2, X, Phone, Mail } from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customerApi';
import './Products.css';
import { SkeletonTableRow } from '../components/Skeleton';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
  });

  const fetchData = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ name: '', phone: '', email: '', address: '', gstNumber: '' });
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditId(customer.id);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      gstNumber: customer.gstNumber || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateCustomer(editId, formData);
      } else {
        await createCustomer(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Navbar title="Customers" onMenuClick={() => setSidebarOpen(true)} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h2>All Customers</h2>
              <p>{customers.length} customers registered</p>
            </div>
            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              Add Customer
            </button>
          </div>

        <div className="table-card">
            {loading ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>GST</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonTableRow key={index} columns={7} />
                  ))}
                </tbody>
              </table>
            ) : customers.length === 0 ? (
              <p className="empty-state">No customers yet. Click "Add Customer" to create one.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>GST</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.phone}</td>
                      <td>{c.email || '-'}</td>
                      <td>{c.address || '-'}</td>
                      <td>{c.gstNumber || '-'}</td>
                      <td>
                        <span className={`badge ${c.isActive ? 'badge-active' : 'badge-inactive'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-btn" onClick={() => openEditModal(c)}>
                            <Pencil size={16} />
                          </button>
                          <button className="icon-btn delete" onClick={() => handleDelete(c.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Customer' : 'Add Customer'}</h3>
              <X size={20} className="close-icon" onClick={() => setShowModal(false)} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer Name</label>
                <input name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input name="address" value={formData.address} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>GST Number (Optional)</label>
                <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
              </div>

              <button type="submit" className="btn-primary full-width">
                {editId ? 'Update Customer' : 'Add Customer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;