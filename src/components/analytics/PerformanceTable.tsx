/* ================================================================
   COVEN — PerformanceTable
   Sortable data grid for per-artwork metrics
   ================================================================ */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown } from '@phosphor-icons/react';
import type { ArtworkMetric } from '../../services/analyticsService';

interface PerformanceTableProps {
  data: ArtworkMetric[];
}

type SortKey = 'views' | 'bids' | 'revenue' | 'conversionRate' | 'createdAt';

export function PerformanceTable({ data }: PerformanceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...data].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'createdAt') {
      return mul * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return mul * ((a[sortKey] as number) - (b[sortKey] as number));
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc'
      ? <ArrowUp size={10} weight="bold" style={{ marginLeft: '4px' }} />
      : <ArrowDown size={10} weight="bold" style={{ marginLeft: '4px' }} />;
  };

  if (data.length === 0) {
    return (
      <div className="perf-table-empty">
        <div className="perf-table-title">ARTWORK PERFORMANCE</div>
        <div style={{ padding: 'var(--sp-8)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--shadow-type)' }}>
          No artworks listed yet
        </div>
      </div>
    );
  }

  return (
    <div className="perf-table-wrap">
      <div className="perf-table-title">ARTWORK PERFORMANCE</div>
      <div className="perf-table-scroll">
        <table className="perf-table">
          <thead>
            <tr>
              <th className="perf-th perf-th-title">Artwork</th>
              <th className="perf-th perf-th-sort" onClick={() => handleSort('views')}>
                Views <SortIcon col="views" />
              </th>
              <th className="perf-th perf-th-sort" onClick={() => handleSort('bids')}>
                Bids <SortIcon col="bids" />
              </th>
              <th className="perf-th perf-th-sort" onClick={() => handleSort('revenue')}>
                Revenue <SortIcon col="revenue" />
              </th>
              <th className="perf-th perf-th-sort" onClick={() => handleSort('conversionRate')}>
                Conv% <SortIcon col="conversionRate" />
              </th>
              <th className="perf-th">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => (
              <tr key={a.id} className="perf-row">
                <td className="perf-td perf-td-title">
                  <Link to={`/artwork/${a.id}`} className="perf-artwork-link">
                    {a.imageUrl && (
                      <img src={a.imageUrl} alt="" className="perf-thumb" />
                    )}
                    <div>
                      <div className="perf-artwork-name">{a.title}</div>
                      <div className="perf-artwork-type">{a.listingType.toUpperCase()}</div>
                    </div>
                  </Link>
                </td>
                <td className="perf-td perf-td-num">{a.views.toLocaleString()}</td>
                <td className="perf-td perf-td-num">{a.bids.toLocaleString()}</td>
                <td className="perf-td perf-td-num perf-td-revenue">
                  ${a.revenue.toLocaleString()}
                </td>
                <td className="perf-td perf-td-num">
                  <span className={a.conversionRate > 5 ? 'trend-up' : ''}>
                    {a.conversionRate}%
                  </span>
                </td>
                <td className="perf-td">
                  <span className={`perf-status perf-status-${a.status}`}>
                    {a.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
