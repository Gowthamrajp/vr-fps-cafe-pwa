import { useEffect } from 'preact/hooks';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '800px' }) {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => {
        // Close modal if clicking on overlay (not modal content)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div 
        className="modal-content"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '0',
          maxWidth: maxWidth,
          width: '100%',
          maxHeight: '90vh',
          border: '1px solid #e1e5e9',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
          animation: 'slideIn 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '24px 24px 16px 24px',
          borderBottom: '1px solid #e1e5e9',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#2d3748'
          }}>
            {title}
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#718096',
              padding: '8px',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#e2e8f0';
              e.target.style.color = '#2d3748';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#718096';
            }}
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          lineHeight: '1.6',
          backgroundColor: '#ffffff',
          color: '#2d3748'
        }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateY(-20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }

        .modal-content::-webkit-scrollbar {
          width: 8px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #f7fafc;
          border-radius: 4px;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
        }

        .modal-content::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </div>
  );
} 