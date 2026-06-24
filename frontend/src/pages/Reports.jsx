import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import {
    getSalesReport,
    getPurchaseReport,
    getLowStockReport,
    getPendingPaymentsReport,
    getCustomerWiseSales,
    getProductWiseSales,
} from '../api/reportApi';
import './Products.css';
import './Reports.css';

function Reports() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('sales');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const tabs = [
        { key: 'sales', label: 'Sales Report' },
        { key: 'purchases', label: 'Purchase Report' },
        { key: 'lowstock', label: 'Low Stock' },
        { key: 'pending', label: 'Pending Payments' },
        { key: 'customers', label: 'Customer-wise' },
        { key: 'products', label: 'Product-wise' },
    ];

    const fetchTabData = async (tab) => {
        setLoading(true);
        try {
            let res;
            if (tab === 'sales') res = await getSalesReport(startDate, endDate);
            else if (tab === 'purchases') res = await getPurchaseReport(startDate, endDate);
            else if (tab === 'lowstock') res = await getLowStockReport();
            else if (tab === 'pending') res = await getPendingPaymentsReport();
            else if (tab === 'customers') res = await getCustomerWiseSales();
            else if (tab === 'products') res = await getProductWiseSales();
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterApply = () => {
        fetchTabData(activeTab);
    };



    useEffect(() => {
        fetchTabData(activeTab);
    }, [activeTab]);

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="dashboard-main">
                <Navbar title="Reports" onMenuClick={() => setSidebarOpen(true)} />

                <div className="dashboard-content">
                    <div className="page-header">
                        <div>
                            <h2>Business Reports</h2>
                            <p>Analyze your business performance</p>
                        </div>
                    </div>
                    {(activeTab === 'sales' || activeTab === 'purchases') && (
                        <div className="date-filter-row">
                            <div className="date-input-group">
                                <label>From</label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="date-input-group">
                                <label>To</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                            <button className="btn-primary" onClick={handleFilterApply}>
                                Apply Filter
                            </button>
                        </div>
                    )}

                    <div className="report-tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                className={`report-tab ${activeTab === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="table-card">
                        {loading ? (
                            <p className="empty-state">Loading report...</p>
                        ) : (
                            <>
                                {activeTab === 'sales' && <SalesReportView data={data} />}
                                {activeTab === 'purchases' && <PurchaseReportView data={data} />}
                                {activeTab === 'lowstock' && <LowStockReportView data={data} />}
                                {activeTab === 'pending' && <PendingReportView data={data} />}
                                {activeTab === 'customers' && <CustomerWiseView data={data} />}
                                {activeTab === 'products' && <ProductWiseView data={data} />}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SalesReportView({ data }) {
    if (!data || !data.invoices || data.invoices.length === 0) return <p className="empty-state">No sales data available.</p>;
    return (
        <>
            <div className="report-summary">
                <div className="summary-box">
                    <span>Total Sales</span>
                    <strong>₹{data.totalSales}</strong>
                </div>
                <div className="summary-box">
                    <span>Collected</span>
                    <strong>₹{data.totalCollected}</strong>
                </div>
                <div className="summary-box">
                    <span>Due</span>
                    <strong className="text-danger">₹{data.totalDue}</strong>
                </div>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Invoice No.</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {data.invoices.map((inv) => (
                        <tr key={inv.id}>
                            <td>{inv.invoiceNumber}</td>
                            <td>{inv.customer?.name}</td>
                            <td>₹{inv.totalAmount}</td>
                            <td>
                                <span className={`badge ${inv.paymentStatus === 'paid' ? 'badge-active' : 'badge-inactive'}`}>
                                    {inv.paymentStatus}
                                </span>
                            </td>
                            <td>{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

function PurchaseReportView({ data }) {
    if (!data || !data.purchases || data.purchases.length === 0) return <p className="empty-state">No purchase data available.</p>;
    return (
        <>
            <div className="report-summary">
                <div className="summary-box">
                    <span>Total Purchases</span>
                    <strong>₹{data.totalPurchase}</strong>
                </div>
                <div className="summary-box">
                    <span>Total Records</span>
                    <strong>{data.count}</strong>
                </div>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Supplier</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {data.purchases.map((p) => (
                        <tr key={p.id}>
                            <td>{p.supplier?.name}</td>
                            <td>{p.items?.length} products</td>
                            <td>₹{p.totalAmount}</td>
                            <td>{new Date(p.purchaseDate).toLocaleDateString('en-IN')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

function LowStockReportView({ data }) {
    if (!data || !Array.isArray(data) || data.length === 0) return <p className="empty-state">No low stock products. All good! ✅</p>;
    return (
        <table className="data-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Min Stock</th>
                </tr>
            </thead>
            <tbody>
                {data.map((p) => (
                    <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.sku}</td>
                        <td>{p.category?.name}</td>
                        <td className="stock-low">{p.currentStock}</td>
                        <td>{p.minStock}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function PendingReportView({ data }) {
    if (!data || !data.invoices || data.invoices.length === 0) return <p className="empty-state">No pending payments. All clear! ✅</p>;
    return (
        <>
            <div className="report-summary">
                <div className="summary-box">
                    <span>Total Pending</span>
                    <strong className="text-danger">₹{data.totalPending}</strong>
                </div>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Invoice No.</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Due Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {data.invoices.map((inv) => (
                        <tr key={inv.id}>
                            <td>{inv.invoiceNumber}</td>
                            <td>{inv.customer?.name}</td>
                            <td>₹{inv.totalAmount}</td>
                            <td className="stock-low">₹{inv.dueAmount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

function CustomerWiseView({ data }) {
    if (!data || !Array.isArray(data) || data.length === 0) return <p className="empty-state">No customer sales data yet.</p>;
    return (
        <table className="data-table">
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Total Invoices</th>
                    <th>Total Spent</th>
                    <th>Due</th>
                </tr>
            </thead>
            <tbody>
                {data.map((c) => (
                    <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.phone}</td>
                        <td>{c.totalInvoices}</td>
                        <td>₹{c.totalSpent}</td>
                        <td className={c.totalDue > 0 ? 'stock-low' : ''}>₹{c.totalDue}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function ProductWiseView({ data }) {
    if (!data || !Array.isArray(data) || data.length === 0) return <p className="empty-state">No product sales data yet.</p>;
    return (
        <table className="data-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Quantity Sold</th>
                    <th>Revenue</th>
                </tr>
            </thead>
            <tbody>
                {data.map((p) => (
                    <tr key={p.productId}>
                        <td>{p.name}</td>
                        <td>{p.sku}</td>
                        <td>{p.totalQuantitySold}</td>
                        <td>₹{p.totalRevenue}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default Reports;