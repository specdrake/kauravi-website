import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Identity from './pages/Identity';
import Struggle from './pages/Struggle';
import MapPage from './pages/MapPage';
import Dictionary from './pages/Dictionary';
import Superadmin from './pages/Superadmin';
import History from './pages/History';
import Blog from './pages/Blog';
import bannerImage from './assets/banner.png';

function App() {
  return (
    <div className="app-container">
      {/* Banner at the absolute top now */}
      <div className="site-banner">
        <img src={bannerImage} alt="Sugarcane field and traditional khaat of Western UP" />
        {/* Overlay: absolute positioned over the full banner */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '1.2rem 2rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {/* Left: title + subtitle */}
            <div>
              <h1 style={{ fontSize: '4rem', margin: 0, lineHeight: 1.1, color: '#fff', textShadow: '2px 2px 6px rgba(0,0,0,0.7)' }}>Kauravi Culture</h1>
              <p style={{ fontSize: '1.25rem', margin: '0.35rem 0 0 0', color: 'rgba(255,255,255,0.92)', textShadow: '1px 1px 4px rgba(0,0,0,0.6)' }}>The Heart of Western UP</p>
            </div>
            {/* Right: Contact button */}
            <a
              href="mailto:admin@kauravi.com"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1.2rem',
                background: 'rgba(255,255,255,0.15)',
                border: '1.5px solid rgba(255,255,255,0.65)',
                borderRadius: '6px',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.95rem',
                textDecoration: 'none',
                backdropFilter: 'blur(6px)',
                flexShrink: 0,
              }}
            >
              ✉ Contact
            </a>
          </div>
        </div>
      </div>

      {/* Navigation directly under the banner */}
      <Navigation />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/identity" element={<Identity />} />
          <Route path="/struggle" element={<Struggle />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/superadmin" element={<Superadmin />} />
          <Route path="/history" element={<History />} />
          <Route path="/blog" element={<Blog />} />
        </Routes>
      </main>

      <footer className="main-footer">
        <div className="container footer-content">
          <p>© {new Date().getFullYear()} Kauravi Culture Portal. Preserving the heritage of Western UP.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
