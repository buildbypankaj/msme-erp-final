import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Plus, X } from 'lucide-react';
import { getPayments, createPayment } from '../api/paymentApi';
import { getInvoices } from '../api/invoiceApi';
import './Products.css';
import { SkeletonTableRow } from '../components/Skeleton';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      const [payRes, invRes] = await Promise.all([getPayments(), getInvoices()]);
      setPayments(payRes.data);
      setInvoices(invRes.data.filter((inv) => inv.dueAmount > 0));
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
    setInvoiceId('');
    setAmount('');
    setPaymentMode('cash');
    setNotes('');
    setShowModal(true);
  };

  const selectedInvoice = invoices.find((inv) => inv.id === parseInt(invoiceId));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!invoiceId || !amount) {
      alert('Please select an invoice and enter amount');
      return;
    }

    try {
      await createPayment({ invoiceId, amount, paymentMode, notes });
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
        <Navbar title="Payments" onMenuClick={() => setSidebarOpen(true)} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h2>All Payments</h2>
              <p>{payments.length} payments recorded</p>
            </div>
            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              Collect Payment
            </button>
          </div>

          <div className="table-card">
            {loading ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice No.</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonTableRow key={index} columns={5} />
                  ))}
                </tbody>
              </table>
            ) : payments.length === 0 ? (
              <p className="empty-state">No payments yet. Click "Collect Payment" to record one.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice No.</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.invoice?.invoiceNumber}</td>
                      <td>{p.invoice?.customer?.name}</td>
                      <td>₹{p.amount}</td>
                      <td style={{ textTransform: 'capitalize' }}>{p.paymentMode}</td>
                      <td>{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
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
              <h3>Collect Payment</h3>
              <X size={20} className="close-icon" onClick={() => setShowModal(false)} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Invoice (with due amount)</label>
                <select value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} required>
                  <option value="">Select invoice</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.customer?.name} (Due: ₹{inv.dueAmount})
                    </option>
                  ))}
                </select>
              </div>

              {selectedInvoice && (
                <div className="total-row" style={{ marginBottom: 16 }}>
                  <span>Due Amount</span>
                  <span className="total-amount">₹{selectedInvoice.dueAmount}</span>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Amount Received</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Mode</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any remarks..." />
              </div>

              <button type="submit" className="btn-primary full-width">
                Record Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;