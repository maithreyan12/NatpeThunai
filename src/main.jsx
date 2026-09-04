import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('NatpeThunai Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          background: '#faf8f5',
          color: '#171923'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🫂</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>
            Natpe Thunai Sanctuary
          </h2>
          <p style={{ maxWidth: '420px', color: '#5b6478', marginBottom: '20px', lineHeight: 1.6 }}>
            Something interrupted the memory flow. Let's refresh and bring namma moments right back!
          </p>
          {this.state.error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px',
              padding: '12px 16px',
              maxWidth: '540px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <p style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 4px 0' }}>
                {this.state.error.name}: {this.state.error.message}
              </p>
              <pre style={{
                color: '#7f1d1d',
                fontSize: '0.72rem',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                {this.state.error.stack?.split('\n').slice(0, 4).join('\n')}
              </pre>
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.hash = '';
                window.location.reload();
              }}
              style={{
                background: 'linear-gradient(135deg, #6d58d9 0%, #d63384 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '999px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(109, 88, 217, 0.35)'
              }}
            >
              Reload Namma Memories
            </button>
            <button 
              onClick={() => {
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                } catch {}
                window.location.href = '/';
              }}
              style={{
                background: 'rgba(0,0,0,0.06)',
                color: '#374151',
                border: '1px solid rgba(0,0,0,0.12)',
                padding: '12px 22px',
                borderRadius: '999px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset &amp; Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
