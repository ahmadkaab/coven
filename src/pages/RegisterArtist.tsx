import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle, Warning, Palette, PencilLine } from '@phosphor-icons/react';
import { registerArtist } from '../services/artistService';
import { useAuthStore } from '../store/authStore';

const SPECIALIZATIONS = [
  'Digital Art', 'Pixel Art', 'Portraits', 'Scene Art',
  'Logo & Branding', 'Banners', 'Signature GFX', 'Concept Art',
  'Typography', 'Dark Art', 'Illustration', 'Mixed Media',
];

const TIER_INFO = [
  { tier: 'rising',  label: 'Rising',  desc: 'New artists start here. Build your reputation with early commissions.' },
  { tier: 'trusted', label: 'Trusted', desc: 'Earned through consistent 4★+ reviews and completed commissions.' },
  { tier: 'master',  label: 'Master',  desc: 'Top-tier artists with proven track records and high volume.' },
  { tier: 'legend',  label: 'Legend',  desc: 'Platform-awarded status for exceptional contribution to COVEN.' },
];

export function RegisterArtist() {
  const navigate  = useNavigate();
  const reduce    = useReducedMotion();
  const { user, userId, setArtist } = useAuthStore();

  const [bio, setBio]                   = useState('');
  const [specialization, setSpec]       = useState('');
  const [agreeTerms, setAgreeTerms]     = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [done, setDone]                 = useState(false);
  const [newArtistId, setNewArtistId]   = useState<string | null>(null);

  if (!user || !userId) {
    return (
      <main className="page-content">
        <div className="container" style={{ paddingTop: 'var(--sp-20)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', textTransform: 'uppercase', letterSpacing: '-0.04em', color: 'var(--hull)' }}>
            NOT LOGGED IN
          </div>
          <a href="/login" className="btn btn-industrial" style={{ marginTop: 'var(--sp-6)', display: 'inline-flex' }}>
            Login First
          </a>
        </div>
      </main>
    );
  }

  const handleSubmit = async () => {
    if (!specialization) { setError('Choose a specialization'); return; }
    if (!agreeTerms)     { setError('You must agree to the artist terms'); return; }
    setError(null);
    setSubmitting(true);
    try {
      const artist = await registerArtist({
        userId,
        tornId:        String(user.player_id),
        username:      user.name,
        avatarUrl:     undefined,
        bio:           bio.trim() || undefined,
        specialization,
      });
      setArtist(artist.id);   // update Zustand store — isArtist = true
      setNewArtistId(artist.id);
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── DONE state ───────────────────────────────────────────── */
  if (done) {
    return (
      <main className="page-content">
        <div className="container" style={{ paddingTop: 'var(--sp-20)', maxWidth: 560, textAlign: 'center' }}>
          <motion.div
            initial={reduce ? false : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <CheckCircle size={56} color="var(--term-green)" weight="fill" style={{ margin: '0 auto var(--sp-6)' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 7vw, 5rem)', textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 0.9, color: 'var(--phosphor)', marginBottom: 'var(--sp-4)' }}>
              WELCOME TO COVEN
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', letterSpacing: '0.1em', marginBottom: 'var(--sp-2)' }}>
              [ ARTIST REGISTERED — TIER: RISING ]
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--ghost)', lineHeight: 1.8, marginBottom: 'var(--sp-8)' }}>
              Your artist profile is live. List your first artwork to start building your reputation.
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/list-artwork')} className="btn btn-primary">
                List First Artwork →
              </button>
              <button onClick={() => navigate(newArtistId ? `/artists/${newArtistId}` : '/dashboard')} className="btn btn-ghost">
                View Profile
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  /* ── FORM ─────────────────────────────────────────────────── */
  return (
    <main className="page-content" style={{ paddingBottom: 'var(--sp-20)' }}>

      {/* Header */}
      <div style={{ borderBottom: '2px solid var(--red)', background: 'var(--pit)', paddingTop: '24px' }}>
        <div className="container">
          <div style={{ padding: 'var(--sp-6) 0 var(--sp-5)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
              [ ARTIST REGISTRATION ]
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 0.9, letterSpacing: '-0.04em', textTransform: 'uppercase', color: 'var(--phosphor)' }}>
              BECOME AN ARTIST
            </h1>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--sp-10)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1px', background: 'var(--seam)', alignItems: 'start' }}>

          {/* ── FORM COLUMN ──────────────────────────────────── */}
          <motion.div
            style={{ background: 'var(--void)', display: 'flex', flexDirection: 'column', gap: '1px' }}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Profile preview (auto-filled from Torn) */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-6)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--sp-4)' }}>
                [ YOUR TORN IDENTITY ]
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', background: 'var(--pit)', padding: 'var(--sp-4)', border: '1px solid var(--hull)' }}>
                <div className="artist-avatar-placeholder" style={{ width: 48, height: 48, fontSize: '1.125rem', flexShrink: 0 }}>
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--phosphor)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', marginTop: '4px' }}>
                    TID #{user.player_id} / Level {user.level} / {user.rank}
                  </div>
                </div>
                <span className="badge badge-rising" style={{ marginLeft: 'auto' }}>RISING</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', marginTop: 'var(--sp-3)' }}>
                ✓ Your username and Torn ID are auto-filled from your account.
              </div>
            </div>

            {/* Bio */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-6)' }}>
              <label htmlFor="reg-bio" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PencilLine size={10} weight="bold" />Artist Bio
              </label>
              <textarea
                id="reg-bio"
                className="form-input"
                rows={4}
                placeholder="Tell potential buyers about your style, experience, and what you create..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', lineHeight: 1.8, fontSize: '0.8125rem' }}
                maxLength={400}
              />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--shadow-type)', marginTop: 'var(--sp-2)', textAlign: 'right' }}>
                {bio.length}/400
              </div>
            </div>

            {/* Specialization */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-6)' }}>
              <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--sp-4)' }}>
                <Palette size={10} weight="bold" />Primary Specialization *
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--seam)' }}>
                {SPECIALIZATIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpec(s)}
                    style={{
                      padding: 'var(--sp-3) var(--sp-4)',
                      background: specialization === s ? 'var(--void)' : 'var(--plate)',
                      fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: specialization === s ? 'var(--phosphor)' : 'var(--ghost)',
                      borderBottom: specialization === s ? '2px solid var(--red)' : '2px solid transparent',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {specialization === s && '◈ '}{s}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-6)', borderTop: '1px solid var(--seam)' }}>
              <div style={{ padding: 'var(--sp-4)', background: 'var(--pit)', marginBottom: 'var(--sp-5)', borderLeft: '2px solid var(--hull)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)', lineHeight: 1.9 }}>
                  By registering as an artist you agree to:<br />
                  · Deliver commissioned work within agreed timeframes<br />
                  · Not post AI-generated art without clear disclosure<br />
                  · Accept community reviews based on work quality<br />
                  · COVEN takes no commission — all payments are peer-to-peer via Torn
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', cursor: 'pointer' }} onClick={() => setAgreeTerms(!agreeTerms)}>
                <div style={{
                  width: 18, height: 18, border: `2px solid ${agreeTerms ? 'var(--red)' : 'var(--hull)'}`,
                  background: agreeTerms ? 'var(--red)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.15s',
                }}>
                  {agreeTerms && <CheckCircle size={14} color="white" weight="fill" />}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', userSelect: 'none' }}>
                  I agree to the artist terms above
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'var(--plate)', padding: 'var(--sp-4) var(--sp-6)', borderLeft: '3px solid var(--red)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Warning size={14} color="var(--red-hi)" weight="fill" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--red-hi)' }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              className="btn btn-primary"
              style={{ borderRadius: 0, padding: 'var(--sp-5)', justifyContent: 'center', fontSize: '0.875rem', letterSpacing: '0.1em' }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'REGISTERING...' : 'REGISTER AS ARTIST →'}
            </button>
          </motion.div>

          {/* ── SIDEBAR: tier info ───────────────────────────── */}
          <div style={{ background: 'var(--plate)', display: 'flex', flexDirection: 'column', gap: '1px', position: 'sticky', top: 80 }}>
            <div style={{ background: 'var(--pit)', padding: 'var(--sp-5) var(--sp-6)', borderBottom: '1px solid var(--seam)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>
                [ ARTIST TIERS ]
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', lineHeight: 1.7 }}>
                All artists start at Rising. Tiers are earned through reviews and sales.
              </div>
            </div>

            {TIER_INFO.map((t) => (
              <div
                key={t.tier}
                style={{
                  padding: 'var(--sp-5) var(--sp-6)',
                  borderLeft: t.tier === 'rising' ? '3px solid var(--red)' : '3px solid transparent',
                  background: t.tier === 'rising' ? 'rgba(230,25,25,0.04)' : 'var(--plate)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
                  <span className={`badge badge-${t.tier}`}>{t.label.toUpperCase()}</span>
                  {t.tier === 'rising' && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--term-green)', letterSpacing: '0.1em' }}>← YOU START HERE</span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)', lineHeight: 1.8 }}>
                  {t.desc}
                </div>
              </div>
            ))}

            {/* How it works */}
            <div style={{ background: 'var(--pit)', padding: 'var(--sp-5) var(--sp-6)', borderTop: '1px solid var(--seam)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--sp-4)' }}>
                [ HOW IT WORKS ]
              </div>
              {[
                ['01', 'Register → profile goes live'],
                ['02', 'List artwork with price/auction'],
                ['03', 'Buyer pays via Torn cash transfer'],
                ['04', 'Deliver work → mark complete'],
                ['05', 'Buyer leaves review → builds rep'],
              ].map(([n, t]) => (
                <div key={n} style={{ display: 'flex', gap: 'var(--sp-4)', marginBottom: 'var(--sp-3)', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', color: 'var(--red)', flexShrink: 0, letterSpacing: '-0.02em' }}>{n}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)', lineHeight: 1.7 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
