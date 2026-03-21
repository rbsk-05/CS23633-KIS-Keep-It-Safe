import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, ShieldAlert, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import '../ui/ui.css';

export const Layout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="layout-container">
      <nav className="navbar">
        <div className="nav-brand">
          <ShieldAlert size={24} />
          <span>PM Vault</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', 
              color: 'var(--text)', display: 'flex', alignItems: 'center',
              padding: '0.5rem', borderRadius: '50%'
            }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {isAuthenticated && (
            <>
              {user?.email && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {user.email}
                </span>
              )}
              <Button variant="secondary" onClick={logout} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <LogOut size={16} />
                Logout
              </Button>
            </>
          )}
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};
