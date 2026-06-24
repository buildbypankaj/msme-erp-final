import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Package, Users, Truck, IndianRupee, AlertTriangle, FileText } from 'lucide-react';
import { getDashboardSummary } from '../api/dashboardApi';
import './Dashboard.css';
import GSTCalculator from '../components/GSTCalculator';
import AIChat from '../components/AIChat';
import Footer from '../components/Footer';
import { SkeletonCard, SkeletonTableRow } from '../components/Skeleton';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => { 
      try {
        const res = await getDashboardSummary();
        setSummary(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const stats = [
    { label: 'Total Products', value: summary?.totalProducts ?? '0', icon: Package, color: '#4f46e5' },
    { label: 'Total Customers', value: summary?.totalCustomers ?? '0', icon: Users, color: '#0ea5e9' },
    { label: 'Total Suppliers', value: summary?.totalSuppliers ?? '0', icon: Truck, color: '#f59e0b' },
    { label: "Today's Sales", value: `₹${summary?.todaySales ?? 0}`, icon: IndianRupee, color: '#10b981' },
    { label: 'Pending Payments', value: `₹${summary?.pendingPayments ?? 0}`, icon: AlertTriangle, color: '#ef4444' },
    { label: 'Total Invoices', value: summary?.totalInvoices ?? '0', icon: FileText, color: '#8b5cf6' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-main">
        <Navbar title="Dashboard" onMenuClick={() => setSidebarOpen(true)} />
        <div className="dashboard-content">
          <div className="welcome-banner">
            <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
            <p>Here's what's happening with your business today.</p>
          </div>

          {loading ? (
            <>
              <div className="stats-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
              <div className="recent-section">
                <h3 className="section-title">Recent Invoices</h3>
                <div className="table-card">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Invoice No.</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <SkeletonTableRow key={index} columns={4} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="stats-grid">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div className="stat-card" key={index} style={{ animationDelay: `${index * 0.07}s` }}>
                      <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                        <Icon size={22} />
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">{stat.label}</p>
                        <h3 className="stat-value">{stat.value}</h3>
                      </div>
                    </div>
                  );
                })}
              </div>
              <GSTCalculator />

              {summary?.lowStockCount > 0 && (
                <div className="alert-banner">
                  <AlertTriangle size={18} />
                  <span>{summary.lowStockCount} product(s) are running low on stock!</span>
                </div>
              )}

              <div className="recent-section">
                <h3 className="section-title">Recent Invoices</h3>
                <div className="table-card">
                  {summary?.recentInvoices?.length === 0 ? (
                    <p className="empty-state">No invoices yet.</p>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Invoice No.</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary?.recentInvoices?.map((inv) => (
                          <tr key={inv.id}>
                            <td>{inv.invoiceNumber}</td>
                            <td>{inv.customer?.name}</td>
                            <td>₹{inv.totalAmount}</td>
                            <td>
                              <span className={`badge ${inv.paymentStatus === 'paid' ? 'badge-active' : 'badge-inactive'}`}>
                                {inv.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <Footer />
      </div>
      <AIChat />
    </div>
  );
}

export default Dashboard;