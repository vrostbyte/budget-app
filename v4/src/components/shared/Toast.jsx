import { Toaster } from 'react-hot-toast';

/**
 * Mount once in AppShell. Provides the toast notification container
 * with cyber-neumorphism styling.
 */
export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#0f172a',
          color: '#f1f5f9',
          border: '1px solid rgba(51,65,85,0.5)',
          boxShadow: '8px 8px 24px rgba(0,0,0,0.4)',
          borderRadius: '12px',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#34d399', secondary: '#0f172a' },
        },
        error: {
          iconTheme: { primary: '#fb7185', secondary: '#0f172a' },
        },
      }}
    />
  );
}
