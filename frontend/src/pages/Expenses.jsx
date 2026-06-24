import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenseApi';
import './Products.css';
import { SkeletonTableRow } from '../components/Skeleton';

const CATEGORIES = ['Rent', 'Salary', 'Electricity', 'Transport', 'Maintenance', 'Marketing', 'Other'];

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Other',
    amount: '',
    expenseDate: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      const res = await getExpenses();
      setExpenses(res.data.expenses);
      setTotalExpenses(res.data.totalExpenses);
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
    setFormData({ title: '', category: 'Other', amount: '', expenseDate: '', notes: '' });
    setShowModal(true);
  };

  const openEditModal = (expense) => {
    setEditId(expense.id);
    setFormData({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
      notes: expense.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateExpense(editId, formData);
      } else {
        await createExpense(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Navbar title="Expenses" onMenuClick={() => setSidebarOpen(true)} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h2>All Expenses</h2>
              <p>{expenses.length} expenses · Total: ₹{totalExpenses}</p>
            </div>
            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              Add Expense
            </button>
          </div>

          <div className="table-card">
            {loading ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonTableRow key={index} columns={5} />
                  ))}
                </tbody>
              </table>
            ) : expenses.length === 0 ? (
              <p className="empty-state">No expenses yet. Click "Add Expense" to record one.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td>{e.title}</td>
                      <td>{e.category}</td>
                      <td>₹{e.amount}</td>
                      <td>{new Date(e.expenseDate).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-btn" onClick={() => openEditModal(e)}>
                            <Pencil size={16} />
                          </button>
                          <button className="icon-btn delete" onClick={() => handleDelete(e.id)}>
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
              <h3>{editId ? 'Edit Expense' : 'Add Expense'}</h3>
              <X size={20} className="close-icon" onClick={() => setShowModal(false)} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Expense Title</label>
                <input name="title" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input type="date" name="expenseDate" value={formData.expenseDate} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <input name="notes" value={formData.notes} onChange={handleChange} />
              </div>

              <button type="submit" className="btn-primary full-width">
                {editId ? 'Update Expense' : 'Add Expense'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;