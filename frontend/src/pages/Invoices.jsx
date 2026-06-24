import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Plus, X, Trash2, Download, MessageCircle } from 'lucide-react';
import { getInvoices, createInvoice } from '../api/invoiceApi';
import { getCustomers } from '../api/customerApi';
import { getProducts } from '../api/productApi';
import './Products.css';
import './Purchases.css';
import { SkeletonTableRow } from '../components/Skeleton';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [customerId, setCustomerId] = useState('');
  const [discount, setDiscount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: '', price: '' }]);

  const fetchData = async () => {
    try {
      const [invRes, custRes, prodRes] = await Promise.all([
        getInvoices(),
        getCustomers(),
        getProducts(),
      ]);
      setInvoices(invRes.data);
      setCustomers(custRes.data);
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
    setCustomerId('');
    setDiscount('');
    setPaidAmount('');
    setItems([{ productId: '', quantity: '', price: '' }]);
    setShowModal(true);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'productId') {
      const product = products.find((p) => p.id === parseInt(value));
      if (product) updated[index].price = product.sellingPrice;
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

  const calculateSubTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);
  };

  const calculateTotal = () => {
    return calculateSubTotal() - (Number(discount) || 0);
  };


  const handleDownload = (id, invoiceNumber) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/api/invoices/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoiceNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert('Failed to download invoice'));
  };

  const handleWhatsAppShare = (inv) => {
    if (!inv.customer?.phone) {
      alert('Customer phone number not available');
      return;
    }

    let phone = inv.customer.phone.replace(/\D/g, ''); // remove non-digits
    if (phone.length === 10) phone = '91' + phone; // add India code if missing

    const message = `Hi ${inv.customer.name}, here's your invoice ${inv.invoiceNumber} from VyaparSathi.\nTotal: ₹${inv.totalAmount}\nPaid: ₹${inv.paidAmount}\nDue: ₹${inv.dueAmount}\nThank you for your business!`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      alert('Please select a customer');
      return;
    }

    const validItems = items.filter((i) => i.productId && i.quantity && i.price);
    if (validItems.length === 0) {
      alert('Please add at least one valid product');
      return;
    }

    try {
      await createInvoice({
        customerId,
        items: validItems,
        discount: Number(discount) || 0,
        paidAmount: Number(paidAmount) || 0,
      });
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
        <Navbar title="Invoices" onMenuClick={() => setSidebarOpen(true)} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h2>All Invoices</h2>
              <p>{invoices.length} invoices created</p>
            </div>
            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              New Invoice
            </button>
          </div>

          <div className="table-card">
            {loading ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice No.</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonTableRow key={index} columns={8} />
                  ))}
                </tbody>
              </table>
            ) : invoices.length === 0 ? (
              <p className="empty-state">No invoices yet. Click "New Invoice" to create one.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice No.</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.invoiceNumber}</td>
                      <td>{inv.customer?.name}</td>
                      <td>₹{inv.totalAmount}</td>
                      <td>₹{inv.paidAmount}</td>
                      <td className={inv.dueAmount > 0 ? 'stock-low' : ''}>₹{inv.dueAmount}</td>
                      <td>
                        <span className={`badge ${inv.paymentStatus === 'paid' ? 'badge-active' : 'badge-inactive'}`}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td>{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
<td>
                        <button className="icon-btn" onClick={() => handleDownload(inv.id, inv.invoiceNumber)}>
                          <Download size={16} />
                        </button>
                        <button className="icon-btn" onClick={() => handleWhatsAppShare(inv)}>
                          <MessageCircle size={16} />
                        </button>
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
          <div className="modal-card modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Invoice</h3>
              <X size={20} className="close-icon" onClick={() => setShowModal(false)} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer</label>
                <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>
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

              <div className="form-row">
                <div className="form-group">
                  <label>Discount (₹)</label>
                  <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Paid Amount (₹)</label>
                  <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder="0" />
                </div>
              </div>

              <div className="total-row">
                <span>Total Amount</span>
                <span className="total-amount">₹{calculateTotal()}</span>
              </div>

              <button type="submit" className="btn-primary full-width">
                Create Invoice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invoices;