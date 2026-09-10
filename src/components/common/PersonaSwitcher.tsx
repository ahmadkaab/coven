import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  UserSwitch, CaretUp, Check, SignOut,
  Palette, ShoppingBag, Lightning, X
} from '@phosphor-icons/react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { DEMO_PERSONAS, type DemoPersona } from '../../config/demoPersonas';

export function PersonaSwitcher() {
  const reduce = useReducedMotion();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, isArtist, loginAsDemoPersona, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = (persona: DemoPersona) => {
    loginAsDemoPersona(persona);
    queryClient.invalidateQueries();
    setOpen(false);
    toast.success(
      `Role Switched: ${persona.name}`,
      `Active Identity: ${persona.roleLabel} [Torn ID #${persona.tornId}]`
    );
  };

  const handleLogout = () => {
    logout();
    queryClient.invalidateQueries();
    setOpen(false);
    toast.info('Session Ended', 'Logged out of COVEN.');
  };

  const currentPersona = DEMO_PERSONAS.find(p => p.tornId === user?.player_id);
  const currentRoleLabel = isArtist ? 'ARTIST' : 'BUYER';
  const roleColor = isArtist ? 'var(--red-hi)' : 'var(--term-green)';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 900,
        fontFamily: 'var(--font-mono)',
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            style={{
              marginBottom: '8px',
              width: '320px',
              background: 'var(--plate)',
              border: '1px solid var(--seam)',
              borderTop: '2px solid var(--term-green)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.9)',
              padding: 'var(--sp-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-3)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--seam)',
              paddingBottom: '6px',
            }}>
              <div style={{
                fontSize: '0.5625rem',
                color: 'var(--term-green)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Lightning size={12} weight="fill" />
                [ TORN PERSONA SWITCHER ]
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--ghost)', cursor: 'pointer', padding: 2 }}
              >
                <X size={12} />
              </button>
            </div>

            {/* Persona List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {DEMO_PERSONAS.map((p) => {
                const isActive = user?.player_id === p.tornId;
                const isPArtist = p.role === 'artist';
                const pColor = isPArtist ? 'var(--red-hi)' : 'var(--term-green)';

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSwitch(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: isActive ? 'var(--pit)' : 'var(--void)',
                      border: `1px solid ${isActive ? pColor : 'var(--seam)'}`,
                      borderLeft: `3px solid ${pColor}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isPArtist ? (
                        <Palette size={14} color={pColor} weight="bold" />
                      ) : (
                        <ShoppingBag size={14} color={pColor} weight="bold" />
                      )}
                      <div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--phosphor)', fontWeight: 600 }}>
                          {p.name}{' '}
                          <span style={{ fontSize: '0.5rem', color: 'var(--shadow-type)' }}>
                            [#{p.tornId}]
                          </span>
                        </div>
                        <div style={{ fontSize: '0.5rem', color: pColor, textTransform: 'uppercase' }}>
                          {p.roleLabel} • {p.cashReserves}
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <div style={{ color: pColor, display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.5rem' }}>
                        <Check size={12} weight="bold" /> ACTIVE
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Logout action */}
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  background: 'transparent',
                  border: '1px solid var(--seam)',
                  color: 'var(--shadow-type)',
                  fontSize: '0.5625rem',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  marginTop: '2px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--red-hi)';
                  e.currentTarget.style.borderColor = 'var(--red)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--shadow-type)';
                  e.currentTarget.style.borderColor = 'var(--seam)';
                }}
              >
                <SignOut size={12} /> Exit Session / Logout
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button Pill */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--plate)',
          border: '1px solid var(--seam)',
          borderLeft: `3px solid ${user ? roleColor : 'var(--ghost)'}`,
          padding: '6px 12px',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = user ? roleColor : 'var(--ghost)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--seam)';
          e.currentTarget.style.borderLeft = `3px solid ${user ? roleColor : 'var(--ghost)'}`;
        }}
        title="Quick Role Switcher: Test as Artist or Collector"
      >
        <UserSwitch size={14} color={user ? roleColor : 'var(--ghost)'} weight="bold" />
        <span style={{ fontSize: '0.625rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--phosphor)' }}>
          {user ? (
            <>
              <span style={{ color: roleColor, fontWeight: 700 }}>[{currentRoleLabel}]</span>{' '}
              {currentPersona?.name || user.name}
            </>
          ) : (
            <span style={{ color: 'var(--ghost)' }}>[ DEMO // SWITCH ROLE ]</span>
          )}
        </span>
        <CaretUp
          size={10}
          weight="bold"
          color="var(--shadow-type)"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>
    </div>
  );
}
