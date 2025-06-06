import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Resume from './components/Resume';
import Projects from './components/Projects';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import WorksModal from './components/WorksModal';
import './App.css';

function App() {
  const [worksOpen, setWorksOpen] = useState(false);

  return (
    <>
      <Navbar onWorksClick={() => setWorksOpen(true)} />
      <Hero />
      <Resume />
      <Projects />
      <Footer />
      <ScrollToTopButton />
      <WorksModal open={worksOpen} onClose={() => setWorksOpen(false)} />
    </>
  );
}

export default App;
