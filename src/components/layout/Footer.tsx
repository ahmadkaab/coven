import { Link } from 'react-router-dom';

export function Footer() {
  const year = new Date().getFullYear();

  const cols = [
    {
      title: 'Market',
      links: [
        { label: 'Browse Art', href: '/browse' },
        { label: 'Live Auctions', href: '/auctions' },
        { label: 'Commission Work', href: '/commissions' },
        { label: 'New Drops', href: '/browse?sort=newest' },
      ],
    },
    {
      title: 'Artists',
      links: [
        { label: 'All Artists', href: '/artists' },
        { label: 'Verified', href: '/artists?filter=verified' },
        { label: 'Rising', href: '/artists?filter=rising' },
        { label: 'Apply', href: '/apply' },
      ],
    },
    {
      title: 'Platform',
      links: [
        { label: 'About', href: '/about' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Torn Extension (UserScript)', href: '/userscript' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
    },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          {/* Brand col */}
          <div className="footer-col">
            <div className="footer-logo">COVEN</div>
            <p className="footer-tagline">
              Torn's independent<br />
              art market.<br />
              Est. {year}.
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
          <span>COVEN ART MARKET / TORN CITY / {year}</span>
          <span>NOT AFFILIATED WITH TORN LTD</span>
          <span>[ REV 1.0 ]</span>
        </div>
      </div>
    </footer>
  );
}
