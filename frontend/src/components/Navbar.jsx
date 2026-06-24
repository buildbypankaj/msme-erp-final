import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, User, LogOut, Settings, ChevronDown, Users, Package, UserCircle, FileText, AlertTriangle, IndianRupee } from 'lucide-react';
import { globalSearch } from '../api/searchApi';
import { getNotifications } from '../api/notificationApi';
import './Navbar.css';
import ThemeToggle from "./ThemeToggle";

function Navbar({ title, onMenuClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const searchTimeout = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data.notifications);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.trim().length === 0) {
      setSearchResults(null);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await globalSearch(value);
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults(null);
  };

  const hasResults = searchResults && (
    searchResults.products.length > 0 ||
    searchResults.customers.length > 0 ||
    searchResults.invoices.length > 0
  );

  return (
    <div className="navbar">
      <div className="navbar-left">
        <Menu size={22} className="hamburger-icon" onClick={onMenuClick} />
        <h1>{title}</h1>
      </div>

      <div className="navbar-right">
        <ThemeToggle />

        <div className="search-wrapper">
          <div className="navbar-search" onClick={() => setSearchOpen(true)}>
            <Search size={17} />
            <input
              type="text"
              placeholder="Search products, customers, invoices..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setSearchOpen(true)}
            />
          </div>

          {searchOpen && (
            <>
              <div className="dropdown-overlay" onClick={closeSearch}></div>
              <div className="search-dropdown">
                {searching && <p className="search-empty">Searching...</p>}

                {!searching && searchQuery.trim().length === 0 && (
                  <p className="search-empty">Start typing to search...</p>
                )}

                {!searching && searchQuery.trim().length > 0 && !hasResults && (
                  <p className="search-empty">No results found for "{searchQuery}"</p>
                )}

                {!searching && searchResults?.products?.length > 0 && (
                  <div className="search-group">
                    <p className="search-group-title">Products</p>
                    {searchResults.products.map((p) => (
                      <div key={p.id} className="search-result-item" onClick={() => { navigate('/products'); closeSearch(); }}>
                        <Package size={15} />
                        <span>{p.name}</span>
                        <span className="search-result-sub">{p.sku}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!searching && searchResults?.customers?.length > 0 && (
                  <div className="search-group">
                    <p className="search-group-title">Customers</p>
                    {searchResults.customers.map((c) => (
                      <div key={c.id} className="search-result-item" onClick={() => { navigate('/customers'); closeSearch(); }}>
                        <UserCircle size={15} />
                        <span>{c.name}</span>
                        <span className="search-result-sub">{c.phone}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!searching && searchResults?.invoices?.length > 0 && (
                  <div className="search-group">
                    <p className="search-group-title">Invoices</p>
                    {searchResults.invoices.map((inv) => (
                      <div key={inv.id} className="search-result-item" onClick={() => { navigate('/invoices'); closeSearch(); }}>
                        <FileText size={15} />
                        <span>{inv.invoiceNumber}</span>
                        <span className="search-result-sub">{inv.customer?.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="notif-wrapper">
          <div className="navbar-icon" onClick={() => setNotifOpen(!notifOpen)}>
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-dot"></span>}
          </div>

          {notifOpen && (
            <>
              <div className="dropdown-overlay" onClick={() => setNotifOpen(false)}></div>
              <div className="notif-dropdown">
                <div className="notif-header">
                  <p className="dropdown-name">Notifications</p>
                  <span className="notif-count-badge">{notifications.length}</span>
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <p className="search-empty">No notifications. All caught up! ✅</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="notif-item">
                        <div className={`notif-icon ${n.type === 'low_stock' ? 'warning' : 'danger'}`}>
                          {n.type === 'low_stock' ? <AlertTriangle size={15} /> : n.type === 'pending_user' ? <Users size={15} /> : <IndianRupee size={15} />}                        </div>
                        <p className="notif-text">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="profile-menu-wrapper">
          <div className="profile-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className="profile-avatar">{user?.name?.charAt(0)}</div>
            <ChevronDown size={16} className="profile-chevron" />
          </div>

          {dropdownOpen && (
            <>
              <div className="dropdown-overlay" onClick={() => setDropdownOpen(false)}></div>
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="profile-avatar large">{user?.name?.charAt(0)}</div>
                  <div>
                    <p className="dropdown-name">{user?.name}</p>
                    <p className="dropdown-role">{user?.role}</p>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                {user?.role === 'admin' && (
                  <div className="dropdown-item" onClick={() => { navigate('/settings'); setDropdownOpen(false); }}>
                    <Settings size={16} />
                    <span>Settings</span>
                  </div>
                )}

                {user?.role === 'admin' && (
                  <div className="dropdown-item" onClick={() => { navigate('/users'); setDropdownOpen(false); }}>
                    <Users size={16} />
                    <span>User Management</span>
                  </div>
                )}


                <div className="dropdown-item" onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>
                  <User size={16} />
                  <span>My Profile</span>
                </div>

                <div className="dropdown-divider"></div>

                <div className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;