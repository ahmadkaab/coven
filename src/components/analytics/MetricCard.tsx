/* ================================================================
   COVEN — MetricCard
   Industrial stat card with animated counter and trend indicator
   ================================================================ */
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'motion/react';

gsap.registerPlugin(ScrollTrigger);

interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number;       // percentage, positive = up
  index?: string;       // e.g. "01"
  formatValue?: (v: number) => string;
}

export function MetricCard({ label, value, prefix = '', suffix = '', trend, index, formatValue }: MetricCardProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) {
      if (ref.current) {
        ref.current.textContent = prefix + (formatValue ? formatValue(value) : value.toLocaleString()) + suffix;
      }
      return;
    }
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 1.6,
      ease: 'power2.out',
      delay: 0.2,
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = prefix + (formatValue ? formatValue(Math.round(obj.val)) : Math.round(obj.val).toLocaleString()) + suffix;
        }
      },
    });
  }, [value, prefix, suffix, reduce, formatValue]);

  return (
    <div className="metric-card">
      {index && (
        <div className="metric-card-index">{index}</div>
      )}
      <div className="metric-card-label">{label}</div>
      <div className="metric-card-value">
        <span ref={ref}>0</span>
      </div>
      {trend !== undefined && (
        <div className={`metric-card-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}
