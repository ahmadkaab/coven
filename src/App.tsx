import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar }        from './components/layout/Navbar';
import { Footer }        from './components/layout/Footer';
import { Home }          from './pages/Home';
import { Browse }        from './pages/Browse';
import { Artists }       from './pages/Artists';
import { ArtistProfile } from './pages/ArtistProfile';
import { ArtworkDetail } from './pages/ArtworkDetail';
import { Login }         from './pages/Login';
import { Dashboard }     from './pages/Dashboard';
import { ListArtwork }   from './pages/ListArtwork';
import { RegisterArtist } from './pages/RegisterArtist';
import { Commissions }   from './pages/Commissions';
import { MarketPulse }   from './pages/MarketPulse';
import { Notifications }    from './pages/Notifications';
import { Dispatches }       from './pages/Dispatches';
import { CollectorProfile } from './pages/CollectorProfile';
import { TradeDesk }        from './pages/TradeDesk';
import { HeistOperations }   from './pages/HeistOperations';
import { AchievementsHub }   from './pages/AchievementsHub';
import { UserScriptInstall } from './pages/UserScriptInstall';
import { PrivacyTerms }      from './pages/PrivacyTerms';
import { AboutFaq }          from './pages/AboutFaq';
import { useAuthStore }      from './store/authStore';

import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Navbar />
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/browse"         element={<Browse />} />
        <Route path="/artists"        element={<Artists />} />
        <Route path="/artists/:id"    element={<ArtistProfile />} />
        <Route path="/artist/:id"     element={<ArtistProfile />} />
        <Route path="/artwork/:id"    element={<ArtworkDetail />} />
        <Route path="/auctions"       element={<Browse />} />
        <Route path="/trade"          element={<TradeDesk />} />
        <Route path="/trade/:id"      element={<TradeDesk />} />
        <Route path="/trade/new"      element={<TradeDesk />} />
        <Route path="/heist"          element={<HeistOperations />} />
        <Route path="/security"       element={<HeistOperations />} />
        <Route path="/achievements"   element={<AchievementsHub />} />
        <Route path="/accolades"      element={<AchievementsHub />} />
        <Route path="/userscript"     element={<UserScriptInstall />} />
        <Route path="/extensions"     element={<UserScriptInstall />} />
        <Route path="/market-pulse"   element={<MarketPulse />} />
        <Route path="/pulse"          element={<MarketPulse />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/about"          element={<AboutFaq defaultTab="about" />} />
        <Route path="/faq"            element={<AboutFaq defaultTab="faq" />} />
        <Route path="/privacy"        element={<PrivacyTerms defaultTab="privacy" />} />
        <Route path="/terms"          element={<PrivacyTerms defaultTab="terms" />} />
        <Route path="/disclosure"     element={<PrivacyTerms defaultTab="disclosure" />} />
        <Route path="/api-disclosure" element={<PrivacyTerms defaultTab="disclosure" />} />
        <Route path="/apply"          element={<ProtectedRoute><RegisterArtist /></ProtectedRoute>} />

        {/* Protected (require auth) */}
        <Route
          path="/list-artwork"
          element={<ProtectedRoute><ListArtwork /></ProtectedRoute>}
        />
        <Route
          path="/register-artist"
          element={<ProtectedRoute><RegisterArtist /></ProtectedRoute>}
        />
        <Route
          path="/commissions"
          element={<Commissions />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/notifications"
          element={<ProtectedRoute><Notifications /></ProtectedRoute>}
        />
        <Route
          path="/dispatches"
          element={<ProtectedRoute><Dispatches /></ProtectedRoute>}
        />
        <Route
          path="/messages"
          element={<ProtectedRoute><Dispatches /></ProtectedRoute>}
        />
        <Route path="/collector/:id"  element={<CollectorProfile />} />
        <Route path="/collector"      element={<CollectorProfile />} />
        <Route path="/user/:id"       element={<CollectorProfile />} />

        {/* 404 */}
        <Route path="*" element={
          <main className="page-content">
            <div className="container" style={{ paddingTop: 'var(--sp-20)', textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(6rem, 18vw, 14rem)',
                lineHeight: 0.85, letterSpacing: '-0.08em', textTransform: 'uppercase',
                color: 'var(--plate)', userSelect: 'none', marginBottom: 'var(--sp-6)',
              }}>404</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                color: 'var(--ghost)', letterSpacing: '0.15em', marginBottom: 'var(--sp-8)',
              }}>[ PAGE NOT FOUND ]</div>
              <a href="/" className="btn btn-industrial">← Back to COVEN</a>
            </div>
          </main>
        } />
      </Routes>
        <Footer />
        <ToastContainer />
      </ToastProvider>
    </BrowserRouter>
  );
}
