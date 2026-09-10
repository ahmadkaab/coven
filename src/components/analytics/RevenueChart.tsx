/* ================================================================
   COVEN — RevenueChart
   Pure CSS + Canvas bar chart for monthly revenue
   Cyber-brutalist styling with monospace labels and red accent bars
   ================================================================ */
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from 'motion/react';
import type { MonthlyRevenue } from '../../services/analyticsService';

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const barsRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

  useEffect(() => {
    if (reduce || !barsRef.current) return;
    const bars = barsRef.current.querySelectorAll<HTMLElement>('.rev-bar-fill');
    gsap.from(bars, {
      scaleY: 0,
      transformOrigin: 'bottom',
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1,
      delay: 0.3,
    });
  }, [data, reduce]);

  return (
    <div className="revenue-chart">
      <div className="revenue-chart-header">
        <div className="revenue-chart-title">REVENUE // 6-MO</div>
        <div className="revenue-chart-total">
          ${data.reduce((s, d) => s + d.revenue, 0).toLocaleString()}
        </div>
      </div>
      <div className="revenue-chart-body" ref={barsRef}>
        {/* Grid lines */}
        <div className="revenue-chart-grid">
          {[0.25, 0.5, 0.75, 1].map((pct) => (
            <div
              key={pct}
              className="revenue-grid-line"
              style={{ bottom: `${pct * 100}%` }}
            >
              <span className="revenue-grid-label">
                ${Math.round(maxRevenue * pct).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        {/* Bars */}
        <div className="revenue-chart-bars">
          {data.map((d, i) => {
            const height = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={i} className="rev-bar-col">
                <div className="rev-bar-wrapper">
                  <div
                    className="rev-bar-fill"
                    style={{ height: `${height}%` }}
                    title={`$${d.revenue.toLocaleString()}`}
                  />
                </div>
                <div className="rev-bar-label">{d.label}</div>
                <div className="rev-bar-count">{d.count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
