/* ================================================================
   COVEN — AudiencePanel
   Buyer engagement insights with activity heatmap
   ================================================================ */
import type { AudienceData } from '../../services/analyticsService';

interface AudiencePanelProps {
  data: AudienceData;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function AudiencePanel({ data }: AudiencePanelProps) {
  const maxActivity = Math.max(...data.activityByDay, 1);

  return (
    <div className="audience-panel">
      <div className="audience-panel-title">AUDIENCE INTEL</div>

      {/* Summary stats */}
      <div className="audience-stats">
        <div className="audience-stat">
          <div className="audience-stat-val">{data.totalBuyers}</div>
          <div className="audience-stat-label">Total Buyers</div>
        </div>
        <div className="audience-stat">
          <div className="audience-stat-val">{data.repeatBuyers}</div>
          <div className="audience-stat-label">Repeat Buyers</div>
        </div>
        <div className="audience-stat">
          <div className="audience-stat-val">{data.repeatRate}%</div>
          <div className="audience-stat-label">Return Rate</div>
        </div>
      </div>

      {/* Activity heatmap by day */}
      <div className="audience-heatmap-label">ACTIVITY BY DAY</div>
      <div className="audience-heatmap">
        {data.activityByDay.map((val, i) => {
          const intensity = maxActivity > 0 ? val / maxActivity : 0;
          return (
            <div key={i} className="heatmap-cell">
              <div
                className="heatmap-bar"
                style={{
                  height: `${Math.max(intensity * 100, 4)}%`,
                  opacity: 0.3 + intensity * 0.7,
                }}
                title={`${DAY_LABELS[i]}: ${val} transactions`}
              />
              <div className="heatmap-day">{DAY_LABELS[i]}</div>
            </div>
          );
        })}
      </div>

      {/* Top buyers */}
      {data.topBuyers.length > 0 && (
        <>
          <div className="audience-buyers-label">TOP BUYERS</div>
          <div className="audience-buyers">
            {data.topBuyers.map((b, i) => (
              <div key={b.id} className="buyer-row">
                <div className="buyer-rank">#{i + 1}</div>
                <div className="buyer-name">{b.maskedName}</div>
                <div className="buyer-meta">
                  {b.purchases} purchase{b.purchases !== 1 ? 's' : ''} · ${b.totalSpent.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {data.topBuyers.length === 0 && (
        <div style={{
          padding: 'var(--sp-6)', textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
          color: 'var(--shadow-type)',
        }}>
          No buyer data yet — sales will populate this panel
        </div>
      )}
    </div>
  );
}
