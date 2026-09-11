import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, ArrowSquareOut, Copy, Check } from '@phosphor-icons/react';

export function Login() {
  const { signIn, loading, error } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [pasted, setPasted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = apiKey.trim();
    if (!key) return;
    const ok = await signIn(key);
    if (ok) {
      toast.success('Access Granted', 'Authenticated via Torn City API.');
      navigate('/dashboard');
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setApiKey(text.trim());
        setPasted(true);
        toast.info('Pasted from Clipboard', 'Torn API Key loaded.');
        setTimeout(() => setPasted(false), 2000);
      }
    } catch {
      toast.warning('Clipboard Access Denied', 'Please paste manually with Ctrl+V.');
    }
  };



  return (
    <div className="login-page">
      {/* Blueprint grid bg */}
      <div className="login-blueprint" aria-hidden="true" />

      {/* Large background text */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(10rem, 28vw, 26rem)',
        lineHeight: 0.85, letterSpacing: '-0.08em',
        textTransform: 'uppercase', color: 'var(--plate)',
        userSelect: 'none', whiteSpace: 'nowrap', pointerEvents: 'none',
        zIndex: 0,
      }}>
        COVEN
      </div>

      <div className="renaissance-glass-panel" style={{ zIndex: 2, maxWidth: '480px', margin: 'var(--sp-6)', padding: '36px 32px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="renaissance-chapter-tag" style={{ justifyContent: 'center', marginBottom: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-magenta)', display: 'inline-block', boxShadow: '0 0 8px var(--neon-magenta)' }} />
            SOVEREIGN ACCESS GATE &bull; WINTER 2026
          </div>
          <h1 className="renaissance-title" style={{ fontSize: '2.8rem', margin: '0 0 4px 0' }}>
            COVEN
          </h1>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', letterSpacing: '0.12em' }}>
            [ DIRECT TORN ESCROW TERMINAL ]
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error" style={{ marginBottom: 'var(--sp-5)' }} role="alert">
            {error}
          </div>
        )}

        {/* ── GET CUSTOM TORN API KEY HELPER CARD ─────────────── */}
        <div style={{
          background: 'rgba(10, 13, 12, 0.75)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: 'var(--sp-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--antique-gold)',
                letterSpacing: '0.08em',
              }}>
                NEED A SECURE CUSTOM TORN KEY?
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--ghost)',
                marginTop: '2px',
                lineHeight: 1.35,
              }}>
                Pre-configures a Custom Key on Torn with Profile & Log permissions:
              </div>
            </div>
            <a
              href="https://www.torn.com/preferences.php#tab=api?step=addNewKey&title=COVEN&user=basic,profile,log"
              target="_blank"
              rel="noopener noreferrer"
              className="renaissance-btn-gold"
              style={{
                fontSize: '0.625rem',
                padding: '6px 12px',
                gap: '4px',
              }}
            >
              GET KEY <ArrowSquareOut size={12} weight="bold" />
            </a>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5625rem',
            color: 'var(--ghost)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            borderTop: '1px solid rgba(244, 241, 234, 0.06)',
            paddingTop: '8px',
            lineHeight: 1.4,
          }}>
            <ShieldCheck size={14} color="var(--antique-gold)" weight="bold" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>
              Grants <strong style={{ color: 'var(--phosphor)' }}>user=basic,profile,log</strong> — enables Log #4810 payment tracking while keeping battle stats & inventory 100% private.
            </span>
          </div>
        </div>

        {/* ── STANDARD API KEY LOGIN ───────────────────────────── */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.5625rem',
          color: 'var(--ghost)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: 'var(--sp-3)',
        }}>
          [ AUTHENTICATE WITH YOUR TORN API KEY ]
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="api-key" className="form-label" style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                  Torn API Key
                </label>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  style={{
                    background: pasted ? 'rgba(255, 0, 127, 0.15)' : 'rgba(244, 241, 234, 0.05)',
                    border: `1px solid ${pasted ? 'var(--neon-magenta)' : 'rgba(244, 241, 234, 0.12)'}`,
                    borderRadius: '4px',
                    color: pasted ? 'var(--neon-magenta)' : 'var(--phosphor)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5625rem',
                    padding: '3px 8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                  }}
                  title="Paste from clipboard"
                >
                  {pasted ? <Check size={11} weight="bold" /> : <Copy size={11} />}
                  {pasted ? 'PASTED!' : 'PASTE FROM CLIPBOARD'}
                </button>
              </div>
              <input
                id="api-key"
                type="password"
                className="form-input"
                placeholder="Enter or paste your Custom or Limited API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: apiKey ? '0.1em' : 'normal',
                  background: 'rgba(10, 13, 12, 0.75)',
                  border: '1px solid rgba(244, 241, 234, 0.12)',
                  borderRadius: '6px',
                  padding: '12px 14px'
                }}
              />
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5625rem',
                color: 'var(--ghost)',
                marginTop: '6px',
                lineHeight: 1.4,
              }}>
                ⚡ Auto-resolves your Player ID, Name, Level & Faction, and monitors Log #4810 for art sales & escrow payments.
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="renaissance-btn-primary"
            disabled={loading || !apiKey.trim()}
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 'var(--sp-5)',
              padding: '14px 24px',
              fontSize: '0.8125rem'
            }}
          >
            {loading ? 'AUTHENTICATING WITH TORN...' : 'AUTHENTICATE & ENTER COVEN'}
          </button>
        </form>

        <div className="login-help" style={{ marginTop: 'var(--sp-5)', paddingTop: 'var(--sp-4)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)' }}>
            <ShieldCheck size={14} color="var(--term-green)" weight="bold" />
            Torn API Log Category #4810 Verified • <Link to="/disclosure" style={{ color: 'var(--crimson)', textDecoration: 'underline' }}>Read API Disclosure</Link>
          </p>
          <p style={{ marginTop: '8px' }}>
            <Link to="/" style={{ color: 'var(--ghost)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', textDecoration: 'none' }}>
              ← Back to marketplace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
