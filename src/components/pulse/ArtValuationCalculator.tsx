import { Link } from 'react-router-dom';
import { useArtValuation } from '../../hooks/useMarketPulse';
import { formatTornCash } from '../../utils/format';
import { Calculator, Sparkle, ArrowRight } from '@phosphor-icons/react';

export function ArtValuationCalculator() {
  const { params, valuation, updateParam } = useArtValuation();

  return (
    <div style={{ background: 'var(--plate)', border: '1px solid var(--seam)' }}>
      {/* Header */}
      <div style={{
        padding: 'var(--sp-4) var(--sp-5)',
        borderBottom: '1px solid var(--seam)',
        background: 'var(--pit)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={14} color="var(--red-hi)" weight="fill" />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--phosphor)',
          }}>
            INTERACTIVE ART VALUATION ESTIMATOR
          </span>
        </div>

        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.5rem',
          color: 'var(--term-green)',
        }}>
          CONFIDENCE: {valuation.confidenceScore}%
        </span>
      </div>

      <div style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {/* Category selector */}
        <div>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
            1. ARTWORK FORMAT
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--seam)' }}>
            {[
              { id: 'avatar', label: 'Avatar (1:1)' },
              { id: 'signature', label: 'Forum Sig' },
              { id: 'banner', label: 'Faction Banner' },
              { id: 'suite', label: 'Profile Suite' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateParam('category', cat.id as any)}
                style={{
                  background: params.category === cat.id ? 'var(--red)' : 'var(--pit)',
                  color: params.category === cat.id ? '#fff' : 'var(--ghost)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5625rem',
                  padding: '6px 4px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Complexity selector */}
        <div>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
            2. COMPLEXITY & FRAMES
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--seam)' }}>
            {[
              { id: 'static', label: 'Static 2D' },
              { id: 'anim_30', label: 'Animated 30fps' },
              { id: 'anim_60', label: 'Animated 60fps' },
              { id: 'render_3d', label: '3D Render' },
            ].map((comp) => (
              <button
                key={comp.id}
                type="button"
                onClick={() => updateParam('complexity', comp.id as any)}
                style={{
                  background: params.complexity === comp.id ? 'var(--red)' : 'var(--pit)',
                  color: params.complexity === comp.id ? '#fff' : 'var(--ghost)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5625rem',
                  padding: '6px 4px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {comp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Artist Tier & Turnaround Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
          {/* Artist Tier */}
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
              3. ARTIST TIER
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--seam)' }}>
              {[
                { id: 'rising', label: 'Rising' },
                { id: 'trusted', label: 'Trusted' },
                { id: 'master', label: 'Master' },
                { id: 'legend', label: 'Legend' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => updateParam('artistTier', tier.id as any)}
                  style={{
                    background: params.artistTier === tier.id ? 'var(--void)' : 'var(--pit)',
                    color: params.artistTier === tier.id ? 'var(--phosphor)' : 'var(--ghost)',
                    borderBottom: params.artistTier === tier.id ? '2px solid var(--red)' : '2px solid transparent',
                    border: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5625rem',
                    padding: '5px 4px',
                    cursor: 'pointer',
                  }}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Turnaround SLA */}
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
              4. TURNAROUND SLA
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--seam)' }}>
              {[
                { id: 'standard', label: 'Standard' },
                { id: 'priority', label: '48h Priority' },
                { id: 'rush', label: '24h Rush' },
              ].map((sla) => (
                <button
                  key={sla.id}
                  type="button"
                  onClick={() => updateParam('turnaround', sla.id as any)}
                  style={{
                    background: params.turnaround === sla.id ? 'var(--void)' : 'var(--pit)',
                    color: params.turnaround === sla.id ? 'var(--phosphor)' : 'var(--ghost)',
                    borderBottom: params.turnaround === sla.id ? '2px solid var(--term-green)' : '2px solid transparent',
                    border: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5625rem',
                    padding: '5px 4px',
                    cursor: 'pointer',
                  }}
                >
                  {sla.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Valuation Result Box */}
        <div style={{
          background: 'var(--pit)',
          border: '1px solid var(--seam)',
          borderTop: '2px solid var(--red)',
          padding: 'var(--sp-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', textTransform: 'uppercase' }}>
              RECOMMENDED FAIR MARKET VALUATION
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.25rem, 2.5vw, 1.85rem)',
              color: 'var(--phosphor)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginTop: '4px',
            }}>
              {formatTornCash(valuation.medianPrice)}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)', marginTop: '2px' }}>
              Range: {formatTornCash(valuation.minPrice)} – {formatTornCash(valuation.maxPrice)} • {valuation.dpEquivalent} DP
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              to="/commissions"
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              Order with this Budget <ArrowRight size={12} weight="bold" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
