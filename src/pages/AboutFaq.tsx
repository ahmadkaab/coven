import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  CaretDown,
  CaretUp,
  Sparkle,
  ShieldCheck,
  Lightning,
  PaintBrush,
  UserCircle,
  CurrencyDollar,
  Question,
  Info,
  ArrowRight,
  Code,
} from '@phosphor-icons/react';

type Tab = 'about' | 'faq';

interface Props {
  defaultTab?: Tab;
}

interface FaqItem {
  question: string;
  answer: string;
  category: 'safety' | 'economy' | 'userscript' | 'artists';
}

const FAQS: FaqItem[] = [
  {
    category: 'safety',
    question: 'Is COVEN safe to use with my Torn City account?',
    answer:
      'Yes, 100%. COVEN requires a scoped Torn "Custom Key" with only basic, profile, and log permissions. It CANNOT access your battle stats, inventory, cash on hand, bank balance, property vaults, or private messages. Furthermore, your API key is stored only inside your browser session and is never transmitted to external third parties.',
  },
  {
    category: 'safety',
    question: 'Why does COVEN need "log" permissions?',
    answer:
      'COVEN uses Torn Log Category #4810 ("received money via send money") exclusively to verify payments for art transactions. When an artist delivers an artwork or a buyer pays, our automated verification engine inspects the seller\'s log to confirm that the exact agreed Torn cash amount was transferred. We do not read or process other personal log categories.',
  },
  {
    category: 'safety',
    question: 'Can COVEN spend my money or make moves in-game?',
    answer:
      'No. The Torn API is strictly read-only for third-party applications. It has zero capability to trigger transfers, execute attacks, spend money, or alter game state. All cash wires must be manually initiated and confirmed by you on Torn.com.',
  },
  {
    category: 'economy',
    question: 'How do payments work? Is real money involved?',
    answer:
      'COVEN operates 100% on fictional in-game Torn City Cash ($). Real-money trading (RMT) is strictly prohibited. Buyers wire Torn cash directly to the artist using Torn\'s native Send Cash page, using the transaction reference provided by COVEN.',
  },
  {
    category: 'economy',
    question: 'What is a "Clean Master" and Cryptographic Provenance?',
    answer:
      'Public marketplace listings on COVEN have security watermark layers to prevent art theft. Once a buyer\'s payment is verified via Log #4810, the buyer\'s Collector Trophy Vault unlocks the unwatermarked Clean Master in full native resolution, accompanied by a cryptographically signed Certificate of Authenticity (SHA-256 hash).',
  },
  {
    category: 'userscript',
    question: 'How does the Tampermonkey UserScript work?',
    answer:
      'The COVEN UserScript (coven.user.js) injects into Torn City pages in your browser. When visiting player profiles, it displays verified artist badges and portfolio metrics. In the Graphic & Art forums, it transforms plain COVEN links into live bidding cards. On the Send Cash page, it provides a 1-click auto-fill assistant to prevent transfer typos.',
  },
  {
    category: 'userscript',
    question: 'Can I use the UserScript on mobile devices?',
    answer:
      'Yes! You can install Tampermonkey on mobile browsers that support extensions (such as Firefox for Android or Kiwi Browser). In the UserScript installation center, click "Copy URL" and import it directly into your mobile Tampermonkey dashboard.',
  },
  {
    category: 'artists',
    question: 'How do I become a Verified Artist on COVEN?',
    answer:
      'Any registered Torn player can apply via the Apply / Register Artist link. Submit 3 sample portfolio pieces and your preferred graphic specialties (forum signatures, faction war banners, profile graphics, avatars). Applications are reviewed by the syndicate council within 24 hours.',
  },
  {
    category: 'artists',
    question: 'What happens if a buyer doesn\'t pay or an artist doesn\'t deliver?',
    answer:
      'All transactions follow milestone and escrow protocols. If a buyer reserves a piece but fails to send the Torn cash wire within 24 hours, the reservation automatically expires and the artwork returns to the open market. For bespoke commissions, artists submit watermarked draft deliverables before full settlement is released.',
  },
];

