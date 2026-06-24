import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Plus, X, Trash2 } from 'lucide-react';
import { getPurchases, createPurchase } from '../api/purchaseApi';
import { getSuppliers } from '../api/supplierApi';
import { getProducts } from '../api/productApi';
import './Products.css';
import './Purchases.css';

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [supplierId, setSupplierId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [items, setItems] = useState([{ productId: '', quantity: '', price: '' }]);

  const fetchData = async () => {
    try {
      const [purRes, supRes, prodRes] = await Promise.all([
        getPurchases(),
        getSuppliers(),
        getProducts(),
      ]);
      setPurchases(purRes.data);
      setSuppliers(supRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setSupplierId('');
    setPaymentStatus('unpaid');
    setItems([{ productId: '', quantity: '', price: '' }]);
    setShowModal(true);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'productId') {
      const product = products.find((p) => p.id === parseInt(value));
      if (product) updated[index].price = product.purchasePrice;
    }

    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { productId: '', quantity: '', price: '' }]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!supplierId) {
      alert('Please select a supplier');
      return;
    }

    const validItems = items.filter((i) => i.productId && i.quantity && i.price);
    if (validItems.length === 0) {
      alert('Please add at least one valid product');
      return;
    }

    try {
      await createPurchase({ supplierId, paymentStatus, items: validItems });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="dashboard-layout">
     <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Navbar title="Purchases" onMenuClick={() => setSidebarOpen(true)} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h2>All Purchases</h2>
              <p>{purchases.length} purchase records</p>
            </div>
            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              New Purchase
            </button>
          </div>

          <div className="table-card">
            {loading ? (
              <p className="empty-state">Loading...</p>
            ) : purchases.length === 0 ? (
              <p className="empty-state">No purchases yet. Click "New Purchase" to record one.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Payment Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr key={p.id}>
                      <td>{p.supplier?.name}</td>
                      <td>{p.items?.length} products</td>
                      <td>₹{p.totalAmount}</td>
                      <td>
                        <span className={`badge ${p.paymentStatus === 'paid' ? 'badge-active' : 'badge-inactive'}`}>
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td>{new Date(p.purchaseDate).toLocaleDateString('en-IN')}</td>
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
          <div className="modal-card modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Purchase</h3>
              <X size={20} className="close-icon" onClick={() => setShowModal(false)} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Supplier</label>
                  <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
                    <option value="">Select supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Status</label>
                  <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <label className="items-label">Products</label>

              {items.map((item, index) => (
                <div className="item-row" key={index}>
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    required
                  />
                  <button type="button" className="icon-btn delete" onClick={() => removeItemRow(index)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button type="button" className="add-item-btn" onClick={addItemRow}>
                <Plus size={16} /> Add another product
              </button>

              <div className="total-row">
                <span>Total Amount</span>
                <span className="total-amount">₹{calculateTotal()}</span>
              </div>

              <button type="submit" className="btn-primary full-width">
                Save Purchase
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Purchases;