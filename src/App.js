import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Resume from './components/Resume';
import Projects from './components/Projects';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import WorksPage from './pages/WorksPage';
import './App.css';

const MAX_SCROLL_RETRIES = 20;

export function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const target = location.state?.scrollTarget;
    if (!target) return undefined;

    let attempts = 0;
    let frameId;

    const tryScroll = () => {
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        navigate(location.pathname, { replace: true, state: null });
        return;
      }
      attempts += 1;
      if (attempts < MAX_SCROLL_RETRIES) {
        frameId = requestAnimationFrame(tryScroll);
      }
    };

    frameId = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={(
            <>
              <Hero />
              <Resume />
              <Projects />
              <Footer />
            </>
          )}
        />
        <Route path="/works" element={<WorksPage />} />
      </Routes>
      <ScrollToTopButton />
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
