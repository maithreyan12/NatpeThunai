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
          <p style={{ maxWidth: '420px', color: '#5b6478', marginBottom: '24px', lineHeight: 1.6 }}>
            Something interrupted the memory flow. Let's refresh and bring namma moments right back!
          </p>
          <button 
            onClick={() => window.location.reload()}
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
