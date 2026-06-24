import { useNavigate } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>VyaparSathi</h3>
          <p>Aapke business ka digital saathi — Inventory, Billing & Analytics ERP</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Modules</h4>
            <ul>
              <li onClick={() => navigate('/products')}>Products & Inventory</li>
              <li onClick={() => navigate('/invoices')}>Billing & Invoices</li>
              <li onClick={() => navigate('/customers')}>Customers & Suppliers</li>
              <li onClick={() => navigate('/reports')}>Reports & Analytics</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Tools</h4>
            <ul>
              <li onClick={() => navigate('/dashboard')}>GST Calculator</li>
              <li onClick={() => navigate('/dashboard')}>AI Business Assistant</li>
              <li onClick={() => navigate('/invoices')}>Invoice PDF Download</li>
              <li onClick={() => navigate('/dashboard')}>Stock Alerts</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li onClick={() => navigate('/users')}>User Management</li>
              <li onClick={() => navigate('/settings')}>Business Settings</li>
              <li onClick={() => navigate('/expenses')}>Expense Tracking</li>
              <li onClick={() => navigate('/payments')}>Payment Management</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 VyaparSathi — Built with ❤️ by Pankaj Choudhary | BCA Final Year Project</p>
      </div>
    </footer>
  );
}

export default Footer;