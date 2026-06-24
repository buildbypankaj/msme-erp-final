import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/supplierApi';
import './Products.css';
import { SkeletonTableRow } from '../components/Skeleton';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
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
      const res = await getSuppliers();
      setSuppliers(res.data);
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

  const openEditModal = (supplier) => {
    setEditId(supplier.id);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address || '',
      gstNumber: supplier.gstNumber || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateSupplier(editId, formData);
      } else {
        await createSupplier(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try {
      await deleteSupplier(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="dashboard-layout">
     <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Navbar title="Suppliers" onMenuClick={() => setSidebarOpen(true)} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h2>All Suppliers</h2>
              <p>{suppliers.length} suppliers registered</p>
            </div>
            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              Add Supplier
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
            ) : suppliers.length === 0 ? (
              <p className="empty-state">No suppliers yet. Click "Add Supplier" to create one.</p>
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
                  {suppliers.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.phone}</td>
                      <td>{s.email || '-'}</td>
                      <td>{s.address || '-'}</td>
                      <td>{s.gstNumber || '-'}</td>
                      <td>
                        <span className={`badge ${s.isActive ? 'badge-active' : 'badge-inactive'}`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-btn" onClick={() => openEditModal(s)}>
                            <Pencil size={16} />
                          </button>
                          <button className="icon-btn delete" onClick={() => handleDelete(s.id)}>
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
              <h3>{editId ? 'Edit Supplier' : 'Add Supplier'}</h3>
              <X size={20} className="close-icon" onClick={() => setShowModal(false)} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Supplier Name</label>
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
                {editId ? 'Update Supplier' : 'Add Supplier'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Suppliers;