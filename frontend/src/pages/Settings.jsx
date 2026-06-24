import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Save } from 'lucide-react';
import { getSettings, updateSettings } from '../api/settingsApi';
import './Products.css';
import './Settings.css';

function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    phone: '',
    email: '',
    gstNumber: '',
    currency: 'INR',
    invoicePrefix: 'INV',
    defaultTaxRate: 0,
    lowStockAlert: 5,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettings();
        setFormData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      await updateSettings(formData);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Navbar title="Business Settings" onMenuClick={() => setSidebarOpen(true)} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h2>Business Settings</h2>
              <p>Manage your business profile and preferences</p>
            </div>
          </div>

          {loading ? (
            <p className="empty-state">Loading settings...</p>
          ) : (
            <div className="settings-card">
              <form onSubmit={handleSubmit}>
                <h3 className="settings-section-title">Business Information</h3>

                <div className="form-group">
                  <label>Business Name</label>
                  <input name="businessName" value={formData.businessName || ''} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Business address" />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="Contact number" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="Business email" />
                  </div>
                </div>

                <div className="form-group">
                  <label>GST Number</label>
                  <input name="gstNumber" value={formData.gstNumber || ''} onChange={handleChange} placeholder="Optional" />
                </div>

                <h3 className="settings-section-title">Invoice & Billing</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Currency</label>
                    <select name="currency" value={formData.currency} onChange={handleChange}>
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Invoice Prefix</label>
                    <input name="invoicePrefix" value={formData.invoicePrefix || ''} onChange={handleChange} placeholder="e.g. INV" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Default Tax Rate (%)</label>
                    <input type="number" name="defaultTaxRate" value={formData.defaultTaxRate} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Low Stock Alert Threshold</label>
                    <input type="number" name="lowStockAlert" value={formData.lowStockAlert} onChange={handleChange} />
                  </div>
                </div>

                {success && <p className="success-text">{success}</p>}

                <button type="submit" className="btn-primary" disabled={saving}>
                  <Save size={17} />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;