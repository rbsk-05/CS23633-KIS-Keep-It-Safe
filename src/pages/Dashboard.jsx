import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addPassword, getPasswords, deletePassword, updatePassword } from '../services/api';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Plus, Shield, CheckCircle, AlertCircle, Copy, Eye, EyeOff, KeyRound, Loader2, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PasswordCard = ({ item, onDelete, onEdit, onShowNotification }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(item.site);
    setIsDeleting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(item.password);
    onShowNotification('success', 'Password copied to clipboard');
  };

  return (
    <Card className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'var(--text)' }}>
          {item.site}
        </h4>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={() => onEdit(item)}
            style={{ 
              background: 'none', border: 'none', color: 'var(--text-muted)', 
              cursor: 'pointer', transition: '0.2s',
              fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem'
            }}
            title="Edit Entry"
          >
            <Edit2 size={14} />
            Edit
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ 
              background: 'none', border: 'none', color: 'var(--error)', 
              cursor: 'pointer', opacity: isDeleting ? 0.5 : 0.8, transition: '0.2s',
              fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem'
            }}
            title="Delete Entry"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</span>
          <div style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 500 }}>{item.username}</div>
        </div>
        
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</span>
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            background: 'var(--bg)', border: '1px solid var(--border)', padding: '0.5rem 0.75rem', borderRadius: '4px',
            marginTop: '0.25rem'
          }}>
            <span style={{ fontFamily: showPassword ? 'inherit' : 'monospace', letterSpacing: showPassword ? 'normal' : '0.1em', fontSize: '0.95rem' }}>
              {showPassword ? item.password : '••••••••••••'}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={handleCopy}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}
                title="Copy Password"
              >
                <Copy size={16} />
              </button>
              <button 
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                title="Toggle Visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const Dashboard = () => {
  const { logout } = useAuth();
  
  const [formData, setFormData] = useState({ site: '', username: '', password: '' });
  const [loadingAdd, setLoadingAdd] = useState(false);
  
  const [passwords, setPasswords] = useState([]);
  const [loadingFetch, setLoadingFetch] = useState(true);
  
  const [notification, setNotification] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState(null);
  const [editFormData, setEditFormData] = useState({ site: '', username: '', password: '' });
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const fetchPasswords = async () => {
    try {
      setLoadingFetch(true);
      const data = await getPasswords();
      if (Array.isArray(data)) {
        setPasswords(data);
      } else if (data && data.passwords) {
        setPasswords(data.passwords);
      } else if (data && data.data) {
        setPasswords(data.data);
      } else {
        setPasswords([]);
      }
    } catch (err) {
      if (err.name === 'AuthError') {
        logoutSequence(err.message);
      } else {
        showNotification('error', err.message || 'Failed to fetch passwords');
      }
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    fetchPasswords();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const logoutSequence = (msg) => {
    showNotification('error', msg);
    setTimeout(() => logout(), 2000);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.site || !formData.username || !formData.password) {
      showNotification('error', 'All fields are required');
      return;
    }

    setLoadingAdd(true);
    try {
      await addPassword(formData);
      showNotification('success', 'Password added to Vault');
      setFormData({ site: '', username: '', password: '' });
      fetchPasswords();
    } catch (err) {
      if (err.name === 'AuthError') {
        logoutSequence(err.message);
      } else {
        showNotification('error', err.message || 'Failed to add password');
      }
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleDelete = async (site) => {
    try {
      await deletePassword(site);
      showNotification('success', `Removed credentials for ${site}`);
      setPasswords((prev) => prev.filter(p => p.site !== site));
    } catch (err) {
      if (err.name === 'AuthError') {
        logoutSequence(err.message);
      } else {
        showNotification('error', err.message || 'Failed to delete password');
      }
    }
  };

  // Edit Modal Handlers
  const handleEditOpen = (item) => {
    setSelectedPassword(item);
    setEditFormData({ site: item.site, username: item.username, password: item.password });
    setShowEditPassword(false);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setSelectedPassword(null);
  };

  const handleEditChange = (e) => {
    const { id, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.username || !editFormData.password) {
      showNotification('error', 'Username and Password cannot be empty');
      return;
    }

    setLoadingEdit(true);
    try {
      await updatePassword(editFormData);
      showNotification('success', 'Credentials updated successfully');
      setPasswords((prev) => prev.map(p => p.site === editFormData.site ? { ...editFormData } : p));
      handleEditClose();
    } catch (err) {
      if (err.name === 'AuthError') {
        logoutSequence(err.message);
      } else {
        showNotification('error', err.message || 'Failed to update password');
      }
    } finally {
      setLoadingEdit(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative' }}>
      
      {/* Edit Password Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content card-panel"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              style={{ padding: 0 }} // overriding card-panel default padding for custom internal layout
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
                  <Edit2 size={20} color="var(--accent)" /> Update Credentials
                </h3>
                <button onClick={handleEditClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleEditSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <Input 
                  id="site" 
                  label="Service Name (Read-only)" 
                  value={editFormData.site} 
                  disabled 
                />
                <Input 
                  id="username" 
                  label="Username / Email" 
                  value={editFormData.username} 
                  onChange={handleEditChange} 
                />
                
                <div style={{ position: 'relative' }}>
                  <Input 
                    id="password" 
                    label="Password" 
                    type={showEditPassword ? "text" : "password"} 
                    value={editFormData.password} 
                    onChange={handleEditChange} 
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '2.1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Modal Footer Actions */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                  <Button variant="secondary" type="button" onClick={handleEditClose} disabled={loadingEdit}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loadingEdit} style={{ minWidth: '120px' }}>
                    {loadingEdit ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    {loadingEdit ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Notifications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600, color: 'var(--text)' }}>
            Overview
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>Manage your credentials.</p>
        </div>

        {notification && (
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: notification.type === 'error' ? 'var(--error-bg)' : 'var(--success-bg)',
              border: `1px solid ${notification.type === 'error' ? 'var(--error)' : 'var(--success)'}`,
              color: notification.type === 'error' ? 'var(--error)' : 'var(--success)',
              animation: 'fadeIn 0.3s ease-out'
            }}
          >
            {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{notification.message}</span>
          </div>
        )}
      </div>

      {/* Add Password Section */}
      <Card>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
          Create New Entry
        </h3>
        
        <form onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
          <Input id="site" label="Service Name" placeholder="e.g. Github" value={formData.site} onChange={handleChange} />
          <Input id="username" label="Username / Email" placeholder="user@example.com" value={formData.username} onChange={handleChange} />
          <Input id="password" label="Password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
          <Button variant="primary" type="submit" disabled={loadingAdd} style={{ height: '42px', width: '100%' }}>
            {loadingAdd ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {loadingAdd ? 'Saving...' : 'Add Password'}
          </Button>
        </form>
      </Card>

      {/* Stored Passwords Section */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
          <KeyRound size={20} color="var(--accent)" /> Credentials
        </h3>

        {loadingFetch ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="animate-spin" style={{ marginBottom: '1rem', color: 'var(--accent)' }} />
            <p style={{ fontSize: '0.9rem' }}>Loading vault...</p>
          </div>
        ) : passwords.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <Shield size={32} style={{ opacity: 0.3, margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--text)' }}>No credentials found</h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create your first entry above.</p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {passwords.map((p) => (
              <PasswordCard key={p.site} item={p} onDelete={handleDelete} onEdit={handleEditOpen} onShowNotification={showNotification} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
