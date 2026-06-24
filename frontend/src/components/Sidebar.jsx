import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, Users, Truck, ShoppingCart, FileText, Wallet, BarChart3, TrendingUp, Receipt, X } from 'lucide-react';
import './Sidebar.css';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Categories', icon: Tag, path: '/categories' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'Suppliers', icon: Truck, path: '/suppliers' },
    { name: 'Purchases', icon: ShoppingCart, path: '/purchases' },
    { name: 'Invoices', icon: FileText, path: '/invoices' },
    { name: 'Payments', icon: Wallet, path: '/payments' },
    { name: 'Expenses', icon: Receipt, path: '/expenses' },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
    { name: 'Analytics', icon: TrendingUp, path: '/analytics' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2>VyaparSathi</h2>
          <X size={22} className="sidebar-close-icon" onClick={onClose} />
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.name}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigate(item.path)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}

export default Sidebar;