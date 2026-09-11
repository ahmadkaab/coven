import { Link } from 'react-router-dom';
import { CovenLogo } from '../common/CovenLogo';

export function Footer() {
  const year = new Date().getFullYear();

  const cols = [
    {
      title: 'Marketplace',
      links: [
        { label: 'All Artworks', href: '/browse' },
        { label: 'Blind Auctions', href: '/auctions' },
        { label: 'Commission Ahmad', href: '/commissions' },
        { label: 'Wallet & Escrow', href: '/wallet' },
        { label: 'Player Achievements', href: '/achievements' },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'About Ahmad (Artist)', href: '/#chapter-4' },
        { label: 'Messages & Activity', href: '/dispatches' },
        { label: 'Torn City Script (HUD)', href: '/userscript' },
        { label: 'Notifications', href: '/notifications' },
      ],
    },
    {
      title: 'Help & Safety',
      links: [
        { label: 'Frequently Asked Questions', href: '/faq' },
        { label: 'API Key Safety & Security', href: '/disclosure' },
        { label: 'Terms of Escrow', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
      ],
    },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          {/* Brand col */}
          <div className="footer-col">
            <div style={{ marginBottom: '16px' }}>
              <CovenLogo size="md" />
            </div>
            <p className="footer-tagline" style={{ lineHeight: 1.6, color: 'var(--ghost)', fontSize: '0.8125rem' }}>
              Torn City's digital art market and blind auction house. Safe, fast trading backed by Xanax escrow.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title} className="footer-col">
              <div className="footer-col-title">{col.title}</div>
              <div className="footer-links">
                {col.links.map((l) => (
                  <Link key={l.href} to={l.href} className="footer-link">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <hr className="hr-full" />
        <div className="footer-bottom" style={{ marginTop: '24px' }}>
          <span>COVEN ART MARKET &bull; TORN CITY &bull; {year}</span>
          <span>NOT AFFILIATED WITH TORN CITY LTD</span>
          <span>SAFE &bull; ESCROW PROTECTED</span>
        </div>
      </div>
    </footer>
  );
}
