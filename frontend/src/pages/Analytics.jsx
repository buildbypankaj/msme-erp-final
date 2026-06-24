import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getAnalytics } from '../api/analyticsApi';
import './Products.css';
import './Analytics.css';

const COLORS = ['#4f46e5', '#7c3aed', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444'];

function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAnalytics();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Navbar title="Analytics" onMenuClick={() => setSidebarOpen(true)} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h2>Business Analytics</h2>
              <p>Visual insights into your business performance</p>
            </div>
          </div>

          {loading ? (
            <p className="empty-state">Loading analytics...</p>
          ) : (
            <>
              <div className="analytics-summary">
                <div className="summary-box">
                  <span>Total Revenue</span>
                  <strong>₹{data?.totalRevenue ?? 0}</strong>
                </div>
                <div className="summary-box">
                  <span>Estimated Profit</span>
                  <strong className="text-success">₹{data?.estimatedProfit ?? 0}</strong>
                </div>
              </div>

              <div className="chart-grid">
                <div className="chart-card">
                  <h3 className="chart-title">Sales Trend (Last 7 Days)</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={data?.salesTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">Top 5 Selling Products</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data?.topProducts || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#7c3aed" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">Category-wise Sales</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={data?.categorySales || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(data?.categorySales || []).map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">Top 5 Customers</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data?.topCustomers || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;