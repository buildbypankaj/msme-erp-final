import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Plus, Pencil, Trash2, X, CheckCircle, XCircle } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '../api/userApi';
import API from '../api/axios';
import './Products.css';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('approved');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'staff' });

  const fetchData = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openAddModal = () => {
    setEditId(null);
    setFormData({ name: '', email: '', password: '', role: 'staff' });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditId(user.id);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateUser(editId, { name: formData.name, role: formData.role });
      } else {
        await createUser(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.post(`/users/${id}/approve`, { action: 'approve' });
      fetchData();
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this user?')) return;
    try {
      await API.post(`/users/${id}/approve`, { action: 'reject' });
      fetchData();
    } catch (err) {
      alert('Failed to reject');
    }
  };

  const pendingUsers = users.filter((u) => u.approvalStatus === 'pending' && u.isVerified);
  const approvedUsers = users.filter((u) => u.approvalStatus === 'approved');
  const rejectedUsers = users.filter((u) => u.approvalStatus === 'rejected');

  const displayUsers = activeTab === 'pending' ? pendingUsers : activeTab === 'approved' ? approvedUsers : rejectedUsers;

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Navbar title="User Management" onMenuClick={() => setSidebarOpen(true)} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h2>User Management</h2>
              <p>{users.length} total users</p>
            </div>
            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              Add User
            </button>
          </div>

          {/* Tabs */}
          <div className="user-tabs">
            <button className={`user-tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
              Pending Approval {pendingUsers.length > 0 && <span className="tab-badge">{pendingUsers.length}</span>}
            </button>
            <button className={`user-tab ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>
              Approved
            </button>
            <button className={`user-tab ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => setActiveTab('rejected')}>
              Rejected
            </button>
          </div>

          <div className="table-card">
            {loading ? (
              <p className="empty-state">Loading...</p>
            ) : displayUsers.length === 0 ? (
              <p className="empty-state">No {activeTab} users.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                      <td>
                        <span
                          className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}
                          style={{ cursor: u.id !== currentUser.id ? 'pointer' : 'default' }}
                          onClick={() => u.id !== currentUser.id && handleToggleActive(u)}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}</td>
                      <td>
                        <div className="action-buttons">
                          {activeTab === 'pending' && (
                            <>
                              <button className="icon-btn approve" onClick={() => handleApprove(u.id)} title="Approve">
                                <CheckCircle size={16} />
                              </button>
                              <button className="icon-btn delete" onClick={() => handleReject(u.id)} title="Reject">
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {activeTab === 'approved' && (
                            <>
                              <button className="icon-btn" onClick={() => openEditModal(u)}>
                                <Pencil size={16} />
                              </button>
                              {u.id !== currentUser.id && (
                                <button className="icon-btn delete" onClick={() => handleDelete(u.id)}>
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </>
                          )}
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
              <h3>{editId ? 'Edit User' : 'Add User'}</h3>
              <X size={20} className="close-icon" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={!!editId} />
              </div>
              {!editId && (
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
              )}
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="staff">Staff</option>
                  <option value="accountant">Accountant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-primary full-width">
                {editId ? 'Update User' : 'Add User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;