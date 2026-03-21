import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Cloud } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();

  return (
    <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', height: '100%' }}>
      <Card className="w-full max-w-md mx-auto" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', marginBottom: '1rem' }}>
            <ShieldCheck size={48} color="var(--accent)" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Sign in to access your secure vault</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <Button onClick={login} style={{ width: '100%', padding: '0.875rem' }}>
            <Cloud size={20} />
            Continue with AWS Cognito
          </Button>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
            Securely authenticating via Centralized Infrastructure
          </p>
        </div>
      </Card>
    </div>
  );
};
