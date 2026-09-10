import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CheckCircle, WarningCircle, Info, Warning, X } from '@phosphor-icons/react';
import { useToast, type ToastType, type ToastItem } from '../../context/ToastContext';

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} weight="fill" color="var(--term-green)" />,
  error:   <WarningCircle size={16} weight="fill" color="var(--red-hi)" />,
  warning: <Warning size={16} weight="fill" color="var(--amber)" />,
  info:    <Info size={16} weight="fill" color="var(--phosphor)" />,
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: 'var(--term-green)',
  error:   'var(--red)',
  warning: 'var(--amber)',
  info:    'var(--ghost)',
};

const LABELS: Record<ToastType, string> = {
  success: '[ SYSTEM_SUCCESS ]',
  error:   '[ ERROR_ALERT ]',
  warning: '[ WARNING ]',
  info:    '[ NOTICE ]',
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(20, 20, 26, 0.95) 0%, rgba(12, 12, 16, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderLeft: `3px solid ${BORDER_COLORS[toast.type]}`,
        borderRadius: 'var(--r-md)',
        padding: '12px 14px',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        position: 'relative',
        width: '100%',
        maxWidth: '380px',
      }}
    >
      <div style={{ marginTop: '2px', flexShrink: 0 }}>
        {ICONS[toast.type]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.5625rem',
          letterSpacing: '0.15em',
          color: BORDER_COLORS[toast.type],
          textTransform: 'uppercase',
          marginBottom: '2px',
        }}>
          {LABELS[toast.type]}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.875rem',
          letterSpacing: '-0.02em',
          color: 'var(--phosphor)',
          textTransform: 'uppercase',
          lineHeight: 1.2,
        }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--ghost)',
            marginTop: '4px',
            lineHeight: 1.4,
            wordBreak: 'break-word',
          }}>
            {toast.message}
          </div>
        )}
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--shadow-type)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--phosphor)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--shadow-type)')}
        title="Dismiss notification"
      >
        <X size={12} weight="bold" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const reduce = useReducedMotion();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
        maxWidth: 'calc(100vw - 48px)',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.95 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ pointerEvents: 'auto' }}
          >
            <ToastCard toast={toast} onDismiss={() => removeToast(toast.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
