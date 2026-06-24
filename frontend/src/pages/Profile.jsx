import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { User, Lock, Save } from 'lucide-react';
import { getProfile, updateProfile, changePassword } from '../api/profileApi';
import './Products.css';
import './Settings.css';
import './Profile.css';

function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({ name: '', email: '', role: '', lastLogin: '', createdAt: '' });
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfileData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);
    try {
      const res = await updateProfile({ name: profileData.name });
      setProfileSuccess('Profile updated successfully!');
      // Update localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...user, name: res.data.user.name }));
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Navbar title="My Profile" onMenuClick={() => setSidebarOpen(true)} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h2>My Profile</h2>
              <p>Manage your account information</p>
            </div>
          </div>

          {loading ? (
            <p className="empty-state">Loading...</p>
          ) : (
            <div className="settings-card">

              {/* Profile Info Banner */}
              <div className="profile-banner">
                <div className="profile-banner-avatar">{profileData.name?.charAt(0)}</div>
                <div>
                  <h3>{profileData.name}</h3>
                  <p>{profileData.email}</p>
                  <span className="profile-role-badge">{profileData.role}</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="profile-tabs">
                <button
                  className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User size={16} /> Edit Profile
                </button>
                <button
                  className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  <Lock size={16} /> Change Password
                </button>
              </div>

              {/* Edit Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email (cannot be changed)</label>
                    <input value={profileData.email} disabled style={{ opacity: 0.6 }} />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Role</label>
                      <input value={profileData.role} disabled style={{ opacity: 0.6, textTransform: 'capitalize' }} />
                    </div>
                    <div className="form-group">
                      <label>Member Since</label>
                      <input value={new Date(profileData.createdAt).toLocaleDateString('en-IN')} disabled style={{ opacity: 0.6 }} />
                    </div>
                  </div>

                  {profileSuccess && <p className="success-text">{profileSuccess}</p>}
                  {profileError && <p className="error-text">{profileError}</p>}

                  <button type="submit" className="btn-primary" disabled={profileSaving}>
                    <Save size={17} />
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>

                  {passwordSuccess && <p className="success-text">{passwordSuccess}</p>}
                  {passwordError && <p className="error-text">{passwordError}</p>}

                  <button type="submit" className="btn-primary" disabled={passwordSaving}>
                    <Lock size={17} />
                    {passwordSaving ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;