export function AboutFaq({ defaultTab = 'about' }: Props) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqFilter, setFaqFilter] = useState<string>('all');

  useEffect(() => {
    if (location.pathname.includes('faq')) setActiveTab('faq');
    else if (location.pathname.includes('about')) setActiveTab('about');
  }, [location.pathname]);

  const filteredFaqs = faqFilter === 'all'
    ? FAQS
    : FAQS.filter(f => f.category === faqFilter);

  return (
    <main className="page-content">
      <div className="container" style={{ maxWidth: '920px', margin: '0 auto', paddingTop: 'var(--sp-12)', paddingBottom: 'var(--sp-16)' }}>
        
        {/* ── Page Header ────────────────────────────────────────── */}
        <header style={{ textAlign: 'center', marginBottom: 'var(--sp-10)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(230, 25, 25, 0.08)',
              border: '1px solid rgba(230, 25, 25, 0.25)',
              borderRadius: '100px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--crimson)',
              marginBottom: 'var(--sp-4)',
            }}
          >
            <Sparkle size={14} weight="bold" />
            UNDERWORLD ART MARKET
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: 'var(--chalk)',
              marginBottom: 'var(--sp-4)',
            }}
          >
            ABOUT COVEN<br />
            <span style={{ color: 'var(--crimson)' }}>& FREQUENT QUESTIONS</span>
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--ghost)',
              maxWidth: '580px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            The dedicated digital art marketplace for Torn City. Discover artists, bid on 1/1 masterworks, commission faction war banners, and trade with cryptographic provenance.
          </p>
        </header>

        {/* ── Tab Switcher ───────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: 'var(--sp-8)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '8px',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setActiveTab('about')}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              background: activeTab === 'about' ? 'rgba(230, 25, 25, 0.15)' : 'transparent',
              border: activeTab === 'about' ? '1px solid rgba(230, 25, 25, 0.4)' : '1px solid transparent',
              color: activeTab === 'about' ? 'var(--chalk)' : 'var(--ghost)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Info size={14} weight="bold" color={activeTab === 'about' ? '#e61919' : 'inherit'} />
            About COVEN
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              background: activeTab === 'faq' ? 'rgba(230, 25, 25, 0.15)' : 'transparent',
              border: activeTab === 'faq' ? '1px solid rgba(230, 25, 25, 0.4)' : '1px solid transparent',
              color: activeTab === 'faq' ? 'var(--chalk)' : 'var(--ghost)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Question size={14} weight="bold" color={activeTab === 'faq' ? '#e61919' : 'inherit'} />
            Frequently Asked Questions
          </button>
        </div>

        {/* ── ABOUT TAB ──────────────────────────────────────────── */}
        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
            
            {/* The Mission */}
            <div className="card-industrial" style={{ padding: '28px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--chalk)', textTransform: 'uppercase', marginBottom: '12px' }}>
                Why COVEN Exists
              </h2>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ghost)', lineHeight: 1.7, margin: '0 0 14px 0' }}>
                For over two decades, Torn City has been home to an extraordinarily talented underworld of digital artists, graphic designers, and signature crafters. However, graphic commissions have traditionally been conducted across fragmented forum threads, risky PM negotiations, and unverified Discord channels with high scam risks and no proof of provenance.
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ghost)', lineHeight: 1.7, margin: 0 }}>
                <strong>COVEN</strong> provides the missing infrastructure: real-time auction blocks with anti-snipe extensions, escrow milestone commission studios, automated payment verification via Torn Log Category #4810, cryptographic SHA-256 Certificates of Authenticity, syndicate faction vaults, and a native Tampermonkey UserScript bringing the entire ecosystem directly into Torn.com.
              </p>
            </div>

            {/* 3 Pillars Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--sp-4)' }}>
              <div className="card-industrial" style={{ padding: '20px', borderLeft: '3px solid #e61919' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <UserCircle size={22} color="#e61919" weight="fill" />
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--chalk)', textTransform: 'uppercase' }}>
                    For Collectors
                  </h3>
                </div>
                <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ghost)', lineHeight: 1.65 }}>
                  Bid on exclusive 1/1 digital masters, commission custom animated signatures, store unwatermarked assets in your private Trophy Vault, and export official BBCode for your Torn forum threads.
                </p>
              </div>

              <div className="card-industrial" style={{ padding: '20px', borderLeft: '3px solid #10B981' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <PaintBrush size={22} color="#10B981" weight="fill" />
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--chalk)', textTransform: 'uppercase' }}>
                    For Artists
                  </h3>
                </div>
                <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ghost)', lineHeight: 1.65 }}>
                  Mint artwork with protected security watermarks, receive structured commission requests with milestone deliverables, and let our engine automatically audit buyer payments via Log #4810.
                </p>
              </div>

              <div className="card-industrial" style={{ padding: '20px', borderLeft: '3px solid #818CF8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <ShieldCheck size={22} color="#818CF8" weight="fill" />
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--chalk)', textTransform: 'uppercase' }}>
                    For Factions
                  </h3>
                </div>
                <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ghost)', lineHeight: 1.65 }}>
                  Contract bespoke Ranked War propaganda banners, order coordinated member forum suites, and commission high-impact territory graphics with milestone escrow protections.
                </p>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div
              className="card-industrial"
              style={{
                padding: '24px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                background: 'linear-gradient(135deg, rgba(20, 10, 10, 0.8), rgba(10, 10, 15, 0.95))',
                border: '1px solid rgba(230, 25, 25, 0.3)',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#fff', textTransform: 'uppercase' }}>
                  Ready to explore the marketplace?
                </h3>
                <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ghost)' }}>
                  Browse over 40+ curated digital masterworks or install the in-game Tampermonkey UserScript.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/browse" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Browse Marketplace
                  <ArrowRight size={14} weight="bold" />
                </Link>
                <Link to="/userscript" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Code size={14} weight="bold" />
                  Install Script
                </Link>
              </div>
            </div>

          </div>
        )}

        {/* ── FAQ TAB ────────────────────────────────────────────── */}
        {activeTab === 'faq' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
            
            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {[
                { id: 'all', label: 'All Questions' },
                { id: 'safety', label: 'Account Safety & API' },
                { id: 'economy', label: 'Cash & Provenance' },
                { id: 'userscript', label: 'Tampermonkey Script' },
                { id: 'artists', label: 'Artists & Disputes' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFaqFilter(cat.id)}
                  style={{
                    background: faqFilter === cat.id ? 'rgba(230, 25, 25, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: faqFilter === cat.id ? '1px solid rgba(230, 25, 25, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: faqFilter === cat.id ? '#fff' : 'var(--ghost)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* FAQ Accordion List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={faq.question}
                    className="card-industrial"
                    style={{
                      padding: '16px 20px',
                      cursor: 'pointer',
                      border: isOpen ? '1px solid rgba(230, 25, 25, 0.35)' : '1px solid rgba(255, 255, 255, 0.07)',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <h3
                        style={{
                          margin: 0,
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.9rem',
                          letterSpacing: '-0.01em',
                          color: isOpen ? '#fff' : 'var(--chalk)',
                          textTransform: 'none',
                        }}
                      >
                        {faq.question}
                      </h3>
                      <div style={{ color: isOpen ? 'var(--crimson)' : 'var(--ghost)' }}>
                        {isOpen ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
                      </div>
                    </div>

                    {isOpen && (
                      <p
                        style={{
                          margin: '12px 0 0 0',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.68rem',
                          color: 'var(--ghost)',
                          lineHeight: 1.65,
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          paddingTop: '10px',
                        }}
                      >
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Need More Help Footer */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ghost)', marginBottom: '8px' }}>
                Have a specific question not covered here?
              </p>
              <Link to="/disclosure" style={{ color: 'var(--crimson)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textDecoration: 'none' }}>
                Read our Official Torn API Disclosure & Governance Guidelines →
              </Link>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
